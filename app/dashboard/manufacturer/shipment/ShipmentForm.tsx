"use client";

import { useState } from "react";
import { createShipmentAction } from "@/lib/actions/manufacturer-actions";
import { useRouter } from "next/navigation";

export default function ShipmentForm({ inventory, distributors }: { inventory: any[], distributors: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // সিলেক্ট করা ব্যাচের ডিটেইলস দেখানোর জন্য স্টেট
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const selectedBatch = inventory.find(item => item.batch.id === selectedBatchId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const result = await createShipmentAction(formData);

    if (result.success) {
      alert(result.message);
      router.push("/dashboard/manufacturer");
      router.refresh();
    } else {
      alert("❌ " + result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Select Distributor */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Select Distributor</label>
        <select name="distributorId" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">-- Choose a Distributor --</option>
          {distributors.map((dist) => (
            <option key={dist.id} value={dist.id}>
              {dist.name} ({dist.address || "No Address"})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Select Medicine from Stock */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Select Medicine Batch</label>
        <select 
          name="batchId" 
          required 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          onChange={(e) => setSelectedBatchId(e.target.value)}
        >
          <option value="">-- Choose from Inventory --</option>
          {inventory.map((item) => (
            <option key={item.batch.id} value={item.batch.id}>
              {item.batch.product.name} - {item.batch.batchNumber} (Available: {item.currentStock})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Quantity & Price Input */}
      {selectedBatch && (
        <div className="bg-blue-50 p-4 rounded-xl space-y-4 border border-blue-100 animate-fade-in">
           <div className="text-sm text-blue-800">
              Selected: <strong>{selectedBatch.batch.product.name}</strong> <br/>
              Max Available: <strong>{selectedBatch.currentStock} Units</strong>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-600 mb-1">Quantity to Send</label>
               <input 
                 name="quantity" 
                 type="number" 
                 max={selectedBatch.currentStock} 
                 min="1"
                 required 
                 placeholder="e.g. 100" 
                 className="w-full p-2 rounded border border-blue-200" 
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-600 mb-1">Price Per Unit (₹)</label>
               <input 
                 name="price" 
                 type="number" 
                 step="0.01" 
                 defaultValue={selectedBatch.batch.mrp * 0.8} // Default: 20% less than MRP
                 required 
                 className="w-full p-2 rounded border border-blue-200" 
               />
             </div>
           </div>
        </div>
      )}

      {/* Submit */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition disabled:opacity-70"
      >
        {loading ? "Dispatching..." : "Confirm & Dispatch 🚚"}
      </button>

    </form>
  );
}