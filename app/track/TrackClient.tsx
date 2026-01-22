"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner"; 
import { Loader2, ScanLine, AlertCircle } from "lucide-react";

export default function TrackClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = (result: any) => {
    if (result) {
      setLoading(true);
      
      const rawValue = result[0]?.rawValue || result; 
      let finalId = rawValue;

      // স্মার্ট লজিক: লিংক থেকে আইডি বের করা
      if (rawValue.includes("/verify/")) {
        const parts = rawValue.split("/verify/");
        finalId = parts[1]; 
      }

      router.push(`/verify/${finalId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block p-3 bg-blue-600 rounded-full mb-2 animate-pulse">
            <ScanLine size={32} />
          </div>
          <h1 className="text-2xl font-bold">ঔষধ যাচাই করুন</h1>
          <p className="text-slate-400 text-sm">QR কোডটি ক্যামেরার সামনে ধরুন</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border-4 border-slate-800 shadow-2xl aspect-square bg-slate-900">
          {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                <Loader2 size={50} className="text-blue-500 animate-spin" />
                <p className="mt-4 font-bold text-blue-400">যাচাই করা হচ্ছে...</p>
             </div>
          ) : (
             <Scanner 
                onScan={handleScan} 
                onError={(err) => console.log(err)}
                // ❌ অডিও রিমুভ করা হয়েছে কারণ এটি এরর দিচ্ছিল
                components={{ finder: false }} 
                styles={{ container: { width: "100%", height: "100%" } }}
             />
          )}
          
          {!loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-[scan_2s_infinite]"></div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-xl flex items-center gap-3">
             <AlertCircle className="text-red-500" />
             <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 mt-8">
           আপনার ফোনের ক্যামেরা পারমিশন Allow করুন
        </p>
      </div>
    </div>
  );
}