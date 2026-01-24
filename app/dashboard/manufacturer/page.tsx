import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // ✅ ফিক্স: auth ইমপোর্ট করা হলো
import { SalesTrendChart, InventoryPieChart, TopProductsChart, WeeklySalesChart } from "@/components/dashboard/DashboardCharts"; 
import { AlertTriangle, TrendingUp, Package, DollarSign, Users, Activity, Clock, Truck } from "lucide-react";
import ManufacturerHeader from "@/components/dashboard/ManufacturerHeader";

export default async function ManufacturerDashboard() {
  // ✅ ফিক্স: কুকির বদলে সেশন থেকে আইডি নেওয়া হচ্ছে
  const session = await auth();
  const userId = session?.user?.id;

  // যদি ইউজার না থাকে, লগইনে পাঠাও
  if (!userId) {
    redirect("/login");
  }

  // =========================================================
  // 1. DATA FETCHING (বাকি সব কোড ঠিক আছে)
  // =========================================================
  const [user, inventory, shipments, recalls, batches, topPartners] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),

    prisma.inventory.findMany({
      where: { userId },
      include: { batch: { include: { product: true } } }
    }),

    prisma.shipment.findMany({
      where: { manufacturerId: userId },
      orderBy: { createdAt: 'desc' }, 
      include: { items: { include: { batch: { include: { product: true } } } } }
    }),

    prisma.recall.findMany({
      where: { issuedBy: userId },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.batch.findMany({
      where: { manufacturerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { product: true }
    }),

    prisma.shipment.groupBy({
      by: ['distributorId'],
      where: { manufacturerId: userId },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 3
    })
  ]);

  if (!user) return <div className="p-10 text-center">User not found</div>;

  // =========================================================
  // 2. DATA PROCESSING
  // =========================================================
  
  // A. KPI Metrics
  const totalRevenue = shipments.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const activeRecalls = recalls.filter(r => r.status === "ACTIVE").length;

  // B. Weekly Sales Data (Last 7 Days)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyDataMap = new Array(7).fill(0).map((_, i) => ({ day: days[i], sales: 0 }));
  
  shipments.forEach(s => {
    const d = new Date(s.createdAt);
    if(new Date().getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000) {
       weeklyDataMap[d.getDay()].sales += s.totalAmount;
    }
  });

  // C. Monthly Revenue Trend
  const chartData = shipments.reduce((acc: any[], curr) => {
    const month = new Date(curr.createdAt).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.name === month);
    if (existing) existing.revenue += curr.totalAmount;
    else acc.push({ name: month, revenue: curr.totalAmount });
    return acc;
  }, []);

  // D. Product Type Distribution
  const typeDistribution = inventory.reduce((acc: any[], curr) => {
    const type = curr.batch.product.type;
    const existing = acc.find(item => item.name === type);
    if (existing) existing.value += curr.currentStock;
    else acc.push({ name: type, value: curr.currentStock });
    return acc;
  }, []);

  // E. Top Products
  const productSales: Record<string, number> = {};
  shipments.forEach(shipment => {
    shipment.items.forEach(item => {
      const pName = item.batch.product.name;
      if (productSales[pName]) productSales[pName] += (item.price * item.quantity);
      else productSales[pName] = (item.price * item.quantity);
    });
  });
  const topProductsData = Object.entries(productSales)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value).slice(0, 5);

  // F. RECENT ACTIVITY LOG
  const activities = [
    ...shipments.map(s => ({ type: 'SHIPMENT', date: s.createdAt, title: `Shipment Sent`, desc: `ID: ${s.shipmentId} - ₹${s.totalAmount}` })),
    ...batches.map(b => ({ type: 'BATCH', date: b.createdAt, title: `Batch Created`, desc: `${b.product.name} (${b.batchNumber})` })),
    ...recalls.map(r => ({ type: 'RECALL', date: r.createdAt, title: `Recall Issued`, desc: `Reason: ${r.reason}` }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  // G. Alerts
  const lowStockItems = inventory.filter(item => item.currentStock < 50);

  const partnerDetails = await Promise.all(
    topPartners.map(async (p) => {
      const u = await prisma.user.findUnique({ where: { id: p.distributorId } });
      return { name: u?.name, amount: p._sum.totalAmount };
    })
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* ✅ ফিক্স: as any দিয়ে টাইপ এরর এড়ানো হলো */}
      <ManufacturerHeader user={user as any} />

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
           <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={24} /></div>
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-800">₹{(totalRevenue / 100000).toFixed(2)}L</h3>
              <p className="text-xs text-green-500 font-bold flex items-center"><TrendingUp size={12} className="mr-1"/> +12.5%</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
           <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><Package size={24} /></div>
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Units</p>
              <h3 className="text-2xl font-black text-gray-800">{totalStock.toLocaleString()}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
           <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Users size={24} /></div>
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Active Partners</p>
              <h3 className="text-2xl font-black text-gray-800">{partnerDetails.length}</h3>
           </div>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition ${activeRecalls > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-green-100'}`}>
           <div className={`p-4 rounded-xl ${activeRecalls > 0 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}><AlertTriangle size={24} /></div>
           <div>
              <p className={`text-xs font-bold uppercase ${activeRecalls > 0 ? 'text-red-400' : 'text-gray-400'}`}>Active Recalls</p>
              <h3 className={`text-2xl font-black ${activeRecalls > 0 ? 'text-red-700' : 'text-gray-800'}`}>{activeRecalls}</h3>
           </div>
        </div>
      </div>

      {/* 2. Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <SalesTrendChart data={chartData} />
         <WeeklySalesChart data={weeklyDataMap} />
      </div>

      {/* 3. Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <TopProductsChart data={topProductsData} />
         </div>
         <div className="lg:col-span-1">
            <InventoryPieChart data={typeDistribution} />
         </div>
      </div>

      {/* 4. Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Activity Log */}
         <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-800 flex items-center gap-2"><Clock size={18} /> Recent Activity Log</h3>
               <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Real-time</span>
            </div>
            <div className="divide-y divide-gray-50">
               {activities.length === 0 && <p className="p-6 text-center text-gray-400">No recent activity.</p>}
               {activities.map((act, i) => (
                 <div key={i} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition">
                    <div className={`mt-1 p-2 rounded-lg ${
                       act.type === 'SHIPMENT' ? 'bg-blue-100 text-blue-600' : 
                       act.type === 'BATCH' ? 'bg-green-100 text-green-600' : 
                       'bg-red-100 text-red-600'
                    }`}>
                       {act.type === 'SHIPMENT' ? <Truck size={16} /> : act.type === 'BATCH' ? <Package size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-gray-800">{act.title}</p>
                       <p className="text-xs text-gray-500 mt-0.5">{act.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                       {new Date(act.date).toLocaleDateString()}
                    </span>
                 </div>
               ))}
            </div>
         </div>

         {/* Alerts & Partners */}
         <div className="space-y-8">
             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-red-50/50 flex justify-between items-center">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2"><Activity size={18} className="text-red-500"/> Action Needed</h3>
                </div>
                <div className="p-4 space-y-3">
                   {lowStockItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                         <div>
                            <p className="text-xs font-bold text-red-800">Low Stock</p>
                            <p className="text-[10px] text-red-500">{item.batch.product.name}</p>
                         </div>
                         <span className="bg-white text-red-600 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{item.currentStock} left</span>
                      </div>
                   ))}
                   {batches.slice(0, 3).filter(b => new Date(b.expDate) < new Date(new Date().setMonth(new Date().getMonth() + 3))).map(batch => (
                      <div key={batch.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                         <div>
                            <p className="text-xs font-bold text-orange-800">Expiring</p>
                            <p className="text-[10px] text-orange-500">{batch.product.name}</p>
                         </div>
                         <span className="text-orange-600 text-xs font-bold">⚠️</span>
                      </div>
                   ))}
                   {lowStockItems.length === 0 && batches.filter(b => new Date(b.expDate) < new Date(new Date().setMonth(new Date().getMonth() + 3))).length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-xs">All clear! ✅</div>
                   )}
                </div>
             </div>

             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="font-bold text-gray-800">🏆 Top Partners</h3>
                </div>
                <div className="divide-y divide-gray-50">
                   {partnerDetails.map((p, i) => (
                     <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${i===0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>#{i+1}</div>
                           <p className="text-xs font-bold text-gray-700">{p.name}</p>
                        </div>
                        <p className="text-xs font-mono font-bold text-blue-600">₹{(p.amount! / 1000).toFixed(1)}k</p>
                     </div>
                   ))}
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}