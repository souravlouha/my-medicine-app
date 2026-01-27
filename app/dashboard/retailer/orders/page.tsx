import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Auth ইম্পোর্ট করা হয়েছে
import { redirect } from "next/navigation";
import { ShoppingBag, Search, Filter, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

export default async function RetailerOrdersPage() {
  // ✅ ১. অথেনটিকেশন চেক (Auth Check)
  const session = await auth();
  const userId = session?.user?.id;

  // যদি ইউজার লগইন না থাকে, লগইন পেজে পাঠিয়ে দেবে
  if (!userId) {
    redirect("/login");
  }

  // ২. আমার (রিটেইলারের) করা সব অর্ডার ফেচ করা
  const orders = await prisma.order.findMany({
    where: { senderId: userId }, // আমি পাঠিয়েছি এমন অর্ডার
    include: {
      receiver: true, // ডিস্ট্রিবিউটরের তথ্য
      items: {
        include: { product: true } // পণ্যের তথ্য
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <ShoppingBag className="text-purple-600" /> My Orders
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track status of your purchase orders.</p>
         </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
         
         {/* Controls */}
         <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-3 top-3 text-gray-400" size={18} />
               <input type="text" placeholder="Search order ID..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm outline-none"/>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                     <th className="py-4 px-6">Order ID</th>
                     <th className="py-4 px-6">Supplier (Distributor)</th>
                     <th className="py-4 px-6">Items</th>
                     <th className="py-4 px-6 text-right">Total Amount</th>
                     <th className="py-4 px-6 text-center">Status</th>
                     <th className="py-4 px-6 text-right">Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 && (
                     <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-400">You haven't placed any orders yet.</td>
                     </tr>
                  )}
                  {orders.map((order) => (
                     <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-6 font-mono font-bold text-gray-700">
                           {order.orderId}
                        </td>
                        <td className="py-4 px-6">
                           <p className="font-bold text-gray-800">{order.receiver.name}</p>
                           <p className="text-xs text-gray-400">Distributor</p>
                        </td>
                        <td className="py-4 px-6">
                           <div className="space-y-1">
                              {order.items.map((item) => (
                                 <p key={item.id} className="text-xs text-gray-600">
                                    <span className="font-bold">{item.quantity}x</span> {item.product.name}
                                 </p>
                              ))}
                           </div>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-gray-800">
                           ₹{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                           <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'PENDING' ? 'bg-purple-50 text-purple-600' :
                              order.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' :
                              order.status === 'SHIPPED' ? 'bg-orange-50 text-orange-600' :
                              order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                              'bg-red-50 text-red-600'
                           }`}>
                              {order.status === 'PENDING' && <Clock size={12}/>}
                              {order.status === 'APPROVED' && <CheckCircle size={12}/>}
                              {order.status === 'SHIPPED' && <Truck size={12}/>}
                              {order.status === 'DELIVERED' && <CheckCircle size={12}/>}
                              {order.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-right text-gray-500 text-xs">
                           {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}