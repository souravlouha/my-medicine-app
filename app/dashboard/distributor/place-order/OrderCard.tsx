"use client";

import { useState } from "react";
import { placeOrderAction } from "@/lib/actions/distributor-actions";
import { Loader2, Send } from "lucide-react";

export default function OrderCard({ product }: { product: any }) {
  const [qty, setQty] = useState(100); // Default order quantity
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!product.basePrice) return alert("Price not set by manufacturer");
    
    // 0 বা তার কম কোয়ান্টিটি হলে অর্ডার হবে না
    if (qty <= 0) return alert("Please enter a valid quantity");

    if(!confirm(`Place order for ${qty} units of ${product.name}? Total: ₹${qty * product.basePrice}`)) return;

    setLoading(true);
    
    const formData = new FormData();
    formData.append("productId", product.id);
    formData.append("manufacturerId", product.manufacturerId);
    formData.append("quantity", qty.toString());
    formData.append("price", product.basePrice.toString());

    const res = await placeOrderAction(formData);

    if (res.success) {
      alert(res.message);
    } else {
      alert("❌ " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-3 items-center">
       <input 
         type="number" 
         min="10" 
         // ✅ Fix: NaN এড়াতে এখানে চেক বসানো হলো
         value={qty}
         onChange={(e) => {
            const val = e.target.value;
            // যদি ইনপুট খালি হয়, 0 সেট করো। নাহলে সংখ্যায় কনভার্ট করো।
            setQty(val === "" ? 0 : parseInt(val));
         }}
         className="w-20 p-2 rounded-lg border border-gray-300 font-bold text-center text-sm focus:ring-2 focus:ring-blue-500"
       />
       <button 
         onClick={handleOrder}
         // 0 হলে বাটন ডিসেবল থাকবে
         disabled={loading || !product.basePrice || qty <= 0}
         className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-black transition flex justify-center items-center gap-2 disabled:opacity-50"
       >
         {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
         Order
       </button>
    </div>
  );
}