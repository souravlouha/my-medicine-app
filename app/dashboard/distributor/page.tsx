import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import { 
  Package, Truck, ShoppingCart, IndianRupee, TrendingUp, 
  Activity, Clock, Users, Calendar, ArrowDownLeft, AlertTriangle, 
  Factory, Store, CheckCircle 
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

  // --- DATA FETCHING ---
  const [user, inventory, incomingShipments, purchaseOrders, salesOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    
    prisma.inventory.findMany({ where: { userId }, include: { batch: { include: { product: true } } } }),
    
    // Stock In (Shipments from Manufacturer)
    prisma.shipment.findMany({ 
      where: { distributorId: userId }, 
      orderBy: { createdAt: 'desc' },
      include: { sender: true, items: true } 
    }),

    // PURCHASE Orders (আমি যখন Receiver = Manufacturer থেকে কিনছি)
    prisma.order.findMany({
      where: { receiverId: userId, status: { not: "CANCELLED" } },
      include: { sender: true } 
    }),

    // SALES Orders (আমি যখন Sender = Retailer কে দিচ্ছি)
    prisma.order.findMany({ 
      where: { senderId: userId, status: { not: "CANCELLED" } }, 
      orderBy: { createdAt: 'desc' },
      include: { receiver: true, items: { include: { product: true } } } 
    })
  ]);

  if (!user) return <div>User not found</div>;

  // --- DATA PROCESSING ---

  // 1. KPI Metrics
  const totalStock = inventory.reduce((acc, item) => acc + item.currentStock, 0);
  const stockValue = inventory.reduce((acc, item) => acc + (item.currentStock * item.batch.mrp), 0);
  
  // Total Revenue (Only Confirmed/Shipped Orders)
  const totalRevenue = salesOrders
    .filter(o => o.status === "SHIPPED" || o.status === "DELIVERED" || o.status === "APPROVED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingArrivals = incomingShipments.filter(s => s.status === "IN_TRANSIT").length;
  const pendingOrders = salesOrders.filter(o => o.status === "PENDING").length;

  // 2. Weekly Sales Performance (Confirmed Orders)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7DaysMap = new Map();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = getIndianDate(d);
    last7DaysMap.set(dateKey, { name: days[d.getDay()], sales: 0 });
  }

  salesOrders.forEach(o => {
    // গ্রাফে পেন্ডিং অর্ডার দেখাবো না, কারণ টাকা আসেনি
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

  // 3. Stock In vs Sales Analysis (Last 6 Months)
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
    // এখানে শুধু Shipped অর্ডার কাউন্ট হবে
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

  // Equation Calculation
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

  // 6. Top Products (Includes Pending Orders)
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

  // ✅ 7. Recent Activity (FIXED: Now shows PENDING orders)
  const recentActivities = [
    ...incomingShipments.map(s => ({ 
        type: 'INCOMING', 
        date: s.createdAt, 
        title: 'Stock Received', 
        desc: `From ${s.sender.name} • ₹${s.totalAmount}` 
    })),
    // এখানে Pending সহ সব অর্ডার আসবে
    ...salesOrders.filter(o => o.status !== "CANCELLED").map(o => ({ 
        type: 'ORDER', 
        date: o.createdAt, 
        title: o.status === "PENDING" ? "New Order" : o.status === "SHIPPED" ? "Order Shipped" : "Order Processed", 
        desc: `To ${o.receiver.name} • ₹${o.totalAmount}`,
        status: o.status // কালার কোডিং এর জন্য
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

  // ✅ 9. Top Retailers (FIXED: Role check + Pending orders included)
  const retailMap: Record<string, number> = {};
  salesOrders.forEach(o => {
    // ১. Role চেক করছি (যদি role ডাটাবেসে থাকে)
    const role = o.receiver.role ? o.receiver.role.toUpperCase() : "";
    
    // ২. শুধু RETAILER এবং Cancelled নয় এমন অর্ডার (Pending হলেও দেখাবে)
    if (role === "RETAILER" && o.status !== "CANCELLED") {
        retailMap[o.receiver.name] = (retailMap[o.receiver.name] || 0) + o.totalAmount;
    }
  });
  const topRetailers = Object.entries(retailMap).sort(([, a], [, b]) => b - a).slice(0, 4).map(([name, amount]) => ({ name, amount }));

  // Action Needed
  const lowStockItems = inventory.filter(item => item.currentStock < 50).slice(0, 3);

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-2 text-xs font-bold uppercase tracking-wider">
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Distributor Portal
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
             <Calendar size={14} /> {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <Link href="/dashboard/distributor/place-order" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg active:scale-95">
             <ShoppingCart size={16}/> Place B2B Order
          </Link>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
         <KPICard title="Confirmed Sales" value={formatCurrency(totalRevenue)} icon={<IndianRupee size={22}/>} color="green"/>
         <KPICard title="Inventory Value" value={formatCurrency(stockValue)} icon={<Activity size={22}/>} color="blue"/>
         <KPICard title="Stock Units" value={totalStock.toLocaleString()} sub="Available" icon={<Package size={22}/>} color="violet"/>
         <KPICard title="Incoming" value={pendingArrivals.toString()} sub="Shipments" icon={<ArrowDownLeft size={22}/>} color="orange"/>
         <KPICard title="Pending Orders" value={pendingOrders.toString()} sub="Action Needed" icon={<ShoppingCart size={22}/>} color="purple"/>
      </div>

      {/* ROW 1: Revenue & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue Trend (Monthly)</h3>
          <div className="h-[400px] w-full"><SalesTrendChart data={trendChartData} /></div>
        </div>
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Stock Distribution</h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-4">By Medicine Type</p>
          <div className="flex-1 relative flex items-center justify-center min-h-[250px]">
             <InventoryPieChart data={typeDistribution} />
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{typeDistribution.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Categories</span>
             </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Weekly Performance & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800">Weekly Performance</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Last 7 Days Sales</p>
           </div>
           <div className="h-[400px] w-full"><WeeklySalesChart data={weeklyChartData} /></div>
        </div>
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-blue-500" size={18} /> Top Products</h3>
          </div>
          <div className="space-y-5">
             {topProducts.map((p, i) => (
                <div key={i} className="group">
                   <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>#{i + 1}</div>
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

      {/* ROW 3: Stock Received vs Sales (Fixed Summary Logic) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           
           <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="text-violet-500" size={18} /> Inventory Flow Analysis
                </h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Stock Movement (Last 6 Months)</p>
              </div>

              {/* Full Equation Display */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                  
                  {/* 1. Opening Stock */}
                  <div className="text-center min-w-[70px]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Previous</p>
                    <p className="text-xs font-bold text-slate-600">
                      {calculatedOpeningStock > 0 ? calculatedOpeningStock : 0}
                    </p>
                  </div>

                  <span className="text-slate-400 font-bold text-xs">+</span>

                  {/* 2. Received */}
                  <div className="text-center min-w-[70px]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Received</p>
                    <p className="text-xs font-bold text-violet-600">{totalReceivedInPeriod}</p>
                  </div>

                  <span className="text-slate-400 font-bold text-xs">-</span>

                  {/* 3. Sold */}
                  <div className="text-center min-w-[70px]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Sold</p>
                    <p className="text-xs font-bold text-blue-600">{totalSoldInPeriod}</p>
                  </div>

                  <span className="text-slate-400 font-bold text-xs">=</span>

                  {/* 4. Current Stock */}
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-center min-w-[80px] shadow-sm">
                    <p className="text-[9px] font-bold text-green-600 uppercase">Available</p>
                    <p className="text-sm font-black text-slate-800">{totalStock}</p>
                  </div>
              </div>
           </div>

           <div className="h-[350px] w-full">
              <StockMovementChart data={stockFlowData} />
           </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-6"> 
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><AlertTriangle className="text-red-500" size={18} /> Action Needed</h3>
           <div className="space-y-3 flex-1">
              {lowStockItems.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8"><TrendingUp size={32} className="mb-2 text-emerald-500"/><p className="font-bold text-sm">Everything looks good!</p></div>
              ) : (
                 lowStockItems.map(item => (<ActionItem key={item.id} type="Low Stock" title={item.batch.product.name} badge={`${item.currentStock} Left`} color="red" />))
              )}
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><Factory className="text-violet-500" size={18} /> Top Manufacturers</h3>
           <div className="space-y-3 flex-1">
              {topManufacturers.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8"><p className="font-bold text-sm">No purchases yet</p></div>
              ) : (
                topManufacturers.map((p, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/50 transition">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm border border-slate-100">{p.name.charAt(0)}</div>
                       <div><p className="text-xs font-bold text-slate-700">{p.name}</p><p className="text-[10px] text-slate-400 font-medium">{formatCurrency(p.amount)}</p></div>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${i===0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>#{i+1}</div>
                 </div>
              )))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><Store className="text-green-500" size={18} /> Top Retailers</h3>
           <div className="space-y-3 flex-1">
              {topRetailers.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8"><p className="font-bold text-sm text-slate-400">No retailers found</p></div>
              ) : (
                topRetailers.map((p, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/50 transition">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm border border-slate-100">{p.name.charAt(0)}</div>
                       <div><p className="text-xs font-bold text-slate-700">{p.name}</p><p className="text-[10px] text-slate-400 font-medium">{formatCurrency(p.amount)}</p></div>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${i===0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>#{i+1}</div>
                 </div>
              )))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><Clock className="text-blue-500" size={18} /> Recent Activity</h3>
           <div className="space-y-0">
              {recentActivities.map((act, i) => (
                 <div key={i} className="relative pl-6 pb-6 border-l border-slate-100 last:pb-0 last:border-0">
                    <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${act.type === 'INCOMING' ? 'bg-orange-500' : act.status === 'PENDING' ? 'bg-purple-500' : 'bg-blue-500'}`} />
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

// SUB-COMPONENTS
function KPICard({ title, value, trend, sub, icon, color }: any) {
  const colors: Record<string, string> = { blue: "text-blue-600 bg-blue-50", green: "text-green-600 bg-green-50", orange: "text-orange-600 bg-orange-50", violet: "text-violet-600 bg-violet-50", purple: "text-purple-600 bg-purple-50" };
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