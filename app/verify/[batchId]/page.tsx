"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
// ✅ নতুন আইকন ইম্পোর্ট করা হয়েছে
import { Loader2, ShieldCheck, Box, Lock, AlertTriangle, Calendar, Factory, Hash, AlertOctagon } from "lucide-react";
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

    // 🔍 2. ডাটা ফেচ করা
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
  if (isRestricted) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-slate-200">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
               <Box size={32} className="text-orange-600"/>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Logistics Unit Scanned</h2>
            <p className="text-slate-500 text-sm mb-6">
               This is a <b>{batchId.split('-')[0]}</b> (Wholesale Pack). <br/>
               Details are restricted to distributors.
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

  // ⚠️ SCENARIO B: RECALLED VIEW (ওষুধ বাতিল হলে)
  if (data?.isRecalled) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-2 border-red-500">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
               <AlertOctagon size={48} className="text-red-600"/>
            </div>
            <h1 className="text-3xl font-black text-red-600 mb-2">WARNING!</h1>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Product Recalled</h2>
            <p className="text-slate-600 mb-6 font-medium">
               This batch has been recalled by the manufacturer due to safety concerns. 
               <br/><span className="font-bold text-red-600">DO NOT CONSUME.</span>
            </p>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-left space-y-2">
                <p className="text-xs font-bold text-red-400 uppercase">Medicine</p>
                <p className="font-bold text-slate-800">{data?.product?.name}</p>
                <p className="text-xs font-bold text-red-400 uppercase mt-2">Batch No</p>
                <p className="font-mono font-bold text-slate-800">{data?.batchNumber}</p>
            </div>
         </div>
      </div>
    );
  }

  // ✅ SCENARIO C: AUTHENTIC VIEW (STRIP) - FULL DETAILS
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
       
       {/* 1. Status Banner */}
       <div className="bg-emerald-600 pt-10 pb-24 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10">
             <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <ShieldCheck size={36} className="text-white"/>
             </div>
             <h1 className="text-2xl font-black text-white tracking-tight">Verified Authentic</h1>
             <p className="text-emerald-100 text-sm font-medium mt-1">Safe to consume • 100% Genuine</p>
          </div>
       </div>
       
       {/* 2. Main Card */}
       <div className="px-5 -mt-16 relative z-20">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
             
             {/* Header Info */}
             <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                        {data?.product?.type || "MEDICINE"}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-2 leading-none">
                        {data?.product?.name}
                      </h2>
                      <p className="text-slate-500 text-xs font-bold mt-1.5">
                        {data?.product?.genericName}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">MRP</p>
                      <p className="text-xl font-black text-slate-800">₹{data?.mrp}</p>
                   </div>
                </div>
             </div>

             {/* 3. Detailed Grid Info */}
             <div className="p-6 grid grid-cols-2 gap-x-4 gap-y-6">
                
                {/* Batch No */}
                <div>
                   <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Hash size={14} />
                      <p className="text-[10px] font-bold uppercase">Batch No</p>
                   </div>
                   <p className="font-mono font-bold text-slate-800 text-sm bg-slate-100 inline-block px-2 py-1 rounded">
                      {data?.batchNumber}
                   </p>
                </div>

                {/* Strip ID (Last 8 digits) */}
                <div>
                   <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Box size={14} />
                      <p className="text-[10px] font-bold uppercase">Strip ID</p>
                   </div>
                   <p className="font-mono font-bold text-blue-600 text-xs truncate" title={data?.unitId}>
                      ...{data?.unitId?.slice(-8) || "N/A"}
                   </p>
                </div>

                {/* Mfg Date */}
                <div>
                   <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Calendar size={14} />
                      <p className="text-[10px] font-bold uppercase">Mfg Date</p>
                   </div>
                   <p className="font-bold text-slate-800 text-sm">
                      {data?.mfgDate ? new Date(data.mfgDate).toLocaleDateString() : "N/A"}
                   </p>
                </div>

                {/* Exp Date */}
                <div>
                   <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <AlertTriangle size={14} />
                      <p className="text-[10px] font-bold uppercase">Exp Date</p>
                   </div>
                   <p className="font-bold text-red-500 text-sm">
                      {data?.expDate ? new Date(data.expDate).toLocaleDateString() : "N/A"}
                   </p>
                </div>

             </div>

             {/* Manufacturer Footer */}
             <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-full border border-slate-200 text-slate-500">
                   <Factory size={18} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Manufactured By</p>
                   <p className="font-bold text-slate-800 text-sm">
                      {data?.manufacturer?.name || "Premium Pharma Ltd."}
                   </p>
                </div>
             </div>

          </div>
       </div>

       {/* Footer ID */}
       <p className="text-center text-slate-300 text-[10px] font-mono mt-8">
          Scan ID: {batchId}
       </p>
    </div>
  );
}