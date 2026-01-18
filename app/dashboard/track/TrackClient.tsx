"use client";

import { useState } from "react";
import { trackMedicineAction } from "@/lib/actions/track-actions";
import { DistributionPieChart } from "@/components/dashboard/DashboardCharts";
import { Search, MapPin, Truck, Package, User, Copy, ExternalLink, History } from "lucide-react";

// Props রিসিভ করছি
export default function TrackClient({ recentBatches }: { recentBatches: any[] }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // 🔍 মেইন সার্চ ফাংশন (যেটা ক্লিক এবং সাবমিট দুভাবেই কাজ করবে)
  const executeSearch = async (searchTerm: string) => {
    if(!searchTerm) return;
    
    setLoading(true);
    setError("");
    setResult(null);
    setQuery(searchTerm); // ইনপুট বক্সে ভ্যালু সেট করে দেবে

    const res = await trackMedicineAction(searchTerm);
    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.error || "No record found.");
    }
    setLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  // 📋 কপি ফাংশন
  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // প্যারেন্ট ক্লিক আটকানোর জন্য
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  return (
    <div className="space-y-10">
      
      {/* 1. SEARCH HERO SECTION */}
      <div className="bg-[#0D1B3E] rounded-[2rem] p-10 text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.png')] opacity-10"></div>
         <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Trace Medicine Journey</h1>
            <p className="text-blue-200 mb-8 text-sm">Enter Batch ID to see real-time supply chain movement.</p>
            
            <form onSubmit={handleFormSubmit} className="flex gap-2 bg-white p-2 rounded-2xl shadow-lg">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search Batch ID (e.g. B-2026...)" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 font-bold focus:outline-none"
                  />
               </div>
               <button 
                 disabled={loading}
                 className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-md transition disabled:opacity-70 flex items-center gap-2"
               >
                 {loading ? "Scanning..." : "Track"}
               </button>
            </form>
            {error && <div className="mt-4 bg-red-500/20 text-red-200 py-2 px-4 rounded-lg inline-block border border-red-500/50 text-sm font-bold animate-pulse">⚠️ {error}</div>}
         </div>
      </div>

      {/* 🆕 2. QUICK ACCESS BATCHES (CLICKABLE LIST) */}
      {!result && (
        <div className="animate-fade-in">
           <div className="flex items-center gap-2 mb-4 px-2">
              <History className="text-gray-400" size={20}/>
              <h3 className="text-lg font-bold text-gray-700">Recent Batches (Quick Track)</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentBatches.map((batch) => (
                 <div 
                   key={batch.id} 
                   onClick={() => executeSearch(batch.batchNumber)}
                   className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition cursor-pointer relative"
                 >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                          {batch.product.type}
                       </span>
                       <button 
                         onClick={(e) => copyToClipboard(batch.batchNumber, e)}
                         title="Copy Batch ID"
                         className="text-gray-300 hover:text-blue-600 p-1"
                       >
                         <Copy size={14} />
                       </button>
                    </div>
                    
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{batch.product.name}</h4>
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-gray-50 p-2 rounded border border-dashed border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-800 group-hover:border-blue-200 transition">
                       {batch.batchNumber}
                       <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100" />
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* 3. TRACKING RESULTS VIEW */}
      {result && (
        <div className="animate-fade-in space-y-8">
           
           {/* A. BATCH STATUS HEADER */}
           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                 <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Package size={32} />
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h2 className="text-2xl font-black text-gray-800">{result.batchInfo.product.name}</h2>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${result.batchInfo.recalls.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {result.batchInfo.recalls.length > 0 ? "RECALLED" : "VERIFIED SAFE"}
                       </span>
                    </div>
                    <p className="text-gray-500 text-sm font-mono mt-1">Batch: {result.batchInfo.batchNumber}</p>
                 </div>
              </div>
              
              <div className="flex gap-8 text-right">
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Manufactured</p>
                    <p className="font-bold text-gray-800">{new Date(result.batchInfo.mfgDate).toLocaleDateString()}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Expiry Date</p>
                    <p className={`font-bold ${new Date(result.batchInfo.expDate) < new Date() ? "text-red-500" : "text-gray-800"}`}>
                       {new Date(result.batchInfo.expDate).toLocaleDateString()}
                    </p>
                 </div>
              </div>
           </div>

           {/* B. ANALYTICS & STATS */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Distribution Chart */}
              <DistributionPieChart 
                 data={result.holders.map((h: any) => ({ name: h.holder, value: h.stock }))} 
              />
              
              {/* Manufacturer Info Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2">
                 <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={18} className="text-blue-600"/> Origin Source
                 </h3>
                 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                       {result.batchInfo.manufacturer.name[0]}
                    </div>
                    <div>
                       <p className="font-bold text-gray-900">{result.batchInfo.manufacturer.name}</p>
                       <p className="text-xs text-gray-500">{result.batchInfo.manufacturer.address}</p>
                       <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Lic: {result.batchInfo.manufacturer.licenseNo}</p>
                    </div>
                 </div>
                 
                 <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                       <p className="text-xs text-blue-600 font-bold">Total Produced</p>
                       <p className="text-xl font-black text-blue-900">{result.batchInfo.totalQuantity}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                       <p className="text-xs text-green-600 font-bold">In Circulation</p>
                       <p className="text-xl font-black text-green-900">
                          {result.holders.reduce((sum:any, i:any) => sum + i.stock, 0)}
                       </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                       <p className="text-xs text-purple-600 font-bold">Distributors</p>
                       <p className="text-xl font-black text-purple-900">{result.timeline.length}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* C. SUPPLY CHAIN TIMELINE */}
           <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                 <Truck className="text-orange-500" /> Supply Chain Journey
              </h3>
              
              <div className="relative border-l-4 border-gray-200 ml-6 space-y-12">
                 
                 {/* 1. Manufacturing Point */}
                 <div className="relative pl-8">
                    <div className="absolute -left-[14px] top-0 h-6 w-6 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                    <div>
                       <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">Manufacturing</span>
                       <h4 className="text-lg font-bold text-gray-800 mt-1">Batch Created</h4>
                       <p className="text-sm text-gray-500">Produced by {result.batchInfo.manufacturer.name}</p>
                       <p className="text-xs text-gray-400 mt-1">{new Date(result.batchInfo.createdAt).toLocaleString()}</p>
                    </div>
                 </div>

                 {/* 2. Distribution Points (Loop) */}
                 {result.timeline.map((event: any, idx: number) => (
                    <div key={idx} className="relative pl-8">
                       <div className="absolute -left-[14px] top-0 h-6 w-6 bg-orange-500 rounded-full border-4 border-white shadow-md"></div>
                       <div>
                          <div className="flex justify-between items-start">
                             <div>
                                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded uppercase">Distribution</span>
                                <h4 className="text-lg font-bold text-gray-800 mt-1">Shipment to {event.distributor}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                   <MapPin size={12}/> {event.location}
                                </p>
                             </div>
                             <div className="text-right">
                                <span className="text-xl font-bold text-gray-800">{event.quantity}</span>
                                <span className="text-xs text-gray-500 block">Units Recvd</span>
                             </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-2 inline-block">
                             {new Date(event.date).toLocaleString()} • Status: <span className="text-green-600 font-bold">{event.status}</span>
                          </p>
                       </div>
                    </div>
                 ))}

                 {/* 3. Retail/End Point */}
                 <div className="relative pl-8">
                    <div className="absolute -left-[14px] top-0 h-6 w-6 bg-gray-300 rounded-full border-4 border-white shadow-md"></div>
                    <div>
                       <h4 className="text-sm font-bold text-gray-400 mt-1">...Further Movement / Retail Sale</h4>
                       <p className="text-xs text-gray-400">Waiting for further scans...</p>
                    </div>
                 </div>

              </div>
           </div>

           {/* 🔙 BACK BUTTON */}
           <div className="text-center pt-10">
              <button 
                onClick={() => {setResult(null); setQuery("");}}
                className="text-gray-500 font-bold hover:text-blue-600 underline"
              >
                ← Back to Search
              </button>
           </div>

        </div>
      )}
    </div>
  );
}