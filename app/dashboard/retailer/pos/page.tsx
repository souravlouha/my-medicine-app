"use client";

import { useState } from "react";
import { Search, ShoppingCart, Printer, CheckCircle } from "lucide-react";
import { sellMedicineAction } from "@/lib/actions/pos-actions"; 

export default function POSPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]); // কার্ট ম্যানেজমেন্টের জন্য
  
  // ডামি ডেটা বা ইনপুট স্টেটস (আপনার আগের লজিক অনুযায়ী বসাবেন)
  const [batchInput, setBatchInput] = useState("");

  const handleCheckout = async () => {
    // ডামি পে-লোড (আপনার আসল ফর্ম ডেটা দিয়ে রিপ্লেস হবে)
    const payload = {
       sellerId: "user_id_here", 
       batchId: batchInput,
       quantity: 1,
       totalPrice: 100
    };
    
    // সার্ভার অ্যাকশন কল করা
    const result = await sellMedicineAction(payload);
    
    if (result.success) {
      setLastSaleData(payload); 
      setIsSuccess(true);       // সাকসেস স্ক্রিন চালু হবে
      // টোস্টের দরকার নেই কারণ আমরা বড় সাকসেস মেসেজ দেখাচ্ছি
    } else {
      alert("Error: " + result.error); // এরর হলে সাধারণ অ্যালার্ট দেবে
    }
  };

  const handlePrint = () => {
    window.print(); 
  };

  const handleNewSale = () => {
    setIsSuccess(false);
    setLastSaleData(null);
    setBatchInput("");
  };

  // --- SUCCESS SCREEN (প্রিন্ট এবং কনফার্মেশন) ---
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
        <div className="bg-green-100 p-6 rounded-full animate-bounce">
          <CheckCircle size={64} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Payment Successful!</h1>
        <p className="text-slate-500">Transaction recorded on Blockchain.</p>

        {/* ইনভয়েস প্রিভিউ */}
        <div className="bg-white p-6 border rounded-xl shadow-sm w-full max-w-md text-left print:shadow-none print:border-none">
           <h3 className="font-bold text-xl border-b pb-2 mb-4">MedTrace Receipt</h3>
           <p><strong>Item:</strong> {lastSaleData?.batchId}</p>
           <p><strong>Qty:</strong> {lastSaleData?.quantity} Units</p>
           <p><strong>Total:</strong> ${lastSaleData?.totalPrice}</p>
           <p className="text-xs text-slate-400 mt-4 text-center">Thank you for shopping!</p>
        </div>

        <div className="flex gap-4 print:hidden">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800">
            <Printer size={20} /> Print Receipt
          </button>
          <button onClick={handleNewSale} className="px-6 py-3 rounded-xl font-bold border border-slate-300 hover:bg-slate-50">
            Next Sale
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN POS SCREEN ---
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Retail POS Terminal</h1>
      
      {/* ইনপুট সেকশন */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 flex gap-4">
         <div className="flex-1 flex items-center gap-2 border px-4 py-3 rounded-lg bg-slate-50">
            <Search className="text-slate-400"/>
            <input 
              type="text" 
              placeholder="Scan Batch ID or Enter Code" 
              className="bg-transparent outline-none w-full"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
            />
         </div>
         <button 
           onClick={handleCheckout}
           className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
         >
           <ShoppingCart size={20}/> Confirm Sale
         </button>
      </div>

      <p className="text-slate-400 text-sm text-center">
        Enter a Batch ID and click Confirm to test the Invoice feature.
      </p>
    </div>
  );
}