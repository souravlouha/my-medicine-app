import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Truck, PackageCheck, Clock, FileText, Calendar } from "lucide-react";
import { receiveShipmentAction } from "@/lib/actions/retailer-actions"; 

export const dynamic = "force-dynamic";

export default async function IncomingStockPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  // Fetch Shipments where Distributor ID matches Retailer ID (Receiver)
  let shipments: any[] = [];
  
  try {
    shipments = await prisma.shipment.findMany({
      where: {
        distributorId: userId, // Receiver (Retailer)
        status: { not: "DELIVERED" } 
      },
      include: {
        sender: true, 
        items: {
          include: {
            batch: { include: { product: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Shipment Fetch Error:", error);
  }

  // Fallback Orders (Tracking)
  const shippedOrders = await prisma.order.findMany({
    where: {
      senderId: userId, 
      status: "SHIPPED"
    },
    include: { receiver: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Title */}
        <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
            <Truck className="text-blue-600" size={32} /> Incoming Shipments
            </h1>
            <p className="text-slate-500 ml-11">Track and receive dispatched stock.</p>
        </div>

        {/* SECTION A: ACTUAL SHIPMENTS */}
        {shipments.length > 0 ? (
           <div className="grid gap-6">
              {shipments.map((shipment: any) => {
                 const items = shipment.items || [];
                 const senderName = shipment.sender?.name || "Unknown Distributor";
                 const totalQty = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

                 return (
                    <div key={shipment.id} className="bg-white border border-blue-200 p-6 rounded-[24px] shadow-lg shadow-blue-50 transition group relative overflow-hidden">
                       <div className="absolute top-0 right-0 bg-blue-600 w-2 h-full"></div>
                       
                       {/* Header */}
                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
                                {senderName.charAt(0)}
                             </div>
                             <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shipped By</p>
                                <h3 className="font-bold text-lg text-slate-800">{senderName}</h3>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Dispatched On</p>
                                <p className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
                                   <Calendar size={12}/> {new Date(shipment.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                             <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200">
                                <Clock size={14} /> Action Required
                             </div>
                          </div>
                       </div>

                       {/* Items Table */}
                       <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 mb-6">
                          <table className="w-full text-sm text-left">
                             <thead className="bg-slate-100 text-slate-500 font-bold text-xs uppercase">
                                <tr>
                                   <th className="p-4">Medicine</th>
                                   <th className="p-4">Batch</th>
                                   <th className="p-4 text-right">Qty</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                {items.map((item: any) => (
                                   <tr key={item.id} className="hover:bg-white transition">
                                      <td className="p-4 font-bold text-slate-700">{item.batch?.product?.name || "Unknown"}</td>
                                      <td className="p-4 font-mono text-xs text-slate-500">{item.batch?.batchNumber || "N/A"}</td>
                                      <td className="p-4 text-right font-black text-slate-800">{item.quantity}</td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>

                       {/* Footer Actions */}
                       <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-slate-500">
                             Total Items: <span className="text-slate-900 font-bold">{totalQty}</span>
                          </p>

                          {/* ✅ FORM ACTION */}
                          <form action={receiveShipmentAction as any}>
                             <input type="hidden" name="shipmentId" value={shipment.id} />
                             <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition shadow-lg flex items-center gap-2 active:scale-95">
                                <PackageCheck size={18} /> Receive to Inventory
                             </button>
                          </form>
                       </div>
                    </div>
                 );
              })}
           </div>
        ) : (
           // EMPTY STATE
           <div className="bg-white p-10 rounded-[24px] border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-medium">No actionable shipments found.</p>
           </div>
        )}

        {/* SECTION B: SHIPPED ORDERS (TRACKING) */}
        {shippedOrders.length > 0 && (
            <div className="mt-12 opacity-80 hover:opacity-100 transition">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText size={24} className="text-slate-400"/> Shipped Orders Status
                </h2>
                <div className="grid gap-4">
                    {shippedOrders.map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Order #{order.orderId}</p>
                                <p className="font-bold text-slate-800">From: {order.receiver?.name}</p>
                                <p className="text-xs text-slate-500 mt-1">Amount: ₹{order.totalAmount}</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {order.status}
                                </span>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    {shipments.some((s: any) => s.createdAt > order.updatedAt) ? "Check Above" : "Wait for Shipment"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}