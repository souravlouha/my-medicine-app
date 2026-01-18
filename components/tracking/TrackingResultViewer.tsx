"use client";

import { Rocket, Clock } from "lucide-react";

export default function TrackingResultViewer({ timeline, batchInfo }: { timeline: any[], batchInfo: any }) {
  // আমরা এখন timeline বা batchInfo ব্যবহার করছি না, শুধু স্ট্যাটিক মেসেজ দেখাব।
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg mt-8 p-10 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-blue-100 p-4 rounded-full">
            <Rocket size={40} className="text-blue-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Live Tracking Coming Soon!</h2>
      <p className="text-slate-500 max-w-md mx-auto">
        We are building a robust blockchain-powered supply chain visualization for you. 
        Currently, you can verify the <b>authenticity</b> and <b>recall status</b> of this medicine above.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
        <Clock size={16} />
        <span>Expected Launch: Next Update</span>
      </div>
    </div>
  );
}