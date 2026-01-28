"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Loader2, 
  ShieldCheck, 
  Box, 
  Lock, 
  AlertTriangle, 
  Calendar, 
  Factory, 
  Hash, 
  AlertOctagon, 
  Home 
} from "lucide-react";
import { getTrackingData } from "@/lib/actions/track-actions"; 

export default function VerifyPage() {
  const params = useParams();
  const batchId = params.batchId as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!batchId) return;

    // 🔍 1. চেক করা হচ্ছে এটা ডিস্ট্রিবিউটার প্যাকেজিং কিনা (CARTON/BOX)
    // Common User-এর জন্য এগুলো রেস্ট্রিক্টেড
    if (batchId.startsWith("CARTON") || batchId.startsWith("BOX")) {
       setIsRestricted(true);
       setLoading(false);
       return;
    }

    // 🔍 2. ডাটা ফেচ করা
    const fetchData = async () => {
      try {
        const result = await getTrackingData(batchId);
        if (result.success) {
            setData(result.data);
        } else {
            setError(true);
        }
      } catch (err) { 
        console.error(err); 
        setError(true);
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [batchId]);

  // ⏳ LOADING STATE
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40}/>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Verifying Authenticity...</p>
    </div>
  );

  // ❌ ERROR STATE (Product Not Found)
  if (error || !data) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-slate-200">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} className="text-red-500"/>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Product Not Found</h2>
                <p className="text-slate-500 text-sm mb-6">
                    The scanned code does not exist in our system. It might be a fake product.
                </p>
                <Link href="/" className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition">
                    <Home size={16}/> Go to Home
                </Link>
            </div>
        </div>
      );
  }

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
    <div className="min-h-screen bg-slate-50 pb-10 font-sans">
       
       {/* 1. Status Banner */}
       <div className="bg-emerald-600 pt-10 pb-24 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
             <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg border border-white/10">
                <ShieldCheck size={40} className="text-white"/>
             </div>
             <h1 className="text-3xl font-black text-white tracking-tight">Verified Authentic</h1>
             <p className="text-emerald-100 text-sm font-medium mt-1 opacity-90">Safe to consume • 100% Genuine Product</p>
          </div>
       </div>
       
       {/* 2. Main Card */}
       <div className="px-5 -mt-16 relative z-20 max-w-md mx-auto">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
             
             {/* Header Info */}
             <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        {data?.product?.type || "MEDICINE"}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-3 leading-tight">
                        {data?.product?.name}
                      </h2>
                      <p className="text-slate-500 text-xs font-bold mt-1">
                        {data?.product?.genericName}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MRP</p>
                      <p className="text-2xl font-black text-slate-800">₹{data?.mrp}</p>
                   </div>
                </div>
             </div>

             {/* 3. Detailed Grid Info */}
             <div className="p-6 grid grid-cols-2 gap-x-4 gap-y-8">
                
                {/* Batch No */}
                <div className="col-span-1">
                   <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                      <Hash size={14} />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Batch No</p>
                   </div>
                   <p className="font-mono font-bold text-slate-800 text-sm bg-slate-100 inline-block px-3 py-1.5 rounded-lg border border-slate-200">
                      {data?.batchNumber}
                   </p>
                </div>

                {/* Strip ID (Last 8 digits) */}
                <div className="col-span-1">
                   <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                      <Box size={14} />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Unique ID</p>
                   </div>
                   <p className="font-mono font-bold text-blue-600 text-xs break-all">
                      ...{data?.unitId?.slice(-12) || "N/A"}
                   </p>
                </div>

                {/* Mfg Date */}
                <div className="col-span-1">
                   <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                      <Calendar size={14} />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Mfg Date</p>
                   </div>
                   <p className="font-bold text-slate-800 text-sm">
                      {data?.mfgDate ? new Date(data.mfgDate).toLocaleDateString(undefined, {dateStyle: 'medium'}) : "N/A"}
                   </p>
                </div>

                {/* Exp Date */}
                <div className="col-span-1">
                   <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                      <AlertTriangle size={14} />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Exp Date</p>
                   </div>
                   <p className="font-bold text-red-500 text-sm">
                      {data?.expDate ? new Date(data.expDate).toLocaleDateString(undefined, {dateStyle: 'medium'}) : "N/A"}
                   </p>
                </div>

             </div>

             {/* Manufacturer Footer */}
             <div className="bg-slate-50 p-5 border-t border-slate-100 flex items-center gap-4">
                <div className="bg-white p-3 rounded-full border border-slate-200 text-slate-500 shadow-sm">
                   <Factory size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manufactured By</p>
                   <p className="font-bold text-slate-800 text-sm leading-tight mt-0.5">
                      {data?.manufacturer?.name || "Premium Pharma Ltd."}
                   </p>
                </div>
             </div>

          </div>
       </div>

       {/* Footer ID & Home Link */}
       <div className="text-center mt-8 space-y-4 px-6">
          <p className="text-slate-300 text-[10px] font-mono break-all">
             Scan ID: {batchId}
          </p>
          {/* যদি গুগল লেন্স থেকে আসে, তাহলে হোম পেজে যাওয়ার অপশন */}
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition">
             <Home size={16}/> Back to Home
          </Link>
       </div>
    </div>
  );
}