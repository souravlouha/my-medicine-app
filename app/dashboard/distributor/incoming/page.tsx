import { auth } from "@/lib/auth"; // ✅ Auth added
import { prisma } from "@/lib/prisma"; // ✅ Using global prisma instance
import { redirect } from "next/navigation";
import { Truck, Package, MapPin, Calendar, AlertCircle, Box } from "lucide-react"; // Added Box icon
import ReceiveButton from "./ReceiveButton"; // ✅ Button component

export const dynamic = 'force-dynamic';

export default async function IncomingPage() {
  // 1. Authentication Check (Security Fix)
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  try {
    // 2. Correct Data Fetching (Logic Fix: Only My Shipments)
    const shipments = await prisma.shipment.findMany({
      where: {
        distributorId: userId, // 🔒 Only for the logged-in distributor
        status: "IN_TRANSIT"
      },
      orderBy: { createdAt: "desc" },
      include: { 
        sender: true, // Manufacturer Details
        items: { 
          include: { 
            batch: { include: { product: true } } 
          } 
        } 
      }
    });

    return (
      <div className="max-w-5xl mx-auto p-8 pb-24 space-y-8 bg-gray-50/50 min-h-screen">
         
         {/* Header Section */}
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
               Incoming Shipments <Truck className="text-orange-500" size={32} />
            </h1>
            <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
               Total Pending: {shipments.length}
            </span>
         </div>
         
         {/* Empty State */}
         {shipments.length === 0 ? (
           <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
             <Package className="mx-auto h-20 w-20 text-slate-200 mb-6" />
             <h3 className="text-xl font-bold text-slate-600">All Caught Up!</h3>
             <p className="text-slate-400 mt-2">No incoming shipments at the moment.</p>
           </div>
         ) : (
           <div className="grid gap-8">
              {shipments.map(shipment => (
                 // ✅ Card Design matching the 2nd image
                 <div key={shipment.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    
                    {/* Card Header Information */}
                    <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm border-b border-gray-100">
                        <div>
                            <p className="text-gray-500 font-bold uppercase text-xs mb-1">Shipment ID</p>
                            <p className="font-mono text-gray-700 truncate" title={shipment.shipmentId || shipment.id}>
                                {shipment.shipmentId || shipment.id}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold uppercase text-xs mb-1">Sender (Manufacturer)</p>
                            <p className="font-bold text-blue-600 text-lg">
                                {shipment.sender?.name || "Unknown"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold uppercase text-xs mb-1">Total Amount</p>
                            <p className="font-bold text-green-600 text-lg">
                                ₹{shipment.totalAmount.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-bold uppercase text-xs mb-1">Date</p>
                            <p className="font-bold text-gray-700">
                                {new Date(shipment.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Shipment Contents Section */}
                    <div className="p-6 bg-gray-50/50">
                       <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                          <Box size={16} className="text-orange-500"/> SHIPMENT CONTENTS:
                       </h4>

                       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          {/* Table Header */}
                          <div className="grid grid-cols-12 gap-4 bg-gray-100 p-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
                              <div className="col-span-5">Medicine Name</div>
                              <div className="col-span-3">Batch No</div>
                              <div className="col-span-2 text-center">Qty</div>
                              <div className="col-span-2 text-right">Price</div>
                          </div>

                          {/* Table Rows */}
                          {/* @ts-ignore */}
                          {shipment.items?.map((item: any) => (
                             <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition">
                                 <div className="col-span-5">
                                     <p className="font-bold text-gray-800 text-sm">{item.batch.product.name}</p>
                                     <p className="text-xs text-gray-400 mt-0.5">{item.batch.product.productCode}</p>
                                 </div>
                                 <div className="col-span-3">
                                     <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {item.batch.batchNumber}
                                     </span>
                                 </div>
                                 <div className="col-span-2 text-center">
                                     <span className="font-bold text-gray-800 text-sm">{item.quantity} strips</span>
                                 </div>
                                 <div className="col-span-2 text-right">
                                     <span className="font-medium text-gray-700 text-sm">₹{item.price}</span>
                                 </div>
                             </div>
                          ))}
                       </div>

                       {/* Action Footer */}
                       <div className="mt-6 flex justify-end">
                          {/* ✅ Receive Button Component Call */}
                          <ReceiveButton shipmentId={shipment.id} />
                       </div>
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
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4"/>
        <h3 className="font-bold text-xl text-red-700 mb-2">Error Loading Data</h3>
        <p className="text-red-600 mb-4">Please check your connection and try again.</p>
        <div className="text-left bg-white p-4 rounded border border-red-100 text-xs text-slate-500 font-mono overflow-auto max-h-40">
            {String(error)}
        </div>
      </div>
    );
  }
}