"use client";

import { useState } from "react";
import { createProductAction, updateProductAction } from "@/lib/actions/manufacturer-actions";
import { 
  Package, LayoutGrid, List, Plus, Edit3, X, CheckCircle2, AlertCircle, Pill, Syringe 
} from "lucide-react";

// ✅ UPDATED EMOJI HELPER
const getMedicineEmoji = (type: string) => {
  switch (type) {
    case "TABLET": return "🌗";    // Updated
    case "CAPSULE": return "💊";
    case "SYRUP": return "🍶";     // Updated
    case "INJECTION": return "💉";
    case "DROPS": return "💧";
    case "CREAM": return "🧴";     // Updated
    case "SPRAY": return "💨";     // Added
    default: return "📦";
  }
};

export default function CatalogClient({ products }: { products: any[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); 
  const [isEditing, setIsEditing] = useState<any | null>(null); 
  const [loading, setLoading] = useState(false);

  // State to handle medicine type logic
  const [medType, setMedType] = useState("TABLET");
  // State for Injection Logic
  const [isMultiPack, setIsMultiPack] = useState(false);

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
      setMedType("TABLET"); 
      setIsMultiPack(false); 
      window.location.reload(); 
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  // Edit Logic
  const handleEditClick = (product: any) => {
    setIsEditing(product);
    setMedType(product.type);
    
    if (product.type === "INJECTION" && product.tabletsPerStrip > 1) {
        setIsMultiPack(true);
    } else {
        setIsMultiPack(false);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showQuantityInput = medType === "TABLET" || medType === "CAPSULE" || (medType === "INJECTION" && isMultiPack);

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
               <Package className="text-blue-600" size={32} /> Product Catalog
            </h2>
            <p className="text-slate-500 font-medium mt-1">Manage your medicine master catalog and set base prices.</p>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl">
            <button onClick={() => setViewMode("grid")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <LayoutGrid size={18}/> Grid
            </button>
            <button onClick={() => setViewMode("list")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <List size={18}/> List
            </button>
          </div>
      </div>

      {/* 2. Add / Edit Form */}
      <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8 relative z-10 border-b border-slate-100 pb-6">
           <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 {isEditing ? <><Edit3 className="text-orange-500"/> Edit Product</> : <><Plus className="text-blue-500"/> Add New Medicine</>}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
                 {isEditing ? `Editing: ${isEditing.productCode}` : "Enter product details below"}
              </p>
           </div>
           {isEditing && (
              <button onClick={() => { setIsEditing(null); setMedType("TABLET"); setIsMultiPack(false); }} className="flex items-center gap-1 text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 transition">
                 <X size={14}/> Cancel
              </button>
           )}
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
           
           <div className="opacity-60">
             <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Product Code</label>
             <input disabled placeholder={isEditing ? isEditing.productCode : "Auto Generated"} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-mono text-sm font-bold text-slate-500 cursor-not-allowed" />
           </div>

           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Brand Name</label>
             <input name="name" defaultValue={isEditing?.name} placeholder="e.g. Napa" required className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-bold text-slate-800" />
           </div>

           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Generic Name</label>
             <input name="genericName" defaultValue={isEditing?.genericName} placeholder="e.g. Paracetamol" required className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-slate-600" />
           </div>
           
           {/* Medicine Type Selector with LIVE Emoji Update */}
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Medicine Type</label>
             <div className="relative">
               <select 
                 name="type" 
                 value={medType} 
                 onChange={(e) => {
                    setMedType(e.target.value);
                    // Single Unit types logic
                    if(["SYRUP", "CREAM", "DROPS", "SPRAY"].includes(e.target.value)) {
                        setIsMultiPack(false);
                    }
                 }}
                 className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-700 appearance-none pr-12"
               >
                 <option value="TABLET">Tablet</option>
                 <option value="CAPSULE">Capsule</option>
                 <option value="SYRUP">Syrup</option>
                 <option value="INJECTION">Injection</option>
                 <option value="CREAM">Cream</option>
                 <option value="DROPS">Drops</option>
                 <option value="SPRAY">Spray</option> {/* ✅ Added Spray */}
               </select>
               
               {/* ✅ LIVE EMOJI SHOW HERE */}
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">
                  {getMedicineEmoji(medType)}
               </div>
             </div>
           </div>

           {/* Dynamic Injection Logic */}
           {medType === "INJECTION" && (
                <div className="md:col-span-2 lg:col-span-3 bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center animate-fade-in-up">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Syringe size={20} />
                        <span className="text-sm font-bold uppercase tracking-wide">Packaging Logic:</span>
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="packType" checked={!isMultiPack} onChange={() => setIsMultiPack(false)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition">Single Unit <span className="text-slate-400 font-normal">(1 Vial/Box)</span></span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="packType" checked={isMultiPack} onChange={() => setIsMultiPack(true)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition">Multi Pack <span className="text-slate-400 font-normal">(Many Ampules/Box)</span></span>
                        </label>
                    </div>
                </div>
           )}

           {/* Dynamic Quantity Field */}
           {showQuantityInput ? (
               <div className="animate-fade-in">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex justify-between">
                   {medType === "INJECTION" ? "Ampules per Box" : "Strip Size"} 
                   <span className="text-blue-500 lowercase font-normal">
                       ({medType === "INJECTION" ? "vials count" : "tablets per strip"})
                   </span>
                 </label>
                 <div className="relative">
                   <input name="tabletsPerStrip" type="number" min="2" required defaultValue={isEditing?.tabletsPerStrip || 10} placeholder="e.g. 10" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-800" />
                   <span className="absolute right-4 top-4 text-xs font-bold text-slate-400 pointer-events-none uppercase">UNITS</span>
                 </div>
               </div>
           ) : (
               <input type="hidden" name="tabletsPerStrip" value="1" />
           )}

           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Strength</label>
             <input name="strength" defaultValue={isEditing?.strength} placeholder="e.g. 500mg" required className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-slate-600" />
           </div>
           
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Base Price (Distributor)</label>
             <div className="relative">
               <span className="absolute left-4 top-4 text-slate-400 font-bold">₹</span>
               <input name="basePrice" type="number" step="0.01" defaultValue={isEditing?.basePrice} placeholder="e.g. 80.00" className="w-full pl-8 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 text-lg" />
             </div>
             <p className="text-[10px] text-slate-400 mt-1 font-medium">Cost + Manufacturer Profit</p>
           </div>

           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Storage Temp</label>
             <input name="storageTemp" defaultValue={isEditing?.storageTemp} placeholder="e.g. <25°C" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-slate-600" />
           </div>
           
           <div className="md:col-span-2 lg:col-span-3 mt-4">
             <button disabled={loading} className={`w-full text-white p-4 rounded-xl font-bold text-lg shadow-xl transition transform active:scale-[0.98] flex items-center justify-center gap-2 ${isEditing ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:to-orange-700 shadow-orange-200' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:to-blue-800 shadow-blue-200'}`}>
               {loading ? "Processing..." : isEditing ? <><CheckCircle2/> Update Product Details</> : <><Plus/> Add to Catalog</>}
             </button>
           </div>
        </form>
      </div>

      {/* 3. Product List Display */}
      {products.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">💊</div>
           <h3 className="text-xl font-bold text-slate-800">No products found</h3>
           <p className="text-slate-500 mt-2">Your catalog is empty. Add your first medicine above!</p>
        </div>
      ) : (
        <>
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition duration-300 group relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl font-mono shadow-sm z-10">
                    {p.productCode}
                  </div>
                  
                  <div className="mb-4 relative z-10">
                    {/* ✅ DYNAMIC EMOJI IN GRID CARD */}
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner">
                       {getMedicineEmoji(p.type)}
                    </div>
                    <h4 className="font-bold text-slate-900 text-xl truncate mb-1" title={p.name}>{p.name}</h4>
                    <p className="text-xs font-medium text-slate-500 truncate bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100" title={p.genericName}>{p.genericName}</p>
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-slate-500 border-t border-slate-100 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Type</span> 
                        <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{p.type}</span>
                    </div>
                    {p.tabletsPerStrip > 1 && (
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Pack Size</span> 
                            <span className="font-bold text-slate-700">
                                {p.tabletsPerStrip} / {p.type === "INJECTION" ? "Box" : "Strip"}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Strength</span> 
                        <span className="font-bold text-slate-700">{p.strength}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Base Price</p>
                         <p className="font-black text-emerald-600 text-lg">₹{p.basePrice?.toFixed(2) || "N/A"}</p>
                      </div>
                      <button onClick={() => handleEditClick(p)} className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white p-2.5 rounded-xl transition shadow-sm" title="Edit Product">
                         <Edit3 size={18}/>
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="p-5 pl-8">Code</th>
                    <th className="p-5">Medicine Details</th>
                    <th className="p-5">Type / Strength</th>
                    <th className="p-5">Base Price</th>
                    <th className="p-5 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition group">
                      <td className="p-5 pl-8">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                             {p.productCode}
                          </span>
                      </td>
                      <td className="p-5">
                          {/* ✅ DYNAMIC EMOJI IN LIST VIEW */}
                          <div className="flex items-center gap-3">
                              <span className="text-2xl">{getMedicineEmoji(p.type)}</span>
                              <div>
                                  <p className="font-bold text-slate-800 text-base">{p.name}</p>
                                  <p className="text-xs text-slate-500 font-medium">{p.genericName}</p>
                              </div>
                          </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-blue-50 text-blue-600 border-blue-100">
                                {p.type}
                            </span>
                            {p.tabletsPerStrip > 1 && (
                                <span className="text-xs text-slate-400 font-bold">
                                    ({p.tabletsPerStrip}/{p.type === "INJECTION" ? "box" : "strip"})
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded">{p.strength}</span>
                      </td>
                      <td className="p-5 font-black text-emerald-600 text-base">₹{p.basePrice?.toFixed(2) || "N/A"}</td>
                      <td className="p-5 text-right pr-8">
                        <button onClick={() => handleEditClick(p)} className="text-slate-500 hover:text-blue-600 hover:bg-white p-2 rounded-lg transition border border-transparent hover:border-slate-200 hover:shadow-sm">
                          <Edit3 size={18}/>
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