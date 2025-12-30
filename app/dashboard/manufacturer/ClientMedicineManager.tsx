"use client";
import { useState } from "react";
import { upsertMedicineCatalog, deleteCatalogItem } from "./stock/actions";

export default function ClientMedicineManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🔥 নতুন স্টেট: ভিউ মোড টগল করার জন্য (Grid = Box View, List = Detail View)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [items, setItems] = useState([
    { id: "1", code: "MED-PARA-500", name: "Paracetamol Tablet", details: "500MG", stock: 120, price: 35.50 },
    { id: "2", code: "MED-DEPL-CV20", name: "Deplatt cv 20 Tablet", details: "1mg", stock: 45, price: 91.40 },
    { id: "3", code: "MED-LEVI-PIL500", name: "Levipil 500 Tablet", details: "500mg", stock: 200, price: 154.86 },
    { id: "4", code: "MED-ZINCO-VIT", name: "Zincovit Tablet", details: "Multivitamin", stock: 10, price: 93.8 },
    { id: "5", code: "MED-COGNI-TAM500", name: "Cognitam Plus Citicoline Piracetam Tablet", details: "500mg", stock: 200, price: 698.00 },
    { id: "6", code: "MED-AMLO-VAS5", name: "Amlovas-5", details: "Multivitamin", stock: 10, price: 70.50 },
    { id: "7", code: "MED-LEVI-PIL500", name: "Levipil 500 Tablet", details: "500mg", stock: 200, price: 12.00 },
    { id: "8", code: "MED-ZINCO-VIT", name: "Zincovit Tablet", details: "Multivitamin", stock: 10, price: 8.50 },
    { id: "9", code: "MED-LEVI-PIL500", name: "Levipil 500 Tablet", details: "500mg", stock: 200, price: 12.00 },
    { id: "10", code: "MED-ZINCO-VIT", name: "Zincovit Tablet", details: "Multivitamin", stock: 10, price: 8.50 },
    { id: "11", code: "MED-LEVI-PIL500", name: "Levipil 500 Tablet", details: "500mg", stock: 200, price: 12.00 },
    { id: "12", code: "MED-ZINCO-VIT", name: "Zincovit Tablet", details: "Multivitamin", stock: 10, price: 8.50 },
  ]);

  const [newName, setNewName] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (index: number | null = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setNewName(items[index].name);
      setNewDetails(items[index].details);
      setNewCode(items[index].code);
      setNewPrice(items[index].price?.toString() || "");
    } else {
      setEditingIndex(null);
      setNewName("");
      setNewDetails("");
      setNewCode("");
      setNewPrice("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const priceVal = parseFloat(newPrice) || 0;

    const result = await upsertMedicineCatalog({
      name: newName,
      details: newDetails,
      code: newCode.toUpperCase(),
      price: priceVal
    });

    if (result.success) {
      if (editingIndex !== null) {
        const updatedItems = [...items];
        updatedItems[editingIndex] = { ...updatedItems[editingIndex], name: newName, details: newDetails, code: newCode, price: priceVal };
        setItems(updatedItems);
      } else {
        setItems([...items, { 
          id: Date.now().toString(), 
          code: newCode, 
          name: newName, 
          details: newDetails, 
          stock: 0,
          price: priceVal
        }]);
      }
      alert("✅ Product Saved Successfully!");
    } else {
      alert("❌ Failed to save: " + result.error);
    }
    setLoading(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 mt-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-[#0D1B3E] to-blue-400"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div>
          <h3 className="text-2xl font-black text-[#0D1B3E] uppercase tracking-tighter">Medicine Master Catalog</h3>
          <p className="text-xs text-gray-400 font-bold mt-1 tracking-widest">Manage your pharmaceutical inventory</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          
          {/* 🔥 VIEW TOGGLE BUTTONS (NEW) */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="List View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative group flex-1">
             <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-gray-50 border border-gray-100 py-3 px-4 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all uppercase placeholder:text-gray-300" />
             <span className="absolute right-3 top-3 text-gray-300 group-hover:text-blue-500 transition-colors">🔍</span>
          </div>

          <button onClick={() => handleOpenModal()} className="bg-[#0D1B3E] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-all whitespace-nowrap">
            + New
          </button>
        </div>
      </div>

      {/* 🔥 SCROLLABLE CONTENT AREA */}
      <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        
        {viewMode === 'grid' ? (
          /* --- GRID VIEW (BOX STYLE) --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                <div className={`absolute top-6 left-6 w-2 h-2 rounded-full ${item.stock < 20 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => handleOpenModal(idx)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">✏️</button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">🗑️</button>
                </div>

                <div className="flex justify-center mb-4 mt-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-white rounded-full flex items-center justify-center shadow-inner border border-gray-50 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">💊</span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <span className="inline-block bg-gray-50 text-gray-400 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest mb-1 border border-gray-100">{item.code}</span>
                  <h4 className="text-sm font-black text-[#0D1B3E] leading-tight">{item.name}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">{item.details}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                   <div><p className="text-[8px] text-gray-300 font-bold uppercase">Stock</p><p className={`text-xs font-black ${item.stock < 20 ? 'text-red-500' : 'text-[#0D1B3E]'}`}>{item.stock}</p></div>
                   <div className="text-right"><p className="text-[8px] text-gray-300 font-bold uppercase">Price</p><p className="text-xs font-black text-blue-600">₹{item.price?.toFixed(2)}</p></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- 🔥 LIST VIEW (NEW DETAIL STYLE) --- */
          <div className="space-y-3">
            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
               <div className="col-span-1">Icon</div>
               <div className="col-span-2">Code</div>
               <div className="col-span-4">Medicine Name</div>
               <div className="col-span-2 text-center">Stock</div>
               <div className="col-span-2 text-right">Price</div>
               <div className="col-span-1 text-center">Action</div>
            </div>

            {/* List Rows */}
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-white border border-gray-50 p-4 rounded-2xl hover:shadow-md hover:border-blue-100 transition-all group">
                 <div className="col-span-1"><span className="text-xl">💊</span></div>
                 <div className="col-span-2"><span className="bg-gray-50 text-gray-500 text-[9px] font-bold px-2 py-1 rounded-lg border border-gray-100">{item.code}</span></div>
                 <div className="col-span-4">
                    <h4 className="text-xs font-black text-[#0D1B3E]">{item.name}</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{item.details}</p>
                 </div>
                 <div className="col-span-2 text-center">
                    <span className={`text-xs font-black ${item.stock < 20 ? 'text-red-500 bg-red-50 px-2 py-1 rounded-lg' : 'text-green-600 bg-green-50 px-2 py-1 rounded-lg'}`}>{item.stock}</span>
                 </div>
                 <div className="col-span-2 text-right">
                    <span className="text-xs font-bold text-blue-600">₹{item.price?.toFixed(2)}</span>
                 </div>
                 <div className="col-span-1 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(idx)} className="text-blue-500 hover:scale-110 transition-transform">✏️</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:scale-110 transition-transform">🗑️</button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-xs font-bold text-gray-400 uppercase">No medicines found</p>
        </div>
      )}

      {/* --- MODAL (SAME AS BEFORE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0D1B3E]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 relative border border-white/20">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors font-bold text-xl">✕</button>
            <h2 className="text-2xl font-black text-[#0D1B3E] uppercase mb-2 text-center tracking-tighter">{editingIndex !== null ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Enter medicine details below</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2"><label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Unique Code</label><input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. MED-001" className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold uppercase text-xs border border-transparent focus:border-blue-200 focus:bg-white transition-all" required /></div>
                <div className="space-y-2"><label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Dosage / Details</label><input value={newDetails} onChange={(e) => setNewDetails(e.target.value)} placeholder="e.g. 500mg" className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-xs border border-transparent focus:border-blue-200 focus:bg-white transition-all" required /></div>
              </div>
              <div className="space-y-2"><label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Medicine Name</label><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter full name" className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-200 focus:bg-white transition-all" required /></div>
              <div className="space-y-2"><label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Price Per Strip (₹)</label><input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0.00" className="w-full bg-blue-50 p-4 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-blue-300 focus:bg-white transition-all text-blue-700" required /></div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#0D1B3E] text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-all">{loading ? "SAVING..." : "SAVE PRODUCT"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}