import { prisma } from "@/lib/prisma";
import { Boxes, AlertCircle } from "lucide-react";

export default async function RetailerInventoryPage() {
  // 🛠️ FIX: অথ ফাইল ছাড়া ইউজার খোঁজা (টেস্টিংয়ের জন্য প্রথম রিটেইলারকে ধরবে)
  const user = await prisma.user.findFirst({
    where: { role: "RETAILER" } 
  });

  if (!user) return <div className="p-10 text-red-500">No Retailer Account Found. Please create one.</div>;

  // ইনভেন্টরি ফেচ করা
  const inventory = await prisma.inventory.findMany({
    where: { userId: user.id },
    include: {
      batch: { include: { product: true } }
    }
  });

  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Boxes className="text-purple-600" /> My Shelf Inventory
          </h1>
          <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-bold text-slate-600">
             Total Items: {inventory.length}
          </span>
       </div>

       {inventory.length === 0 ? (
         <div className="text-center p-10 bg-slate-50 rounded-xl border border-dashed">
            <p className="text-slate-400">Your shelf is empty. Buy some medicines or receive stock.</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => (
               <div key={item.id} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
                  <div>
                     <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-slate-800">{item.batch.product.name}</h3>
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded font-bold uppercase">{item.batch.product.type}</span>
                     </div>
                     <p className="text-slate-500 text-sm">{item.batch.product.genericName}</p>
                     
                     <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-400">Batch:</span>
                           <span className="font-mono font-medium">{item.batch.batchNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-400">Expiry:</span>
                           <span className={`font-medium ${new Date(item.batch.expDate) < new Date() ? 'text-red-600' : 'text-slate-700'}`}>
                              {new Date(item.batch.expDate).toLocaleDateString()}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex justify-between items-center">
                     <div className="text-xs font-bold text-slate-400 uppercase">Current Stock</div>
                     <div className={`text-xl font-bold ${item.currentStock < 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {item.currentStock} <span className="text-sm font-normal text-slate-500">Units</span>
                     </div>
                  </div>
                  
                  {item.currentStock < 10 && (
                     <div className="mt-2 text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle size={12}/> Low Stock Alert
                     </div>
                  )}
               </div>
            ))}
         </div>
       )}
    </div>
  );
}