"use client";
import { useState } from "react";
import { sellMedicineAction } from "./actions";

export default function QuickSale({ retailerId }: { retailerId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(""); 
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1"); // নতুন কোয়ান্টিটি স্টেট
  const [loading, setLoading] = useState(false);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // অ্যাকশনে কোয়ান্টিটি পাঠানো হচ্ছে
    const res = await sellMedicineAction(searchInput, parseFloat(price), parseInt(quantity), retailerId);
    alert(res.message);
    if (res.success) {
      setIsOpen(false);
      setSearchInput("");
      setPrice("");
      setQuantity("1");
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-3xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        ⚡ Quick Sale (Scan/Name/ID)
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">🛒 Sell Medicine</h2>
            
            <form onSubmit={handleSale} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">QR Code / ID / Medicine Name</label>
                <input 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ex: Paracetamol or StripID_123"
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl font-bold focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity (Units)</label>
                  <input 
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border-2 border-gray-100 p-4 rounded-2xl font-bold focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sale Price (₹)</label>
                  <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full border-2 border-gray-100 p-4 rounded-2xl font-bold focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg transition-all"
              >
                {loading ? "Processing..." : "✅ Confirm Sale"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}