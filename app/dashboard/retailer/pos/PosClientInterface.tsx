"use client";

import { useState, useEffect } from "react"; // ✅ useEffect import করা হয়েছে
import { 
  Search, ShoppingCart, Tablets, Package, 
  CheckCircle, Printer, X, Plus, Minus, CreditCard, Banknote 
} from "lucide-react";
import { processRetailSale } from "@/lib/actions/pos-actions";

export default function PosClientInterface({ inventory }: { inventory: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form States
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState<"STRIP" | "TABLET">("STRIP");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  
  // ✅ FIX: Hydration Error সমাধানের জন্য Order ID স্টেট
  const [orderId, setOrderId] = useState("POS-000");

  // ✅ FIX: শুধুমাত্র ক্লায়েন্ট সাইডে র‍্যান্ডম নম্বর জেনারেট হবে
  useEffect(() => {
    setOrderId(`POS-${Math.floor(1000 + Math.random() * 9000)}`);
  }, [successData]); // successData চেঞ্জ হলে নতুন অর্ডার আইডি জেনারেট হবে

  // 🔍 Filter Logic
  const filteredInventory = inventory.filter((item) => 
    item.batch.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch.product.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 💰 Price Calculation
  const calculateTotal = () => {
    if (!selectedItem) return 0;
    const pricePerStrip = selectedItem.sellingPrice > 0 ? selectedItem.sellingPrice : selectedItem.batch.mrp;
    
    if (unitType === "STRIP") {
      return pricePerStrip * quantity;
    } else {
      const tabsPerStrip = selectedItem.batch.product.tabletsPerStrip || 10;
      const pricePerTab = pricePerStrip / tabsPerStrip;
      return pricePerTab * quantity;
    }
  };

  // 🛒 Handle Sale
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
          alert(res.error);
        }
    } catch (err) {
        alert("Something went wrong!");
    }
    setLoading(false);
  }

  // ✅ INVOICE SUCCESS SCREEN
  if (successData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in space-y-8">
        <div className="bg-emerald-50 p-8 rounded-full shadow-inner">
          <CheckCircle size={80} className="text-emerald-500 drop-shadow-sm" />
        </div>
        
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Payment Received!</h1>
            <p className="text-slate-500 font-medium">Transaction recorded successfully.</p>
        </div>
        
        <div className="bg-white border border-dashed border-slate-300 p-8 rounded-2xl w-full max-w-sm shadow-sm relative">
            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-300"></div>
            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-300"></div>
            
            <div className="space-y-4 text-sm font-medium text-slate-600">
              <div className="flex justify-between border-b pb-2 border-slate-100">
                  <span>Medicine</span> 
                  <span className="font-bold text-slate-900 text-base">{successData.item}</span>
              </div>
              <div className="flex justify-between">
                  <span>Quantity</span> 
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">{successData.qty} {successData.type === 'STRIP' ? 'Strips' : 'Tabs'}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200">
                  <span className="text-lg font-bold text-slate-800">Total Paid</span> 
                  <span className="text-2xl font-black text-emerald-600">₹{successData.total}</span>
              </div>
            </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg hover:shadow-xl active:scale-95">
            <Printer size={20} /> Print Receipt
          </button>
          <button onClick={() => setSuccessData(null)} className="px-8 py-3.5 rounded-xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95">
            Next Customer
          </button>
        </div>
      </div>
    );
  }

  // ✅ MAIN POS INTERFACE
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[calc(100vh-140px)]">
      
      {/* 📦 LEFT: PRODUCT SEARCH LIST */}
      <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="relative group">
                <Search className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition" size={20} />
                <input 
                    type="text" 
                    placeholder="Search medicine by name (e.g. Calpol)..." 
                    className="w-full pl-12 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-lg placeholder:text-slate-400"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
        </div>

        {/* Medicine List Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInventory.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-slate-400">
                        <Package size={48} className="mb-4 opacity-20"/>
                        <p>No medicines found.</p>
                    </div>
                )}
                
                {filteredInventory.map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => { setSelectedItem(item); setQuantity(1); setUnitType("STRIP"); }}
                        className={`text-left p-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${selectedItem?.id === item.id ? 'border-blue-500 bg-white ring-4 ring-blue-500/10 shadow-lg translate-x-1' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'}`}
                    >
                        {selectedItem?.id === item.id && <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>}
                        
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-700 transition">{item.batch.product.name}</h3>
                                <p className="text-xs font-medium text-slate-500">{item.batch.product.genericName}</p>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                                {item.batch.product.strength}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <div className="flex flex-col bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex-1">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Strip Stock</span>
                                <span className="text-sm font-black text-blue-700">{item.currentStock}</span>
                            </div>
                            <div className="flex flex-col bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex-1">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Loose Tabs</span>
                                <span className="text-sm font-black text-amber-700">{item.looseStock}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 🧾 RIGHT: BILLING PANEL */}
      <div className="lg:col-span-5 h-full flex flex-col">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
            
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <ShoppingCart size={24} className="text-blue-400"/> Current Bill
                </h2>
                {/* ✅ FIX: Order ID এখন state থেকে আসছে */}
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20 font-mono">
                    Order #{orderId}
                </span>
            </div>

            <div className="flex-1 p-6 flex flex-col">
                {selectedItem ? (
                    <form onSubmit={handleSale} className="flex flex-col h-full">
                        
                        {/* Selected Item Info */}
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 relative mb-6">
                            <button type="button" onClick={() => setSelectedItem(null)} className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-50 p-1.5 rounded-full shadow-sm border border-slate-200 transition">
                                <X size={16}/>
                            </button>
                            <p className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">Selected Item</p>
                            <h3 className="text-2xl font-black text-slate-800">{selectedItem.batch.product.name}</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                                <span className="bg-white px-2 py-0.5 rounded border border-blue-100 text-xs">
                                    Batch: {selectedItem.batch.batchNumber}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span>1 Strip = {selectedItem.batch.product.tabletsPerStrip || 10} Tabs</span>
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6 flex-1">
                            
                            {/* Unit Type Selection */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Sell As</label>
                                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                                    <button 
                                        type="button" 
                                        onClick={() => setUnitType("STRIP")} 
                                        className={`py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${unitType === 'STRIP' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Package size={18}/> Full Strip
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setUnitType("TABLET")} 
                                        className={`py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${unitType === 'TABLET' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Tablets size={18}/> Loose Tabs
                                    </button>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Quantity</label>
                                <div className="flex items-center gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-14 h-14 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition active:scale-95"
                                    >
                                        <Minus size={24}/>
                                    </button>
                                    
                                    <div className="flex-1 h-14 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={quantity} 
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                                            className="w-full h-full bg-transparent text-center font-black text-2xl outline-none z-10 relative"
                                        />
                                        <span className="absolute right-4 text-xs font-bold text-slate-300 uppercase tracking-widest pointer-events-none">
                                            {unitType === 'STRIP' ? 'PKTS' : 'UNITS'}
                                        </span>
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-black transition active:scale-95 shadow-lg shadow-slate-200"
                                    >
                                        <Plus size={24}/>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Footer Totals */}
                        <div className="mt-auto pt-6 border-t border-dashed border-slate-300">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 mb-1">Total Payable</p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1"><Banknote size={12}/> CASH</span>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold flex items-center gap-1"><CreditCard size={12}/> UPI</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-slate-800 tracking-tighter">₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    <>Confirm & Print Receipt <Printer size={20} className="opacity-60"/></>
                                )}
                            </button>
                        </div>

                    </form>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-50">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                            <ShoppingCart size={48} className="text-slate-400"/>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Cart is Empty</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-[200px]">Select a medicine from the left list to create a bill.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
}