"use client";

import { useState } from "react";
import { createDistributorShipmentAction } from "@/lib/actions/distributor-actions";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateShipmentForm({ inventory, retailers }: { inventory: any[], retailers: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Form States
  const [selectedInvId, setSelectedInvId] = useState("");
  const [maxStock, setMaxStock] = useState(0);
  const [price, setPrice] = useState(0);

  const handleInventoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invId = e.target.value;
    setSelectedInvId(invId);
    
    // Find selected item to set limits
    const item = inventory.find(i => i.id === invId);
    if (item) {
      setMaxStock(item.currentStock);
      // অটোমেটিক একটা সেলিং প্রাইস সেট করছি (MRP থেকে ১০% ডিসকাউন্ট)
      setPrice(item.batch.mrp * 0.9); 
    } else {
      setMaxStock(0);
      setPrice(0);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    // Price আলাদা করে সেট করছি যদি ইউজার এডিট করে থাকে
    // NaN চেক: যদি প্রাইস ভ্যালিড না হয় তবে 0 যাবে
    const finalPrice = Number.isNaN(price) ? 0 : price;
    formData.append("price", finalPrice.toString());

    const res = await createDistributorShipmentAction(formData);

    if (res.success) {
      alert("🎉 " + res.message);
      router.push("/dashboard/distributor"); // ড্যাশবোর্ডে ফেরত যাবে
    } else {
      alert("❌ " + res.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Select Retailer */}
      <div>
         <label className="block text-sm font-bold text-gray-700 mb-2">Select Retailer</label>
         <select name="retailerId" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">-- Choose a Retailer --</option>
            {retailers.length === 0 && <option disabled>No retailers found!</option>}
            {retailers.map((r) => (
               <option key={r.id} value={r.id}>{r.name} - {r.address || "No Address"}</option>
            ))}
         </select>
      </div>

      {/* 2. Select Product from Inventory */}
      <div>
         <label className="block text-sm font-bold text-gray-700 mb-2">Select Product from Stock</label>
         <select 
            name="inventoryId" 
            required 
            onChange={handleInventoryChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
         >
            <option value="">-- Choose Product --</option>
            {inventory.map((item) => (
               <option key={item.id} value={item.id}>
                  {item.batch.product.name} (Batch: {item.batch.batchNumber}) - Stock: {item.currentStock}
               </option>
            ))}
         </select>
      </div>

      {/* 3. Quantity & Price */}
      <div className="grid grid-cols-2 gap-6">
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
            <input 
               name="quantity" 
               type="number" 
               min="1" 
               max={maxStock} 
               required 
               placeholder={`Max: ${maxStock}`}
               className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Available Stock: {maxStock}</p>
         </div>
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Selling Price (Per Unit)</label>
            <input 
               type="number" 
               step="0.01"
               // 👇 FIX: যদি price NaN হয় (ফিল্ড ক্লিয়ার করলে), তখন ফাঁকা স্ট্রিং দেখাবে। এটাই এরর ফিক্স করবে।
               value={Number.isNaN(price) ? "" : price}
               onChange={(e) => setPrice(parseFloat(e.target.value))}
               required 
               className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
         </div>
      </div>

      {/* Submit Button */}
      <button 
         type="submit" 
         disabled={loading || maxStock === 0 || retailers.length === 0}
         className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
         {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
         Confirm Dispatch
      </button>

    </form>
  );
}