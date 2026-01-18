"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, Search, ArrowRight, Package, ShieldCheck } from "lucide-react";

export default function TrackMedicinePage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [manualBatchId, setManualBatchId] = useState("");
  const [loading, setLoading] = useState(false);

  // ১. স্ক্যান সফল হলে এই ফাংশন কল হবে
  const handleScan = (result: any) => {
    if (result) {
      // ব্যাচ আইডি বা পুরো লিংক থেকে আইডি বের করা
      // ধরা যাক QR এ আছে: "https://medtrace.com/verify/BATCH-123"
      // অথবা শুধু: "BATCH-123"
      
      let batchId = result[0]?.rawValue;
      
      // যদি পুরো ইউআরএল থাকে, তাহলে শেষ অংশটি নেব
      if (batchId.includes("/")) {
        const parts = batchId.split("/");
        batchId = parts[parts.length - 1];
      }

      setIsScanning(false);
      setLoading(true);
      // ভেরিফিকেশন পেজে রিডাইরেক্ট
      router.push(`/verify/${batchId}`);
    }
  };

  // ২. ম্যানুয়ালি আইডি দিয়ে সার্চ করলে
  const handleManualSearch = () => {
    if (!manualBatchId) return;
    setLoading(true);
    router.push(`/verify/${manualBatchId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header Section */}
      <div className="bg-blue-600 px-6 pt-12 pb-20 rounded-b-[40px] shadow-lg text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
        <h1 className="text-3xl font-black text-white relative z-10">Track Medicine</h1>
        <p className="text-blue-100 mt-2 text-sm relative z-10">Verify authenticity instantly</p>
      </div>

      <div className="px-6 -mt-10 relative z-20 space-y-6">
        
        {/* SCANNER CARD (Main Feature) */}
        {!isScanning ? (
          <div className="bg-white p-6 rounded-3xl shadow-xl text-center space-y-4 border border-blue-50">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-2">
              <QrCode size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Scan QR Code</h2>
            <p className="text-gray-400 text-sm px-4">
              Point your camera at the QR code on the medicine strip.
            </p>
            <button 
              onClick={() => setIsScanning(true)}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <QrCode size={20}/> Open Scanner
            </button>
          </div>
        ) : (
          /* SCANNER ACTIVE VIEW */
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setIsScanning(false)} className="bg-white/20 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md border border-white/30">
                    Close Camera
                </button>
            </div>
            
            <Scanner 
                onScan={handleScan}
                styles={{ container: { height: 300 } }} // ক্যামেরার হাইট
                components={{
                    audio: false, // শব্দ বন্ধ
                    onOff: true,  // ফ্ল্যাশ লাইট বাটন
                }}
            />
            <p className="text-center text-white text-xs py-2 bg-black">Scanning...</p>
          </div>
        )}

        {/* OR Divider */}
        <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
            <div className="h-[1px] bg-gray-300 flex-1"></div>
            OR
            <div className="h-[1px] bg-gray-300 flex-1"></div>
        </div>

        {/* MANUAL INPUT CARD */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Search size={18} className="text-gray-400"/> Enter Batch ID
            </h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="e.g. BATCH-2026"
                    value={manualBatchId}
                    onChange={(e) => setManualBatchId(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                />
                <button 
                    onClick={handleManualSearch}
                    disabled={!manualBatchId || loading}
                    className="bg-gray-900 text-white px-4 rounded-xl hover:bg-black transition disabled:opacity-50"
                >
                    <ArrowRight />
                </button>
            </div>
        </div>

        {/* Info Features */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2"/>
                <p className="text-xs font-bold text-green-800">100% Secure</p>
                <p className="text-[10px] text-green-600">Blockchain Verified</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                <Package className="w-8 h-8 text-purple-600 mx-auto mb-2"/>
                <p className="text-xs font-bold text-purple-800">Trace Origin</p>
                <p className="text-[10px] text-purple-600">Manufacturer Info</p>
            </div>
        </div>

      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}