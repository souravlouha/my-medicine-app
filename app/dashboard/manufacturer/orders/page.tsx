import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ নতুন ইম্পোর্ট
import { redirect } from "next/navigation";
import { ShoppingBag, Clock } from "lucide-react";
import OrderActions from "./OrderActions"; 

export default async function ManufacturerOrdersPage() {
  // ✅ ফিক্স: কুকির বদলে সেশন ব্যবহার করা হলো
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) redirect("/login");

  // ম্যানুফ্যাকচারারের কাছে আসা অর্ডারগুলো ফেচ করা
  const orders = await prisma.order.findMany({
    where: { receiverId: userId }, // receiverId = Manufacturer
    orderBy: { createdAt: 'desc' },
    include: { 
      sender: true, // Distributor Info
      items: { include: { product: true } }
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      <div className="flex justify-between items-center border-b border-gray-200 pb-5">
         <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <ShoppingBag className="text-blue-600"/> Incoming Orders
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage B2B orders received from distributors.</p>
         </div>
         <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-bold">
            {orders.length} Orders
         </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {orders.length === 0 && (
            <p className="text-center text-gray-400 py-10">No active orders found.</p>
         )}
         
         {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
               
               {/* Order Header */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-xl font-black text-gray-800">#{order.orderId}</h3>
                         {/* Status Badge */}
                         <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 
                            ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'SHIPPED' ? 'bg-green-100 text-green-800' : 
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                            {order.status === 'PENDING' && <Clock size={12}/>}
                            {order.status}
                         </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                          Ordered By: <span className="font-bold text-blue-600">{order.sender.name}</span> • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                  </div>

                  <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">Total Value</p>
                      <p className="text-2xl font-black text-green-600">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
               </div>

               {/* Items List */}
               <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <table className="w-full text-left text-sm">
                      <thead className="text-gray-400 font-bold border-b border-gray-200">
                          <tr>
                             <th className="pb-2">Product Name</th>
                             <th className="pb-2 text-center">Quantity</th>
                             <th className="pb-2 text-right">Price/Unit</th>
                             <th className="pb-2 text-right">Total</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {order.items.map((item) => (
                             <tr key={item.id}>
                                <td className="py-2 font-bold text-gray-700">{item.product.name}</td>
                                <td className="py-2 text-center font-mono">{item.quantity}</td>
                                <td className="py-2 text-right">₹{item.price}</td>
                                <td className="py-2 text-right font-bold">₹{item.price * item.quantity}</td>
                             </tr>
                          ))}
                      </tbody>
                  </table>
               </div>

               {/* Action Buttons (Connected with OrderActions) */}
               {(order.status === "PENDING" || order.status === "APPROVED") && (
                  <OrderActions orderId={order.id} status={order.status} />
               )}

            </div>
         ))}
      </div>

    </div>
  );
}