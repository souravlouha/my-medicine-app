"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, AlertTriangle } from "lucide-react";

export default function TrackMedicinePage() {
  const router = useRouter();
  const [batchId, setBatchId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchId.trim()) {
      // রেজাল্ট পেজে নিয়ে যাবে যেখানে আসল/নকল চেক হবে
      router.push(`/track/${encodeURIComponent(batchId.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      
      {/* হেডার সেকশন */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
           <ShieldCheck size={18} />
           <span>Official Verification Portal</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          Verify Your Medicine
        </h1>
        <p className="text-lg text-slate-500">
          Protect yourself from fake medicines. Enter the Batch ID found on the pack to check authenticity and recall status instantly.
        </p>
      </div>

      {/* সার্চ বক্স */}
      <div className="w-full max-w-xl bg-white p-2 rounded-2xl shadow-xl border border-slate-200">
        <form onSubmit={handleSearch} className="flex items-center">
            <div className="pl-4 text-slate-400">
                <Search size={24} />
            </div>
            <input 
              type="text" 
              placeholder="e.g. BATCH-2024-001" 
              className="w-full p-4 outline-none text-lg font-medium text-slate-700 placeholder:text-slate-300 bg-transparent"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md m-1"
            >
              Verify
            </button>
        </form>
      </div>

      {/* ফুটনোট / ওয়ার্নিং */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-center">
         <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                <ShieldCheck size={20}/>
             </div>
             <h3 className="font-bold text-slate-800">100% Authentic</h3>
             <p className="text-sm text-slate-500 mt-1">Directly verified from manufacturer database.</p>
         </div>
         
         <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
                <AlertTriangle size={20}/>
             </div>
             <h3 className="font-bold text-slate-800">Recall Alert</h3>
             <p className="text-sm text-slate-500 mt-1">Instant warning if the medicine is expired or banned.</p>
         </div>

         {/* ট্র্যাকিং ফিচার যে আসছে সেটা এখানে বলা থাকবে */}
         <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 border-dashed">
             <div className="bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Search size={20}/>
             </div>
             <h3 className="font-bold text-slate-400">Live Tracking</h3>
             <p className="text-xs font-bold bg-slate-200 text-slate-500 px-2 py-1 rounded inline-block mt-2">COMING SOON</p>
         </div>
      </div>
      
    </div>
  );
}