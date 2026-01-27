"use client";

import { useState } from "react";
import { createProductAction, updateProductAction } from "@/lib/actions/manufacturer-actions";

export default function CatalogClient({ products }: { products: any[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); 
  const [isEditing, setIsEditing] = useState<any | null>(null); 
  const [loading, setLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    let res;
    if (isEditing) {
      formData.append("productId", isEditing.id);
      res = await updateProductAction(formData);
    } else {
      res = await createProductAction(formData);
    }

    if (res.success) {
      alert(res.message);
      setIsEditing(null);
      window.location.reload(); 
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
         <div>
            <h2 className="text-2xl font-bold text-gray-800">📦 Product Inventory</h2>
            <p className="text-sm text-gray-500">Manage your medicine master catalog and set Base Prices.</p>
         </div>
         
         <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🗳️ Box View
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📝 Title View
            </button>
         </div>
      </div>

      {/* 2. Add / Edit Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg border-b pb-4">
          {isEditing ? `✏️ Edit Product: ${isEditing.productCode}` : "✨ Add New Medicine"}
          {isEditing && <button onClick={() => setIsEditing(null)} className="text-xs text-red-500 underline ml-auto font-bold">Cancel Edit</button>}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="opacity-60 pointer-events-none">
             <label className="text-xs font-bold text-gray-400 mb-1 block">Product Code</label>
             <input disabled placeholder={isEditing ? isEditing.productCode : "Auto Generated"} className="w-full p-3 border rounded-xl bg-gray-50 font-mono text-sm" />
           </div>

           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Brand Name</label>
             <input name="name" defaultValue={isEditing?.name} placeholder="e.g. Napa" required className="w-full p-3 border rounded-xl focus:ring-2 ring-blue-500 outline-none" />
           </div>

           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Generic Name</label>
             <input name="genericName" defaultValue={isEditing?.genericName} placeholder="e.g. Paracetamol" required className="w-full p-3 border rounded-xl focus:ring-2 ring-blue-500 outline-none" />
           </div>
           
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Medicine Type</label>
             <select name="type" defaultValue={isEditing?.type} className="w-full p-3 border rounded-xl bg-white focus:ring-2 ring-blue-500 outline-none">
               <option value="TABLET">Tablet</option>
               <option value="SYRUP">Syrup</option>
               <option value="INJECTION">Injection</option>
               <option value="CAPSULE">Capsule</option>
               <option value="CREAM">Cream</option>
               <option value="DROPS">Drops</option>
             </select>
           </div>

           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Strength</label>
             <input name="strength" defaultValue={isEditing?.strength} placeholder="e.g. 500mg" required className="w-full p-3 border rounded-xl focus:ring-2 ring-blue-500 outline-none" />
           </div>
           
           {/* ✅ Base Price Input (Distributor Buying Price) */}
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Base Price (For Distributor)</label>
             <div className="relative">
               <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
               <input name="basePrice" type="number" step="0.01" defaultValue={isEditing?.basePrice} placeholder="e.g. 80.00" className="w-full pl-8 p-3 border rounded-xl focus:ring-2 ring-blue-500 outline-none font-bold text-gray-700" />
             </div>
             <p className="text-[10px] text-gray-400 mt-1">Cost + Manufacturer Profit</p>
           </div>

           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Storage Temp</label>
             <input name="storageTemp" defaultValue={isEditing?.storageTemp} placeholder="e.g. <25°C" className="w-full p-3 border rounded-xl focus:ring-2 ring-blue-500 outline-none" />
           </div>
           
           <div className="md:col-span-2 lg:col-span-3">
             <button disabled={loading} className={`w-full text-white p-4 rounded-xl font-bold shadow-lg transition transform active:scale-95 ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
               {loading ? "Processing..." : isEditing ? "Update Product Details" : "+ Add to Catalog"}
             </button>
           </div>
        </form>
      </div>

      {/* 3. Product List Display */}
      {products.length === 0 ? (
        <div className="text-center p-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
           <span className="text-4xl block mb-2">📦</span>
           No products found in your catalog.<br/>Add your first medicine above!
        </div>
      ) : (
        <>
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition group relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl font-mono">
                    {p.productCode}
                  </div>
                  
                  <div className="mb-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-3">💊</div>
                    <h4 className="font-bold text-gray-800 text-lg truncate" title={p.name}>{p.name}</h4>
                    <p className="text-xs text-gray-500 truncate" title={p.genericName}>{p.genericName}</p>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
                    <div className="flex justify-between"><span>Type</span> <span className="font-bold text-gray-700">{p.type}</span></div>
                    <div className="flex justify-between"><span>Strength</span> <span className="font-bold text-gray-700">{p.strength}</span></div>
                    <div className="flex justify-between"><span>Base Price</span> <span className="font-bold text-green-600 text-sm">₹{p.basePrice?.toFixed(2) || "N/A"}</span></div>
                  </div>

                  <button 
                    onClick={() => setIsEditing(p)}
                    className="w-full mt-5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 py-2.5 rounded-lg text-xs font-bold transition border border-gray-200 hover:border-blue-200"
                  >
                    ✏️ Edit Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-4 pl-6">Code</th>
                    <th className="p-4">Brand Name</th>
                    <th className="p-4">Generic</th>
                    <th className="p-4">Type/Strength</th>
                    <th className="p-4">Base Price</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 pl-6 font-mono text-xs font-bold text-blue-600 bg-blue-50/30">{p.productCode}</td>
                      <td className="p-4 font-bold text-gray-800">{p.name}</td>
                      <td className="p-4 text-gray-500">{p.genericName}</td>
                      <td className="p-4 text-gray-500">
                        <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold mr-2 uppercase">{p.type}</span>
                        {p.strength}
                      </td>
                      <td className="p-4 font-bold text-green-600">₹{p.basePrice?.toFixed(2) || "N/A"}</td>
                      <td className="p-4 text-right pr-6">
                        <button 
                          onClick={() => setIsEditing(p)}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}