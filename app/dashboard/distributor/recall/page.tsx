import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import { AlertTriangle, ShieldAlert, Search, Info } from "lucide-react";

export default async function DistributorRecallPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const recalls = await prisma.recall.findMany({
    where: {
      batch: {
        shipmentItems: {
          some: {
            shipment: {
              distributorId: userId, 
              status: { not: 'REJECTED' } 
            }
          }
        }
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

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-8">
      <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4">
         <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <ShieldAlert size={32} />
         </div>
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Quality Alerts & Recalls</h1>
            <p className="text-gray-600 text-sm mt-1">
               Alerts for medicines you have handled. Please contact retailers immediately if stock has been distributed.
            </p>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
         <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-3 top-3 text-gray-400" size={18} />
               <input type="text" placeholder="Search batch or alert..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-red-200"/>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                     <th className="py-4 px-6">Alert Details</th>
                     <th className="py-4 px-6">Affected Batch</th>
                     <th className="py-4 px-6">Manufacturer</th>
                     <th className="py-4 px-6">Action Required</th>
                     <th className="py-4 px-6 text-center">Severity</th>
                     <th className="py-4 px-6 text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {recalls.length === 0 && (
                     <tr>
                        <td colSpan={6} className="py-12 text-center">
                           <div className="flex flex-col items-center justify-center text-gray-400">
                              <ShieldAlert size={48} className="mb-3 opacity-20"/>
                              <p>No active recalls for your inventory.</p>
                              <p className="text-xs">Your stock is safe.</p>
                           </div>
                        </td>
                     </tr>
                  )}

                  {recalls.map((recall) => (
                     <tr key={recall.id} className="hover:bg-red-50/30 transition border-l-4 border-l-transparent hover:border-l-red-500">
                        <td className="py-4 px-6">
                           <p className="font-bold text-gray-800 text-base">{recall.reason}</p>
                           <p className="text-xs text-gray-500 mt-1">Issued: {new Date(recall.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-6">
                           <p className="font-mono text-gray-800 font-bold">{recall.batch.batchNumber}</p>
                           <p className="text-sm text-gray-600">{recall.batch.product.name}</p>
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{recall.batch.product.type}</span>
                        </td>
                        <td className="py-4 px-6">
                           <p className="font-bold text-gray-700">{recall.batch.manufacturer.name}</p>
                           <p className="text-xs text-gray-400">Verified Mfg</p>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex items-start gap-2 text-gray-600 max-w-xs">
                              <Info size={16} className="mt-0.5 shrink-0 text-blue-500"/>
                              <p>{recall.actionType === 'RETURN' ? 'Immediate Return Requested' : 'Destroy Stock & Report'}</p>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                              recall.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 
                              recall.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                           }`}>
                              {recall.severity}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              recall.status === 'ACTIVE' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600'
                           }`}>
                              {recall.status}
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