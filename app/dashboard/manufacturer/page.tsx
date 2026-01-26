import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SalesTrendChart, InventoryPieChart, WeeklySalesChart, ProductionVsSalesChart } from "@/components/dashboard/DashboardCharts"; 
import { 
  AlertTriangle, TrendingUp, Package, IndianRupee, Users, 
  Activity, Clock, Droplets, Pill, Syringe, 
  MoreHorizontal, Calendar, Factory
} from "lucide-react";

// ✅ UPDATE: পেজ ক্যাশিং বন্ধ করে রিয়েল-টাইম ডাটা দেখানোর জন্য
export const dynamic = "force-dynamic"; 

// =========================================================
// 1. UTILITY FUNCTIONS & CONFIG
// =========================================================

// ✅ ভারতীয় কারেন্সি ফরম্যাটার
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(amount);
};

// ✅ INDIAN DATE HELPER (Timezone Fix) 
const getIndianDate = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-CA", { 
    timeZone: "Asia/Kolkata" 
  }); 
};

// ✅ মেডিসিন টাইপ অনুযায়ী কালার প্যালেট
const MEDICINE_COLORS: Record<string, string> = {
  TABLET: "#3b82f6",    // Blue
  CAPSULE: "#8b5cf6",   // Violet
  SYRUP: "#10b981",     // Emerald
  INJECTION: "#ef4444", // Red
  CREAM: "#ec4899",     // Pink
  DROPS: "#f59e0b",     // Amber
};

const getTypeColor = (type: string) => MEDICINE_COLORS[type] || "#94a3b8";

// =========================================================
// 2. MAIN COMPONENT
// =========================================================

export default async function ManufacturerDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  // --- DATA FETCHING ---
  const [user, inventory, shipments, recalls, batches, topPartners] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.inventory.findMany({ where: { userId }, include: { batch: { include: { product: true } } } }),
    prisma.shipment.findMany({ where: { manufacturerId: userId }, orderBy: { createdAt: 'desc' }, include: { items: { include: { batch: { include: { product: true } } } } } }),
    prisma.recall.findMany({ where: { issuedBy: userId }, orderBy: { createdAt: 'desc' } }),
    prisma.batch.findMany({ where: { manufacturerId: userId }, orderBy: { createdAt: 'desc' }, include: { product: true } }),
    prisma.shipment.groupBy({ by: ['distributorId'], where: { manufacturerId: userId }, _sum: { totalAmount: true }, orderBy: { _sum: { totalAmount: 'desc' } }, take: 4 })
  ]);

  if (!user) return <div className="p-10 text-center text-slate-500">User profile not found.</div>;

  // --- DATA PROCESSING ---

  // KPI Metrics
  const totalRevenue = shipments.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const activeRecalls = recalls.filter(r => r.status === "ACTIVE").length;

  // ✅ Weekly Sales Logic (FIXED WITH IST TIMEZONE)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7DaysMap = new Map();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = getIndianDate(d); 
    last7DaysMap.set(dateKey, { name: days[d.getDay()], sales: 0 });
  }

  shipments.forEach(s => {
    const sDate = getIndianDate(s.createdAt);
    
    if (last7DaysMap.has(sDate)) {
      const entry = last7DaysMap.get(sDate);
      entry.sales += s.totalAmount;
      last7DaysMap.set(sDate, entry);
    }
  });

  const weeklyChartData = Array.from(last7DaysMap.values());

  // ✅ NEW: Production vs Sales Logic (Last 6 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const prodSalesMap = new Map();

  // গত ৬ মাসের সেটআপ
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = monthNames[d.getMonth()];
    prodSalesMap.set(monthKey, { name: monthKey, production: 0, sales: 0 });
  }

  // Production Count (From Batches)
  batches.forEach(b => {
    const mIndex = new Date(b.createdAt).getMonth();
    const mName = monthNames[mIndex];
    if (prodSalesMap.has(mName)) {
      const entry = prodSalesMap.get(mName);
      entry.production += b.totalQuantity; 
      prodSalesMap.set(mName, entry);
    }
  });

  // Sales Count (From Shipments)
  shipments.forEach(s => {
    const mIndex = new Date(s.createdAt).getMonth();
    const mName = monthNames[mIndex];
    if (prodSalesMap.has(mName)) {
      const entry = prodSalesMap.get(mName);
      const totalItems = s.items.reduce((sum, item) => sum + item.quantity, 0);
      entry.sales += totalItems;
      prodSalesMap.set(mName, entry);
    }
  });

  const productionSalesData = Array.from(prodSalesMap.values());

  // Monthly Trend (Revenue)
  const monthlyData = new Array(12).fill(0);
  shipments.forEach(s => {
    const mIndex = new Date(s.createdAt).getMonth(); 
    monthlyData[mIndex] += s.totalAmount;
  });

  const trendChartData = monthNames.map((name, index) => ({
    name,
    revenue: monthlyData[index]
  }));

  // Inventory Mix
  const typeDistribution = inventory.reduce((acc: any[], curr) => {
    const type = curr.batch.product.type;
    const existing = acc.find((item: any) => item.name === type);
    if (existing) existing.value += curr.currentStock;
    else acc.push({ name: type, value: curr.currentStock, fill: getTypeColor(type) }); 
    return acc;
  }, []);

  // Top Selling Products
  const productSales: Record<string, { revenue: number, count: number, type: string }> = {};
  shipments.forEach(shipment => {
    shipment.items.forEach(item => {
      const p = item.batch.product;
      if (!productSales[p.name]) productSales[p.name] = { revenue: 0, count: 0, type: p.type };
      productSales[p.name].revenue += (item.price * item.quantity);
      productSales[p.name].count += item.quantity;
    });
  });
  
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([name, data]) => ({ name, ...data }));

  // Activities
  const activities = [
    ...shipments.map(s => ({ type: 'SHIPMENT', date: s.createdAt, title: 'Order Dispatched', desc: `To Distributor • ${formatCurrency(s.totalAmount)}` })),
    ...batches.map(b => ({ type: 'BATCH', date: b.createdAt, title: 'Batch Produced', desc: `${b.product.name} • #${b.batchNumber}` })),
    ...recalls.map(r => ({ type: 'RECALL', date: r.createdAt, title: 'Recall Issued', desc: `Reason: ${r.reason}` }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const lowStockItems = inventory.filter(item => item.currentStock < 100).slice(0, 3);
  const expiringBatches = batches.filter(b => {
    const daysLeft = Math.ceil((new Date(b.expDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysLeft > 0 && daysLeft <= 90;
  }).slice(0, 3);

  const partners = await Promise.all(topPartners.map(async (p) => {
    const u = await prisma.user.findUnique({ where: { id: p.distributorId } });
    return { name: u?.name || "Unknown", amount: p._sum.totalAmount || 0 };
  }));

  // =========================================================
  // 3. UI RENDER
  // =========================================================
  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-2 text-xs font-bold uppercase tracking-wider">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             System Operational
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
             <Calendar size={14} />
             {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg active:scale-95">
             <TrendingUp size={16}/> View Reports
          </button>
        </div>
      </div>

      {/* --- KPI STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} trend="+12.5%" icon={<IndianRupee size={22} />} color="blue"/>
        <KPICard title="Total Units" value={totalStock.toLocaleString()} sub="In Inventory" icon={<Package size={22} />} color="violet"/>
        <KPICard title="Distributors" value={partners.length.toString()} sub="Active Partners" icon={<Users size={22} />} color="orange"/>
        <KPICard title="System Alerts" value={activeRecalls.toString()} sub={activeRecalls > 0 ? "Requires Attention" : "All Clear"} icon={<AlertTriangle size={22} />} color={activeRecalls > 0 ? "red" : "emerald"}/>
      </div>

      {/* --- MAIN ANALYTICS ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Revenue Trend</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Monthly Performance (Jan - Dec)</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-slate-400 cursor-pointer hover:bg-slate-100"><MoreHorizontal size={18} /></div>
          </div>
          <div className="h-[450px] w-full">
             <SalesTrendChart data={trendChartData} />
          </div>
        </div>

        {/* Inventory Mix */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Inventory Mix</h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-4">Stock by Medicine Type</p>
          <div className="flex-1 relative flex items-center justify-center min-h-[250px]">
             <InventoryPieChart data={typeDistribution} />
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{typeDistribution.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Categories</span>
             </div>
          </div>
        </div>
      </div>

      {/* --- SECONDARY ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Performance (Left - Big) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800">Weekly Performance</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Last 7 Days Sales</p>
           </div>
           <div className="h-[400px] w-full">
              <WeeklySalesChart data={weeklyChartData} />
           </div>
        </div>

        {/* Top Selling Products (Right - Small) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-blue-500" size={18} /> Top Products</h3>
             <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">View All</button>
          </div>
          <div className="space-y-5">
             {topProducts.map((p, i) => (
                <div key={i} className="group">
                   <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm transition-colors ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>#{i + 1}</div>
                         <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wide"><span style={{ color: getTypeColor(p.type) }}>{p.type}</span><span>•</span><span>{p.count.toLocaleString()} sold</span></div>
                         </div>
                      </div>
                      <p className="font-bold text-slate-800 text-sm">{formatCurrency(p.revenue)}</p>
                   </div>
                   <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden"><div className="h-full rounded-full opacity-80 group-hover:opacity-100 transition-all duration-500" style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%`, backgroundColor: getTypeColor(p.type) }} /></div>
                </div>
             ))}
          </div>
        </div>

      </div>

      {/* --- THIRD ROW: PRODUCTION VS SALES (NEW) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Factory className="text-violet-500" size={18} /> Production vs Sales Analysis
              </h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Last 6 Months Volume Comparison</p>
           </div>
           <div className="h-[350px] w-full">
              <ProductionVsSalesChart data={productionSalesData} />
           </div>
        </div>
      </div>

      {/* --- BOTTOM ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6"> 
        
        {/* 1. Action Required */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><Activity className="text-red-500" size={18} /> Action Needed</h3>
           <div className="space-y-3 flex-1">
              {lowStockItems.length === 0 && expiringBatches.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8"><TrendingUp size={32} className="mb-2 text-emerald-500"/><p className="font-bold text-sm">Everything looks good!</p></div>
              ) : (
                 <>{lowStockItems.map(item => (<ActionItem key={item.id} type="Low Stock" title={item.batch.product.name} badge={`${item.currentStock} Left`} color="red" />))}{expiringBatches.map(batch => (<ActionItem key={batch.id} type="Expiring" title={batch.product.name} badge={new Date(batch.expDate).toLocaleDateString()} color="orange" />))}</>
              )}
           </div>
        </div>

        {/* 2. Top Partners */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><Users className="text-violet-500" size={18} /> Top Partners</h3>
           <div className="space-y-3 flex-1">
              {partners.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8"><p className="font-bold text-sm">No partners yet</p></div>
              ) : (
                 partners.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/50 hover:border-violet-100 transition">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm border border-slate-100">{p.name.charAt(0)}</div>
                          <div><p className="text-xs font-bold text-slate-700">{p.name}</p><p className="text-[10px] text-slate-400 font-medium">{formatCurrency(p.amount)} Vol</p></div>
                       </div>
                       <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${i===0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>#{i+1}</div>
                    </div>
                 ))
              )}
           </div>
        </div>

        {/* 3. Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><Clock className="text-blue-500" size={18} /> Recent Activity</h3>
           <div className="space-y-0">
              {activities.map((act, i) => (
                 <div key={i} className="relative pl-6 pb-6 border-l border-slate-100 last:pb-0 last:border-0">
                    <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${act.type === 'SHIPMENT' ? 'bg-blue-500' : act.type === 'BATCH' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="flex justify-between items-start">
                       <div><p className="text-sm font-bold text-slate-800">{act.title}</p><p className="text-xs text-slate-500 mt-0.5">{act.desc}</p></div>
                       <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">{new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================
// 4. SUB-COMPONENTS
// =========================================================

function KPICard({ title, value, trend, sub, icon, color }: any) {
  const colors: Record<string, string> = { blue: "text-blue-600 bg-blue-50", violet: "text-violet-600 bg-violet-50", orange: "text-orange-600 bg-orange-50", red: "text-red-600 bg-red-50", emerald: "text-emerald-600 bg-emerald-50" };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-3"><div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>{trend && (<span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"><TrendingUp size={10}/> {trend}</span>)}</div>
      <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p><h3 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{value}</h3>{sub && <p className="text-[10px] font-bold text-slate-400 mt-1 opacity-80">{sub}</p>}</div>
    </div>
  );
}

function ActionItem({ type, title, badge, color }: any) {
  const styles = color === 'red' ? "bg-red-50/50 border-red-100 text-red-900" : "bg-orange-50/50 border-orange-100 text-orange-900";
  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${styles}`}>
      <div><p className="text-[9px] font-black uppercase opacity-60 mb-0.5">{type}</p><p className="text-xs font-bold">{title}</p></div>
      <span className="text-[10px] font-bold bg-white px-2 py-1 rounded shadow-sm">{badge}</span>
    </div>
  );
}