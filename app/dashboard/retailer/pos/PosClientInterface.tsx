"use client";

import { useState } from "react";
import { Search, ShoppingCart, Tablets, Package, CheckCircle, Printer, X } from "lucide-react";
import { processRetailSale } from "@/lib/actions/pos-actions";

export default function PosClientInterface({ inventory }: { inventory: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form States
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState<"STRIP" | "TABLET">("STRIP");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // 🔍 সার্চ লজিক
  const filteredInventory = inventory.filter((item) => 
    item.batch.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch.product.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 💰 প্রাইস ক্যালকুলেশন
  const calculateTotal = () => {
    if (!selectedItem) return 0;
    // Selling price না থাকলে MRP ব্যবহার করবে
    const pricePerStrip = selectedItem.sellingPrice > 0 ? selectedItem.sellingPrice : selectedItem.batch.mrp;
    
    if (unitType === "STRIP") {
      return pricePerStrip * quantity;
    } else {
      const tabsPerStrip = selectedItem.batch.product.tabletsPerStrip || 10;
      const pricePerTab = pricePerStrip / tabsPerStrip;
      return pricePerTab * quantity;
    }
  };

  // 🛒 Handle Sale Submission
  async function handleSale(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const total = calculateTotal();
    const formData = new FormData();
    formData.append("inventoryId", selectedItem.id);
    formData.append("quantity", quantity.toString());
    formData.append("unitType", unitType);
    formData.append("totalAmount", total.toFixed(2));

    try {
        const res = await processRetailSale(formData);

        if (res.success) {
          setSuccessData({
            item: selectedItem.batch.product.name,
            qty: quantity,
            type: unitType,
            total: total.toFixed(2)
          });
          setSelectedItem(null);
          setQuantity(1);
        } else {
          alert(res.error); // Error from backend
        }
    } catch (err) {
        alert("Something went wrong!");
    }
    
    setLoading(false);
  }

  // ✅ INVOICE / SUCCESS SCREEN
  if (successData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="bg-green-100 p-6 rounded-full">
          <CheckCircle size={64} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Sale Successful!</h1>
        
        <div className="bg-white p-6 border rounded-xl shadow-sm w-full max-w-sm text-left">
            <h3 className="font-bold text-xl border-b pb-2 mb-4 text-center">Receipt</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Medicine:</span> <span className="font-bold">{successData.item}</span></div>
              <div className="flex justify-between"><span>Unit:</span> <span>{successData.type}</span></div>
              <div className="flex justify-between"><span>Quantity:</span> <span>{successData.qty}</span></div>
              <div className="border-t pt-2 mt-2 flex justify-between text-lg font-black text-slate-900">
                  <span>Paid:</span> <span>₹{successData.total}</span>
              </div>
            </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800">
            <Printer size={20} /> Print
          </button>
          <button onClick={() => setSuccessData(null)} className="px-6 py-3 rounded-xl font-bold border border-slate-300 hover:bg-slate-50">
            Next Sale
          </button>
        </div>
      </div>
    );
  }

  // ✅ MAIN POS INTERFACE
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 1. Product Search List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search medicine by name..." 
            className="w-full pl-12 p-3.5 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] overflow-y-auto pr-2 content-start">
          {filteredInventory.length === 0 && (
              <p className="text-gray-400 col-span-2 text-center mt-10">No medicines found.</p>
          )}
          {filteredInventory.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setSelectedItem(item); setQuantity(1); setUnitType("STRIP"); }}
              className={`text-left p-5 rounded-2xl border transition hover:shadow-md ${selectedItem?.id === item.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 bg-white'}`}
            >
              <h3 className="font-bold text-gray-800 text-lg">{item.batch.product.name}</h3>
              <p className="text-xs text-gray-500 font-medium mb-2">{item.batch.product.strength}</p>
              
              <div className="flex gap-2 text-xs font-bold">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {item.currentStock} Strips
                </span>
                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded">
                    {item.looseStock} Tabs
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">Exp: {new Date(item.batch.expDate).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Billing Panel (Right Side) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 h-fit shadow-xl sticky top-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ShoppingCart size={20}/> Billing
        </h2>

        {selectedItem ? (
          <form onSubmit={handleSale} className="space-y-6">
            
            {/* Selected Item Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
              <button 
                type="button" 
                onClick={() => setSelectedItem(null)} 
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <X size={18}/>
              </button>
              <p className="text-lg font-bold text-gray-800">{selectedItem.batch.product.name}</p>
              <p className="text-xs font-mono mt-1 text-blue-600 font-bold">
                1 Strip = {selectedItem.batch.product.tabletsPerStrip || 10} Tablets
              </p>
            </div>

            {/* Type Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Sell As</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setUnitType("STRIP")} className={`p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition ${unitType === 'STRIP' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <Package size={16}/> Strip
                </button>
                <button type="button" onClick={() => setUnitType("TABLET")} className={`p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition ${unitType === 'TABLET' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <Tablets size={16}/> Tablet
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Quantity</label>
              <div className="relative">
                <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                    className="w-full p-4 border border-gray-300 rounded-xl font-bold text-center text-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    {unitType === 'STRIP' ? 'Strips' : 'Tabs'}
                </span>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="flex justify-between items-center py-4 border-t border-dashed border-gray-300">
              <span className="text-gray-500 font-medium">Total Payable</span>
              <span className="text-3xl font-black text-emerald-600">₹{calculateTotal().toFixed(2)}</span>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Processing Sale..." : "Confirm & Print"}
            </button>
          </form>
        ) : (
          <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-20"/>
            <p>Select a medicine from the list to create a bill.</p>
          </div>
        )}
      </div>
    </div>
  );
}