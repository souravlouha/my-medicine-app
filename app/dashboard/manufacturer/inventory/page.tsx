import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Search, Filter, AlertTriangle, Boxes, Calendar, PackageCheck, ArrowRight } from "lucide-react";

export default async function ManufacturerInventoryPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  // ১. ব্যাচ এবং তার সাথে শিপমেন্টের তথ্য আনা (Live Stock হিসাব করার জন্য)
  const batches = await prisma.batch.findMany({
    where: { manufacturerId: userId },
    include: {
      product: true,
      shipmentItems: { // শিপমেন্ট আইটেমগুলো আনছি
        include: {
          shipment: true // শিপমেন্ট স্ট্যাটাস চেক করার জন্য
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // ২. লাইভ স্টক ক্যালকুলেশন
  const inventoryData = batches.map((batch) => {
    // কতো পিস মাল শিপমেন্ট করা হয়েছে (শুধুমাত্র যেগুলো ক্যানসেল হয়নি)
    const shippedQuantity = batch.shipmentItems.reduce((acc, item) => {
      if (item.shipment.status !== 'CANCELLED' && item.shipment.status !== 'REJECTED') {
        return acc + item.quantity;
      }
      return acc;
    }, 0);

    // লাইভ স্টক = মোট উৎপাদন - শিপড
    const liveStock = batch.totalQuantity - shippedQuantity;

    return {
      ...batch,
      liveStock: liveStock > 0 ? liveStock : 0, // নেগেটিভ এড়াতে
      shippedQuantity
    };
  }).filter(b => b.liveStock > 0); // অপশনাল: যদি শুধু স্টক থাকা আইটেম দেখতে চান

  // ৩. KPI ক্যালকুলেশন
  const totalLiveUnits = inventoryData.reduce((acc, b) => acc + b.liveStock, 0);
  const totalStockValue = inventoryData.reduce((acc, b) => acc + (b.liveStock * b.mrp), 0);
  
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <Boxes className="text-blue-600" /> My Live Inventory
            </h1>
            <p className="text-gray-500 text-sm mt-1">Real-time stock levels calculated from production and shipments.</p>
         </div>
         
         {/* KPI Cards */}
         <div className="flex gap-4">
             <div className="px-5 py-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                 <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Live Units</p>
                 <p className="text-xl font-black text-blue-700">{totalLiveUnits.toLocaleString()}</p>
             </div>
             <div className="px-5 py-3 bg-green-50 border border-green-100 rounded-xl text-center">
                 <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Current Value</p>
                 <p className="text-xl font-black text-green-700">₹{(totalStockValue/1000).toFixed(1)}k</p>
             </div>
         </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
         
         {/* Controls */}
         <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-3 top-3 text-gray-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search batch or medicine..." 
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">
               <Filter size={16}/> Filter
            </button>
         </div>

         {/* Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                     <th className="py-4 px-6">Medicine Details</th>
                     <th className="py-4 px-6">Batch Info</th>
                     <th className="py-4 px-6 text-center">Produced</th>
                     <th className="py-4 px-6 text-center bg-blue-50/50">Live Stock</th>
                     <th className="py-4 px-6 text-right">Unit MRP</th>
                     <th className="py-4 px-6 text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {inventoryData.length === 0 && (
                     <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-400">Inventory is empty.</td>
                     </tr>
                  )}
                  {inventoryData.map((batch) => {
                     const isExpiring = new Date(batch.expDate) < threeMonthsFromNow;
                     const isLow = batch.liveStock < 100;
                     
                     return (
                        <tr key={batch.id} className="hover:bg-gray-50 transition">
                           <td className="py-4 px-6">
                              <p className="font-bold text-gray-800 text-base">{batch.product.name}</p>
                              <p className="text-xs text-gray-500">{batch.product.genericName}</p>
                              <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">{batch.product.type}</span>
                           </td>
                           <td className="py-4 px-6">
                              <p className="font-mono text-gray-700 font-bold">{batch.batchNumber}</p>
                              <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                                 <p>Mfg: {new Date(batch.mfgDate).toLocaleDateString()}</p>
                                 <p className={isExpiring ? "text-red-500 font-bold" : ""}>Exp: {new Date(batch.expDate).toLocaleDateString()}</p>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <span className="text-gray-500 font-medium">{batch.totalQuantity}</span>
                              <span className="text-[10px] text-gray-400 block">Total Batch</span>
                           </td>
                           <td className="py-4 px-6 text-center bg-blue-50/30">
                              <span className={`text-xl font-black ${isLow ? 'text-red-600' : 'text-blue-700'}`}>
                                {batch.liveStock}
                              </span>
                              <span className="text-[10px] text-gray-400 block font-bold">Available Units</span>
                           </td>
                           <td className="py-4 px-6 text-right font-bold text-gray-700">
                              ₹{batch.mrp}
                           </td>
                           <td className="py-4 px-6 text-center">
                              {isExpiring ? (
                                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold border border-red-100">
                                    <AlertTriangle size={12}/> Expiring
                                 </span>
                              ) : isLow ? (
                                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs font-bold border border-orange-100">
                                    Low Stock
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold border border-green-100">
                                    <PackageCheck size={12}/> In Stock
                                 </span>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}