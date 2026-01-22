"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, Box, Lock, AlertTriangle } from "lucide-react";
import { getTrackingData } from "@/lib/actions/track-actions"; 

export default function VerifyPage() {
  const params = useParams();
  const batchId = params.batchId as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    // 🔍 1. চেক করা হচ্ছে এটা ডিস্ট্রিবিউটার প্যাকেজিং কিনা (CARTON/BOX)
    if (batchId.startsWith("CARTON") || batchId.startsWith("BOX")) {
       setIsRestricted(true);
       setLoading(false);
       return;
    }

    // 🔍 2. যদি Strip বা সাধারণ Batch হয় -> ডাটা আনো
    const fetchData = async () => {
      try {
        const result = await getTrackingData(batchId);
        if (result.success) setData(result.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [batchId]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  // 🛑 SCENARIO A: RESTRICTED VIEW (CARTON/BOX)
  // ডিস্ট্রিবিউটার বা রিটেইলার স্ক্যান করলে এটা দেখবে
  if (isRestricted) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-slate-200">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
               <Box size={32} className="text-orange-600"/>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Logistics Unit Scanned</h2>
            <p className="text-slate-500 text-sm mb-6">
               You have scanned a <b>{batchId.split('-')[0]}</b> (Wholesale Pack). 
               Detailed information is restricted to authorized distributors only.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6 font-mono text-xs text-slate-600 break-all">
               ID: {batchId}
            </div>
            <Link href="/login" className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition">
               <Lock size={16}/> Login to View Details
            </Link>
         </div>
      </div>
    );
  }

  // ✅ SCENARIO B: PUBLIC VIEW (STRIP)
  // সাধারণ মানুষ স্ক্যান করলে এটা দেখবে
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
       <div className="bg-emerald-600 pt-10 pb-20 px-6 rounded-b-[3rem] shadow-xl text-center">
          <ShieldCheck size={48} className="text-white mx-auto mb-4"/>
          <h1 className="text-2xl font-black text-white">Verified Authentic</h1>
          <p className="text-emerald-100 text-sm">This medicine is safe to consume.</p>
       </div>
       
       <div className="px-6 -mt-12">
          <div className="bg-white rounded-[2rem] shadow-lg p-6 border border-slate-100">
             <h2 className="text-xl font-bold text-slate-900">{data?.product?.name || "Medicine Details"}</h2>
             <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{data?.product?.type || "MEDICINE"}</span>
                <p className="text-slate-400 text-xs font-bold uppercase">Batch: {data?.batchNumber || batchId}</p>
             </div>
             
             {/* সাধারণ মানুষের জন্য সিম্পল তথ্য */}
             <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry Date</p>
                   <p className="font-bold text-red-500 text-lg">{data?.expDate ? new Date(data.expDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">MRP</p>
                   <p className="font-bold text-slate-800 text-lg">₹{data?.mrp}</p>
                </div>
             </div>

             <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800 text-center font-medium">
                   Manufactured by <b>{data?.manufacturer?.name || "Premium Pharma"}</b>
                </p>
             </div>
          </div>
       </div>

       <p className="text-center text-slate-400 text-[10px] mt-8">
          Scan ID: {batchId}
       </p>
    </div>
  );
}