import { auth } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma"; 
import { redirect } from "next/navigation";
// ✅ ফিক্স: AlertCircle এখানে অ্যাড করা হয়েছে
import { Truck, Package, Box, MapPin, Calendar, AlertCircle } from "lucide-react";
import ReceiveButton from "./ReceiveButton"; 

export const dynamic = 'force-dynamic';

export default async function IncomingPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  try {
    const shipments = await prisma.shipment.findMany({
      where: {
        distributorId: userId, 
        status: "IN_TRANSIT"
      },
      orderBy: { createdAt: "desc" },
      include: { 
        sender: true, 
        items: { 
          include: { 
            batch: { include: { product: true } } 
          } 
        } 
      }
    });

    return (
      <div className="max-w-6xl mx-auto p-8 pb-24 space-y-8 bg-gray-50/50 min-h-screen">
         
         {/* Header Section */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  Incoming Shipments <Truck className="text-orange-500" size={32} />
               </h1>
               <p className="text-slate-500 mt-2 font-medium">Review and accept stock from manufacturers.</p>
            </div>
            <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-bold shadow-sm">
               Total Pending: {shipments.length}
            </span>
         </div>
         
         {/* Empty State */}
         {shipments.length === 0 ? (
           <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
             <Package className="mx-auto h-20 w-20 text-slate-200 mb-6" />
             <h3 className="text-xl font-bold text-slate-600">All Caught Up!</h3>
             <p className="text-slate-400 mt-2">No incoming shipments at the moment.</p>
           </div>
         ) : (
           <div className="grid gap-10">
              {shipments.map(shipment => (
                 <div key={shipment.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition duration-300">
                    
                    {/* Card Header Info Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 border-b border-gray-100">
                        
                        {/* Shipment ID Section (Short + UUID) */}
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Shipment ID</p>
                            <p className="font-bold text-slate-900 text-lg leading-none">
                                {shipment.shipmentId || "INV-PENDING"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1 break-all leading-tight" title="System UUID">
                                {shipment.id}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Sender (Manufacturer)</p>
                            <p className="font-bold text-blue-600 text-lg flex items-center gap-2">
                                {shipment.sender?.name || "Unknown"}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Value</p>
                            <p className="font-black text-emerald-600 text-lg">
                                ₹{shipment.totalAmount.toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Date</p>
                            <p className="font-bold text-gray-700">
                                {new Date(shipment.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Shipment Contents */}
                    <div className="p-8 bg-white">
                        <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Box size={14}/> Shipment Contents:
                        </h4>

                        {/* Table Header */}
                        <div className="bg-gray-50 rounded-t-lg border-b border-gray-100 p-3 grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4">Medicine Name</div>
                            <div className="col-span-4">Batch Details (No & UUID)</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Price</div>
                        </div>

                        {/* Table Body */}
                        <div className="border border-gray-100 rounded-b-lg divide-y divide-gray-50">
                            {/* @ts-ignore */}
                            {shipment.items?.map((item: any) => (
                                <div key={item.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition">
                                    
                                    {/* Medicine Name */}
                                    <div className="col-span-4">
                                        <p className="font-bold text-slate-800 text-sm">{item.batch.product.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                            Code: {item.batch.product.productCode || "N/A"}
                                        </p>
                                    </div>

                                    {/* ✅ Batch Details (Batch No + UUID) */}
                                    <div className="col-span-4 flex flex-col justify-center">
                                        <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded text-xs font-mono font-bold w-fit">
                                            {item.batch.batchNumber}
                                        </span>
                                        {/* UUID এখানে দেখানো হয়েছে */}
                                        <span className="text-[9px] text-gray-300 font-mono mt-1 truncate max-w-[200px]" title={item.batch.id}>
                                            {item.batch.id}
                                        </span>
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-2 text-center">
                                        <span className="font-bold text-slate-800 text-sm">{item.quantity} <span className="text-gray-400 text-xs font-normal">strips</span></span>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-2 text-right">
                                        <span className="font-medium text-gray-600 text-sm">₹{item.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Button */}
                        <ReceiveButton shipmentId={shipment.id} />
                    </div>

                 </div>
              ))}
           </div>
         )}
      </div>
    );

  } catch (error) {
    console.error("Database Connection Error:", error);
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl text-center">
        {/* ✅ AlertCircle এখন কাজ করবে */}
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4"/>
        <h3 className="font-bold text-xl text-red-700 mb-2">Error Loading Data</h3>
        <p className="text-red-600 mb-4">Connection issue detected.</p>
        <div className="text-left bg-white p-4 rounded border border-red-100 text-xs text-slate-500 font-mono overflow-auto max-h-40">
            {String(error)}
        </div>
      </div>
    );
  }
}