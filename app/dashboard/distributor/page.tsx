import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import { 
  Package, Truck, ShoppingCart, IndianRupee, TrendingUp, 
  Activity, Clock, Users, Calendar, ArrowDownLeft, AlertTriangle, 
  Factory, Store, Search, Bell, Download, Zap, Layers 
} from "lucide-react";
import Link from "next/link";
import { 
  SalesTrendChart, 
  InventoryPieChart, 
  WeeklySalesChart, 
  StockMovementChart, 
  TopProductsChart 
} from "@/components/dashboard/DashboardCharts"; 

export const dynamic = "force-dynamic";

// =========================================================
// 1. UTILITY FUNCTIONS
// =========================================================

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', currency: 'INR', maximumFractionDigits: 0 
  }).format(amount);
};

const getIndianDate = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); 
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    TABLET: "#3b82f6", CAPSULE: "#8b5cf6", SYRUP: "#10b981",
    INJECTION: "#ef4444", CREAM: "#ec4899", DROPS: "#f59e0b"
  };
  return colors[type] || "#94a3b8";
};

// =========================================================
// 2. MAIN COMPONENT
// =========================================================

export default async function DistributorDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  // --- DATA FETCHING (Logic Unchanged) ---
  const [user, inventory, incomingShipments, purchaseOrders, salesOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    
    prisma.inventory.findMany({ where: { userId }, include: { batch: { include: { product: true } } } }),
    
    // Stock In (Shipments from Manufacturer)
    prisma.shipment.findMany({ 
      where: { distributorId: userId }, 
      orderBy: { createdAt: 'desc' },
      include: { sender: true, items: true } 
    }),

    // PURCHASE Orders
    prisma.order.findMany({
      where: { receiverId: userId, status: { not: "CANCELLED" } },
      include: { sender: true } 
    }),

    // SALES Orders
    prisma.order.findMany({ 
      where: { senderId: userId, status: { not: "CANCELLED" } }, 
      orderBy: { createdAt: 'desc' },
      include: { receiver: true, items: { include: { product: true } } } 
    })
  ]);

  if (!user) return <div>User not found</div>;

  // --- DATA PROCESSING (Logic Unchanged) ---

  // 1. KPI Metrics
  const totalStock = inventory.reduce((acc, item) => acc + item.currentStock, 0);
  const stockValue = inventory.reduce((acc, item) => acc + (item.currentStock * item.batch.mrp), 0);
  
  // Total Revenue
  const totalRevenue = salesOrders
    .filter(o => o.status === "SHIPPED" || o.status === "DELIVERED" || o.status === "APPROVED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingArrivals = incomingShipments.filter(s => s.status === "IN_TRANSIT").length;
  const pendingOrders = salesOrders.filter(o => o.status === "PENDING").length;

  // 2. Weekly Sales Performance
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7DaysMap = new Map();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = getIndianDate(d);
    last7DaysMap.set(dateKey, { name: days[d.getDay()], sales: 0 });
  }

  salesOrders.forEach(o => {
    if (o.status === "SHIPPED" || o.status === "DELIVERED" || o.status === "APPROVED") {
        const oDate = getIndianDate(o.createdAt);
        if (last7DaysMap.has(oDate)) {
            const entry = last7DaysMap.get(oDate);
            entry.sales += o.totalAmount;
            last7DaysMap.set(oDate, entry);
        }
    }
  });
  const weeklyChartData = Array.from(last7DaysMap.values());

  // 3. Stock In vs Sales Analysis
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const stockFlowMap = new Map();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = monthNames[d.getMonth()];
    stockFlowMap.set(monthKey, { name: monthKey, stockIn: 0, sales: 0 }); 
  }

  incomingShipments.forEach(s => {
    const mIndex = new Date(s.createdAt).getMonth();
    const mName = monthNames[mIndex];
    if (stockFlowMap.has(mName)) {
      const entry = stockFlowMap.get(mName);
      const totalItems = s.items.reduce((sum, item) => sum + item.quantity, 0);
      entry.stockIn += totalItems; 
      stockFlowMap.set(mName, entry);
    }
  });

  salesOrders.forEach(o => {
    if (o.status === "SHIPPED" || o.status === "DELIVERED") {
        const mIndex = new Date(o.createdAt).getMonth();
        const mName = monthNames[mIndex];
        if (stockFlowMap.has(mName)) {
            const entry = stockFlowMap.get(mName);
            const totalItems = o.items.reduce((sum, item) => sum + item.quantity, 0);
            entry.sales += totalItems;
            stockFlowMap.set(mName, entry);
        }
    }
  });
  const stockFlowData = Array.from(stockFlowMap.values());

  const totalReceivedInPeriod = stockFlowData.reduce((a, b) => a + b.stockIn, 0);
  const totalSoldInPeriod = stockFlowData.reduce((a, b) => a + b.sales, 0);
  const calculatedOpeningStock = totalStock - totalReceivedInPeriod + totalSoldInPeriod;

  // 4. Revenue Trend
  const monthlyData = new Array(12).fill(0);
  salesOrders.forEach(o => {
    if (o.status !== "CANCELLED") {
        monthlyData[new Date(o.createdAt).getMonth()] += o.totalAmount;
    }
  });
  const trendChartData = monthNames.map((name, index) => ({ name, revenue: monthlyData[index] }));

  // 5. Inventory Mix
  const typeDistribution = inventory.reduce((acc: any[], curr) => {
    const type = curr.batch.product.type;
    const existing = acc.find((item: any) => item.name === type);
    if (existing) existing.value += curr.currentStock;
    else acc.push({ name: type, value: curr.currentStock, fill: getTypeColor(type) }); 
    return acc;
  }, []);

  // 6. Top Products
  const productSales: Record<string, { revenue: number, count: number, type: string }> = {};
  salesOrders.forEach(order => {
    if (order.status !== "CANCELLED") { 
        order.items.forEach(item => {
            const pName = item.product?.name || "Unknown";
            const pType = item.product?.type || "medicine";
            if (!productSales[pName]) productSales[pName] = { revenue: 0, count: 0, type: pType };
            productSales[pName].revenue += (item.price * item.quantity);
            productSales[pName].count += item.quantity;
        });
    }
  });
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([name, data]) => ({ name, ...data }));

  // ✅ 7. Recent Activity (Fixed Type Issue)
  const recentActivities = [
    ...incomingShipments.map(s => ({ 
        type: 'INCOMING', 
        date: s.createdAt, 
        title: 'Stock Received', 
        desc: `From ${s.sender.name} • ₹${s.totalAmount}`,
        status: s.status // ✅ Added status to fix TS error
    })),
    ...salesOrders.filter(o => o.status !== "CANCELLED").map(o => ({ 
        type: 'ORDER', 
        date: o.createdAt, 
        title: o.status === "PENDING" ? "New Order" : o.status === "SHIPPED" ? "Order Shipped" : "Order Processed", 
        desc: `To ${o.receiver.name} • ₹${o.totalAmount}`,
        status: o.status 
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // 8. Top Manufacturers
  const manuMap: Record<string, number> = {};
  incomingShipments.forEach(s => {
    if (s.sender.role === 'MANUFACTURER') {
       manuMap[s.sender.name] = (manuMap[s.sender.name] || 0) + s.totalAmount;
    }
  });
  if (Object.keys(manuMap).length === 0) {
    purchaseOrders.forEach(o => {
        if (o.sender.role === 'MANUFACTURER') {
            manuMap[o.sender.name] = (manuMap[o.sender.name] || 0) + o.totalAmount;
        }
    });
  }
  const topManufacturers = Object.entries(manuMap).sort(([, a], [, b]) => b - a).slice(0, 4).map(([name, amount]) => ({ name, amount }));

  // 9. Top Retailers
  const retailMap: Record<string, number> = {};
  salesOrders.forEach(o => {
    const role = o.receiver.role ? o.receiver.role.toUpperCase() : "";
    if (role === "RETAILER" && o.status !== "CANCELLED") {
        retailMap[o.receiver.name] = (retailMap[o.receiver.name] || 0) + o.totalAmount;
    }
  });
  const topRetailers = Object.entries(retailMap).sort(([, a], [, b]) => b - a).slice(0, 4).map(([name, amount]) => ({ name, amount }));

  // Action Needed
  const lowStockItems = inventory.filter(item => item.currentStock < 50).slice(0, 3);

  // =========================================================
  // 3. UI RENDER (MODERN BENTO GRID)
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-50/80 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* --- 1. HERO HEADER --- */}
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
           {/* Decorative Background */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-500 mb-2 text-xs font-bold uppercase tracking-wider">
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span> Distributor Portal
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Hello, <span className="text-indigo-600">{user.name.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-slate-500 font-medium">Your supply chain is active. Here is today's overview.</p>
           </div>

           {/* Quick Actions */}
           <div className="relative z-10 flex gap-3 mt-6 md:mt-0">
              <button className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition shadow-sm"><Search size={20}/></button>
              <button className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition shadow-sm relative">
                 <Bell size={20}/>
                 {pendingOrders > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-100"></span>}
              </button>
              <Link href="/dashboard/distributor/place-order" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-95">
                 <ShoppingCart size={18}/> Place Order
              </Link>
           </div>
        </div>

        {/* --- 2. BENTO GRID - KPI --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
           <KPICard title="Confirmed Sales" value={formatCurrency(totalRevenue)} icon={<IndianRupee size={24}/>} color="green"/>
           <KPICard title="Inventory Value" value={formatCurrency(stockValue)} icon={<Activity size={24}/>} color="blue"/>
           <KPICard title="Stock Units" value={totalStock.toLocaleString()} sub="Available" icon={<Package size={24}/>} color="violet"/>
           <KPICard title="Incoming" value={pendingArrivals.toString()} sub="Shipments" icon={<ArrowDownLeft size={24}/>} color="orange"/>
           <KPICard title="Pending Orders" value={pendingOrders.toString()} sub="Action Needed" icon={<ShoppingCart size={24}/>} color="purple"/>
        </div>

        {/* --- 3. MAIN ANALYTICS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Revenue Trend (8 Cols) */}
           <div className="lg:col-span-8 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">Revenue Analysis</h3>
                    <p className="text-sm text-slate-400">Monthly financial performance</p>
                 </div>
                 <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp size={12}/> +5.2%
                 </div>
              </div>
              <div className="h-[320px] w-full"><SalesTrendChart data={trendChartData} /></div>
           </div>

           {/* Inventory Mix (4 Cols) */}
           <div className="lg:col-span-4 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Stock Distribution</h3>
              <p className="text-sm text-slate-400 mb-4">By Medicine Type</p>
              
              <div className="flex-1 relative flex items-center justify-center min-h-[200px]">
                 <InventoryPieChart data={typeDistribution} />
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-800">{typeDistribution.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Types</span>
                 </div>
              </div>
              
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                 {typeDistribution.slice(0, 4).map((t: any, i: number) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-1 bg-slate-50 rounded-md text-slate-600 border border-slate-200 uppercase">{t.name}</span>
                 ))}
              </div>
           </div>
        </div>

        {/* --- 4. SECONDARY ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Weekly Sales (6 Cols) */}
           <div className="lg:col-span-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Weekly Performance</h3>
              <p className="text-sm text-slate-400 mb-6">Sales volume (last 7 days)</p>
              <div className="h-[300px] w-full"><WeeklySalesChart data={weeklyChartData} /></div>
           </div>

           {/* Top Products (6 Cols) */}
           <div className="lg:col-span-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><Zap size={20}/></div>
                 <h3 className="text-lg font-bold text-slate-800">Top Selling Products</h3>
              </div>
              
              <div className="space-y-4">
                 {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition group bg-slate-50/30">
                       <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-100">
                          #{i+1}
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                             <span className="font-bold text-indigo-500 uppercase">{p.type}</span>
                             <span>•</span>
                             <span>{p.count.toLocaleString()} sold</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-slate-900 text-sm">{formatCurrency(p.revenue)}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* --- 5. BOTTOM GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           
           {/* Action Required */}
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                 <AlertTriangle size={20} className="text-red-500"/> Action Needed
              </h3>
              <div className="space-y-3">
                 {lowStockItems.length === 0 ? (
                    <div className="text-center py-8 opacity-50"><p className="text-sm font-bold">All Good!</p></div>
                 ) : (
                    lowStockItems.map(item => (
                       <ActionItem key={item.id} type="Low Stock" title={item.batch.product.name} badge={`${item.currentStock} Left`} color="red" />
                    ))
                 )}
              </div>
           </div>

           {/* Recent Activity */}
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                 <Layers size={20} className="text-blue-500"/> Activity Feed
              </h3>
              <div className="space-y-6 relative border-l-2 border-slate-100 ml-2">
                 {recentActivities.map((act, i) => (
                    <div key={i} className="pl-5 relative">
                       <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${act.type === 'INCOMING' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{new Date(act.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                       <p className="text-xs font-bold text-slate-800">{act.title}</p>
                       <p className="text-[10px] text-slate-500 truncate">{act.desc}</p>
                    </div>
                 ))}
              </div>
           </div>

           {/* Top Manufacturers */}
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                 <Factory size={20} className="text-violet-500"/> Top Suppliers
              </h3>
              <div className="space-y-3">
                 {topManufacturers.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                       <span className="text-xs font-bold text-slate-700">{p.name}</span>
                       <span className="text-[10px] font-mono text-violet-600 font-bold">{formatCurrency(p.amount)}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Top Retailers */}
           <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2 relative z-10">
                 <Store size={20}/> Top Retailers
              </h3>
              <div className="space-y-3 relative z-10">
                 {topRetailers.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/10 border border-white/5 backdrop-blur-sm">
                       <span className="text-xs font-bold">{p.name}</span>
                       <span className="text-[10px] font-mono text-emerald-400">{formatCurrency(p.amount)}</span>
                    </div>
                 ))}
              </div>
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
  const colors: Record<string, string> = { 
    blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white", 
    green: "text-green-600 bg-green-50 group-hover:bg-green-600 group-hover:text-white", 
    orange: "text-orange-600 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white", 
    violet: "text-violet-600 bg-violet-50 group-hover:bg-violet-600 group-hover:text-white", 
    purple: "text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white" 
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl transition-colors duration-300 ${colors[color]}`}>{icon}</div>
        {trend && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><TrendingUp size={12}/> {trend}</span>}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">{value}</h3>
        {sub && <p className="text-xs font-medium text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ActionItem({ type, title, badge, color }: any) {
  const styles = color === 'red' ? "bg-red-50/50 border-red-100 text-red-800" : "bg-orange-50/50 border-orange-100 text-orange-800";
  const iconColor = color === 'red' ? "text-red-500" : "text-orange-500";

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${styles}`}>
      <div className="flex items-center gap-3">
         <div className={`p-1.5 bg-white rounded-lg shadow-sm ${iconColor}`}>
            {color === 'red' ? <AlertTriangle size={14}/> : <Clock size={14}/>}
         </div>
         <div>
            <p className="text-[9px] font-black uppercase opacity-70">{type}</p>
            <p className="text-xs font-bold">{title}</p>
         </div>
      </div>
      <span className="text-[10px] font-bold bg-white px-2 py-1 rounded shadow-sm">{badge}</span>
    </div>
  );
}