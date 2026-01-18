import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShoppingCart, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
// 👇 অ্যাকশন ইম্পোর্ট করা হয়েছে
import { updateOrderStatusAction } from "@/lib/actions/distributor-actions"; 

export default async function ManageOrdersPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  // ১. ডাটা ফেচিং
  const [sentOrders, receivedOrders] = await Promise.all([
    // A. আমি যা অর্ডার করেছি (Distributor -> Manufacturer)
    prisma.order.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: { 
        receiver: true, 
        items: { include: { product: true } }
      }
    }),

    // B. রিটেইলাররা যা অর্ডার করেছে (Retailer -> Distributor)
    prisma.order.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: { 
        sender: true, 
        items: { include: { product: true } }
      }
    })
  ]);

  // স্ট্যাটাস ব্যাজ হেল্পার
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING": return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><Clock size={12}/> Pending</span>;
      case "APPROVED": return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle size={12}/> Approved</span>;
      case "SHIPPED": return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><Truck size={12}/> Shipped</span>;
      case "DELIVERED": return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle size={12}/> Delivered</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-10">
      
      {/* Header */}
      <div>
         <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-blue-600"/> Order Management
         </h1>
         <p className="text-gray-500 text-sm">Track your purchases and manage incoming orders from retailers.</p>
      </div>

      {/* 🟢 SECTION 1: MY PURCHASES (Sent to Manufacturer) */}
      <div className="space-y-4">
         <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-2">
            <ArrowUpRight className="text-orange-500"/> My Purchase Orders <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{sentOrders.length}</span>
         </h2>
         
         {sentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm italic">You haven't placed any orders yet.</p>
         ) : (
            <div className="grid grid-cols-1 gap-4">
               {sentOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-800 text-lg">#{order.orderId}</h3>
                              {getStatusBadge(order.status)}
                           </div>
                           <p className="text-sm text-gray-500 mt-1">
                              Supplier: <span className="font-bold text-blue-600">{order.receiver.name}</span> • {new Date(order.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-gray-400 font-bold uppercase">Total Amount</p>
                           <p className="text-xl font-black text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                        </div>
                     </div>
                     
                     {/* Items Preview */}
                     <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                        {order.items.map((item, idx) => (
                           <div key={idx} className="flex justify-between border-b border-gray-200 last:border-0 py-1">
                              <span>{item.product.name} ({item.product.strength})</span>
                              <span className="font-bold">x {item.quantity}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* 🟣 SECTION 2: RETAILER ORDERS (Incoming) */}
      <div className="space-y-4">
         <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-2">
            <ArrowDownLeft className="text-purple-500"/> Orders from Retailers <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{receivedOrders.length}</span>
         </h2>

         {receivedOrders.length === 0 ? (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-8 text-center">
               <p className="text-purple-800 font-bold">No orders from retailers yet.</p>
               <p className="text-xs text-purple-600 mt-1">Share your catalog with retailers to start receiving orders.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 gap-4">
               {receivedOrders.map((order) => (
                  <div key={order.id} className="bg-white border-l-4 border-purple-500 rounded-r-xl shadow-sm p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div>
                        <h3 className="font-bold text-gray-800">Order #{order.orderId}</h3>
                        <p className="text-sm text-gray-500">From: <span className="font-bold text-gray-700">{order.sender.name}</span></p>
                        <div className="mt-2 flex gap-2">
                           <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold">{order.items.length} Items</span>
                           <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-bold">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                     </div>
                     
                     {/* 👇 ACTION BUTTONS WITH SERVER ACTION */}
                     <div className="flex items-center gap-3">
                        {order.status === "PENDING" && (
                           <>
                              {/* Approve Button */}
                              <form action={updateOrderStatusAction}>
                                 <input type="hidden" name="orderId" value={order.id} />
                                 <input type="hidden" name="newStatus" value="APPROVED" />
                                 <button type="submit" className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition">
                                    Approve
                                 </button>
                              </form>

                              {/* Reject Button */}
                              <form action={updateOrderStatusAction}>
                                 <input type="hidden" name="orderId" value={order.id} />
                                 <input type="hidden" name="newStatus" value="CANCELLED" />
                                 <button type="submit" className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition">
                                    Reject
                                 </button>
                              </form>
                           </>
                        )}

                        {/* Dispatch Button (Only if Approved) */}
                        {order.status === "APPROVED" && (
                           <form action={updateOrderStatusAction}>
                              <input type="hidden" name="orderId" value={order.id} />
                              <input type="hidden" name="newStatus" value="SHIPPED" />
                              <button type="submit" className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
                                 <Truck size={14}/> Dispatch
                              </button>
                           </form>
                        )}

                        {/* Status Badge */}
                        {getStatusBadge(order.status)}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
}