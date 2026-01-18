import { prisma } from "@/lib/prisma";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import RecallButton from "@/components/RecallButton"; // ✅ পাথ এখন কাজ করবে

export default async function QualityControlPage() {
  // ম্যানুফ্যাকচারারের সব ব্যাচ আনা
  const batches = await prisma.batch.findMany({
    include: { product: true, recalls: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quality Control & Recall</h1>
      
      <div className="grid gap-4">
        {batches.map((batch) => {
          const isRecalled = batch.recalls.length > 0;
          return (
            <div key={batch.id} className={`p-4 rounded-xl border flex justify-between items-center ${isRecalled ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
               <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isRecalled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {isRecalled ? <AlertTriangle size={24}/> : <ShieldCheck size={24}/>}
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-800">{batch.product.name}</h3>
                      <p className="text-sm text-slate-500">Batch: <b>{batch.batchNumber}</b> • Exp: {new Date(batch.expDate).toLocaleDateString()}</p>
                      {isRecalled && <p className="text-xs text-red-600 font-bold mt-1">Status: RECALLED</p>}
                  </div>
               </div>
               
               <div>
                 {/* ক্লায়েন্ট কম্পোনেন্ট বাটন */}
                 {!isRecalled && <RecallButton batchNumber={batch.batchNumber} />}
                 
                 {isRecalled && <span className="px-4 py-2 bg-red-200 text-red-800 text-xs font-bold rounded-lg">Active Recall</span>}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}