import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import { AlertTriangle, ShieldAlert, Search, PackageX, Info } from "lucide-react";

export default async function RetailerRecallPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // ============================================================
  // 🛠️ FIX: Corrected Logic based on Schema
  // ============================================================

  // ১. শিপমেন্ট খোঁজা (যেখানে আপনি রিসিভার)
  const myShipments = await prisma.shipment.findMany({
    where: {
      // 🔴 FIX: স্কিমা অনুযায়ী এখানে 'distributorId' হবে, 'receiverId' নয়।
      // যদিও আপনি Retailer, কিন্তু ডাটাবেসে কলামের নাম distributorId রাখা হয়েছে রিসিভারের জন্য।
      distributorId: userId, 
      
      status: { not: 'REJECTED' } 
    },
    select: {
      items: {
        select: {
          batchId: true
        }
      }
    }
  });

  // ২. শিপমেন্ট থেকে সব ব্যাচ আইডি বের করা
  const myBatchIds = myShipments.flatMap(shipment => 
    shipment.items.map(item => item.batchId)
  );

  // ৩. রিকল খোঁজা (শুধুমাত্র আপনার স্টকের ব্যাচগুলোর জন্য)
  const recalls = await prisma.recall.findMany({
    where: {
      batchId: {
        in: myBatchIds 
      }
    },
    include: {
      batch: {
        include: {
          product: true,
          manufacturer: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // ============================================================
  // UI RENDER (No Changes needed here)
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-8">
      
      {/* Header Warning Banner */}
      <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 animate-in slide-in-from-top-2">
         <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-sm">
            <ShieldAlert size={32} />
         </div>
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Critical Medicine Alerts</h1>
            <p className="text-gray-600 text-sm mt-1">
               Stop selling these items immediately. Remove affected batches from shelves and return them.
            </p>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
         {/* Search Section */}
         <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-3 top-3 text-gray-400" size={18} />
               <input type="text" placeholder="Search medicine name or batch..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-red-200 transition"/>
            </div>
         </div>

         {/* Alert Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                     <th className="py-4 px-6">Reason for Recall</th>
                     <th className="py-4 px-6">Medicine & Batch</th>
                     <th className="py-4 px-6">Action Required</th>
                     <th className="py-4 px-6 text-center">Severity</th>
                     <th className="py-4 px-6 text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {recalls.length === 0 && (
                     <tr>
                        <td colSpan={5} className="py-16 text-center">
                           <div className="flex flex-col items-center justify-center text-gray-400">
                              <PackageX size={48} className="mb-3 opacity-20"/>
                              <p className="font-medium">No active recalls found.</p>
                              <p className="text-xs mt-1">Your inventory is currently safe to sell.</p>
                           </div>
                        </td>
                     </tr>
                  )}

                  {recalls.map((recall) => (
                     <tr key={recall.id} className="hover:bg-red-50/40 transition group">
                        <td className="py-4 px-6 align-top">
                           <div className="flex items-start gap-3">
                              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                              <div>
                                 <p className="font-bold text-gray-800 text-base">{recall.reason}</p>
                                 <p className="text-xs text-gray-500 mt-1">Date: {new Date(recall.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-6 align-top">
                           <p className="text-sm font-bold text-blue-600">{recall.batch.product.name}</p>
                           <p className="font-mono text-gray-800 text-xs mt-1 bg-gray-100 px-2 py-1 rounded w-fit">
                              Batch: {recall.batch.batchNumber}
                           </p>
                           <p className="text-xs text-gray-400 mt-1">Mfg: {recall.batch.manufacturer.name}</p>
                        </td>
                        <td className="py-4 px-6 align-top">
                           <div className="flex items-start gap-2 text-gray-700 bg-red-50 p-2 rounded-lg border border-red-100">
                              <Info size={16} className="mt-0.5 shrink-0 text-red-500"/>
                              <p className="text-xs font-semibold">
                                 {recall.actionType === 'RETURN' 
                                    ? 'Remove from shelf & Return to Distributor' 
                                    : 'Destroy stock immediately & Report'}
                              </p>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-center align-top">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                              recall.severity === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' : 
                              recall.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                           }`}>
                              {recall.severity} Risk
                           </span>
                        </td>
                        <td className="py-4 px-6 text-center align-top">
                           <span className="text-xs font-bold text-red-600 flex items-center justify-center gap-1">
                              <span className="relative flex h-2 w-2">
                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              Active
                           </span>
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