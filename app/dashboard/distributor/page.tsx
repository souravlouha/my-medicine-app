import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ ফিক্স ১: কুকির বদলে auth ইম্পোর্ট
import { redirect } from "next/navigation";
// ❌ ManufacturerHeader এখান থেকে সরিয়ে দেওয়া হয়েছে (Layout-এ আছে তাই)
import { Package, Truck, ShoppingCart, DollarSign, ArrowDownLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { InventoryValueChart, OrderStatusChart } from "./components/DistributorCharts";

export default async function DistributorDashboard() {
  // ✅ ফিক্স ২: কুকির বদলে সেশন ব্যবহার (লগইন স্ট্যাবল করার জন্য)
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // =========================================================
  // 1. DATA FETCHING
  // =========================================================
  const [user, inventory, incomingShipments, receivedOrders, allOrders] = await Promise.all([
    // A. User Details
    prisma.user.findUnique({ where: { id: userId } }),
    
    // B. Inventory
    prisma.inventory.findMany({ 
      where: { userId },
      include: { batch: { include: { product: true } } }
    }),

    // C. Incoming Shipments
    prisma.shipment.findMany({
      where: { distributorId: userId, status: "IN_TRANSIT" },
      orderBy: { createdAt: 'desc' },
      include: { sender: true }
    }),

    // D. Retailer Orders
    prisma.order.findMany({
      where: { receiverId: userId, status: "PENDING" },
      orderBy: { createdAt: 'desc' },
      include: { sender: true }
    }),

    // E. All Orders (For Charts)
    prisma.order.findMany({
      where: { 
        OR: [
          { senderId: userId },   // Orders I placed
          { receiverId: userId }  // Orders I received
        ]
      }
    })
  ]);

  if (!user) return <div>User not found</div>;

  // =========================================================
  // 2. STATS CALCULATION
  // =========================================================
  const totalStock = inventory.reduce((acc, item) => acc + item.currentStock, 0);
  const stockValue = inventory.reduce((acc, item) => acc + (item.currentStock * item.batch.mrp), 0);

  // 📊 Chart Data
  const valueByType: Record<string, number> = {};
  inventory.forEach(item => {
    const type = item.batch.product.type;
    const value = item.currentStock * item.batch.mrp;
    valueByType[type] = (valueByType[type] || 0) + value;
  });
  const pieData = Object.entries(valueByType).map(([name, value]) => ({ 
    name, 
    value: Math.round(value)
  }));

  const statusCounts: Record<string, number> = { PENDING: 0, APPROVED: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
  allOrders.forEach(order => {
    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status]++;
    }
  });
  const orderBarData = [
    { name: 'Pending', count: statusCounts.PENDING },
    { name: 'Approved', count: statusCounts.APPROVED },
    { name: 'Shipped', count: statusCounts.SHIPPED },
    { name: 'Delivered', count: statusCounts.DELIVERED },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 p-6">
      
      {/* ❌ এখান থেকে <ManufacturerHeader /> সরিয়ে দেওয়া হয়েছে */}

      {/* 🟢 1. KPI STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* My Stock */}
         <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Package size={24}/></div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase">Current Stock</p>
               <h3 className="text-2xl font-black text-gray-800">{totalStock.toLocaleString()} <span className="text-xs text-gray-400">Units</span></h3>
            </div>
         </div>
         
         {/* Stock Value */}
         <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="p-4 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24}/></div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase">Inventory Value</p>
               <h3 className="text-2xl font-black text-gray-800">₹{(stockValue/1000).toFixed(1)}k</h3>
            </div>
         </div>

         {/* Incoming Alert */}
         <Link href="/dashboard/distributor/incoming" className="bg-orange-50 p-6 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
            <div className="p-4 bg-white text-orange-600 rounded-xl shadow-sm group-hover:scale-110 transition"><ArrowDownLeft size={24}/></div>
            <div>
               <p className="text-xs font-bold text-orange-400 uppercase">Incoming</p>
               <h3 className="text-2xl font-black text-gray-800">{incomingShipments.length}</h3>
               <p className="text-[10px] text-orange-600 font-bold">Needs Receiving</p>
            </div>
         </Link>

         {/* Orders Alert */}
         <Link href="/dashboard/distributor/orders" className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
            <div className="p-4 bg-white text-purple-600 rounded-xl shadow-sm group-hover:scale-110 transition"><ShoppingCart size={24}/></div>
            <div>
               <p className="text-xs font-bold text-purple-400 uppercase">New Orders</p>
               <h3 className="text-2xl font-black text-gray-800">{receivedOrders.length}</h3>
               <p className="text-[10px] text-purple-600 font-bold">From Retailers</p>
            </div>
         </Link>
      </div>

      {/* 📊 2. ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <InventoryValueChart data={pieData} />
         <OrderStatusChart data={orderBarData} />
      </div>

      {/* 🟠 3. MAIN SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* Incoming Shipments */}
         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Truck size={18} className="text-orange-500"/> Incoming Shipments
               </h3>
               <Link href="/dashboard/distributor/incoming" className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold hover:bg-orange-200">
                  View All
               </Link>
            </div>
            <div className="divide-y divide-gray-50 flex-1">
               {incomingShipments.length === 0 && (
                 <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                    <Package className="text-gray-300 mb-2" size={32}/>
                    <p className="text-gray-400 text-sm">No incoming shipments.</p>
                 </div>
               )}
               {incomingShipments.slice(0, 3).map((ship) => (
                  <div key={ship.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                     <div>
                        <p className="text-sm font-bold text-gray-800">{ship.sender.name}</p>
                        <p className="text-xs text-gray-500 font-mono">ID: {ship.shipmentId}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">₹{ship.totalAmount.toLocaleString()}</p>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded animate-pulse">In-Transit</span>
                     </div>
                  </div>
               ))}
            </div>
            {incomingShipments.length > 0 && (
               <div className="p-4 border-t border-gray-100 bg-orange-50/30">
                  <Link href="/dashboard/distributor/incoming" className="w-full block text-center bg-gray-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-black transition">
                     Receive Stock Now
                  </Link>
               </div>
            )}
         </div>

         {/* Retailer Orders */}
         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-purple-500"/> Pending Orders
               </h3>
               <Link href="/dashboard/distributor/orders" className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold hover:bg-purple-200">
                  Manage
               </Link>
            </div>
            <div className="divide-y divide-gray-50 flex-1">
               {receivedOrders.length === 0 && (
                 <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                    <ShoppingCart className="text-gray-300 mb-2" size={32}/>
                    <p className="text-gray-400 text-sm">No new orders from retailers.</p>
                 </div>
               )}
               {receivedOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                     <div>
                        <p className="text-sm font-bold text-gray-800">{order.sender.name}</p>
                        <p className="text-xs text-gray-500 font-mono">Order #{order.orderId}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-bold text-green-600">₹{order.totalAmount.toLocaleString()}</p>
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-bold">New</span>
                     </div>
                  </div>
               ))}
            </div>
            {receivedOrders.length > 0 && (
               <div className="p-4 border-t border-gray-100 bg-purple-50/30">
                  <Link href="/dashboard/distributor/orders" className="w-full block text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
                     Process Orders
                  </Link>
               </div>
            )}
         </div>

      </div>

      {/* 🚀 4. QUICK ACTION */}
      <div className="bg-[#1E293B] rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
         <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
               <TrendingUp className="text-green-400"/> Running Low on Stock?
            </h3>
            <p className="text-slate-300 text-sm mt-1">Browse catalog and place bulk orders directly to manufacturers.</p>
         </div>
         <Link href="/dashboard/distributor/place-order" className="bg-white text-[#1E293B] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-2 whitespace-nowrap">
            <ShoppingCart size={18}/> Place B2B Order
         </Link>
      </div>

    </div>
  );
}