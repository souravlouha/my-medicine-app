"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, ShoppingCart, Package, CheckCircle, Printer, X, Plus, Minus, 
  CreditCard, Banknote, Trash2, Receipt, Syringe, Tablets, ScanBarcode, PenTool, Database 
} from "lucide-react";
import { processRetailSale } from "@/lib/actions/pos-actions";

// কার্ট আইটেমের টাইপ
interface CartItem {
  id: number; 
  inventoryId: string | null; // ম্যানুয়াল আইটেমের জন্য null হতে পারে
  name: string;
  generic: string;
  batchNo: string;
  quantity: number;
  unitType: "STRIP" | "TABLET" | "UNIT";
  pricePerUnit: string; 
  totalPrice: number;
  isManual: boolean; // নতুন ফ্ল্যাগ
}

export default function PosClientInterface({ inventory }: { inventory: any[] }) {
  const [activeTab, setActiveTab] = useState<"search" | "manual">("search");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  
  // ✅ Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Selection States
  const [qty, setQty] = useState(1);
  const [uType, setUType] = useState<"STRIP" | "TABLET" | "UNIT">("STRIP");
  
  // Manual Entry States
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [orderId, setOrderId] = useState("POS-000");

  useEffect(() => {
    setOrderId(`POS-${Math.floor(1000 + Math.random() * 9000)}`);
  }, [success]);

  // 🔍 Filter Logic
  const filtered = useMemo(() => inventory.filter(i => 
    (i.batch.product.name + i.batch.product.genericName).toLowerCase().includes(search.toLowerCase())
  ), [inventory, search]);

  // Helper Variables
  const tabsPerStrip = selected?.batch?.product?.tabletsPerStrip || 1;
  const isMulti = tabsPerStrip > 1;
  const itemType = selected?.batch?.product?.type || "TABLET";

  // 💰 Price Calculation
  const calcTotal = () => {
    if (!selected) return 0;
    const basePrice = selected.sellingPrice || selected.batch.mrp;
    return (uType === "STRIP" || uType === "UNIT" ? basePrice : basePrice / tabsPerStrip) * qty;
  };

  // ✅ ADD INVENTORY ITEM TO BILL
  const addToBill = () => {
    if (!selected) return;
    const total = calcTotal();
    const finalType = !isMulti ? "UNIT" : uType;

    const newItem: CartItem = {
      id: Date.now(),
      inventoryId: selected.id,
      name: selected.batch.product.name,
      generic: selected.batch.product.genericName,
      batchNo: selected.batch.batchNumber,
      quantity: qty,
      unitType: finalType,
      pricePerUnit: (total / qty).toFixed(2),
      totalPrice: total,
      isManual: false
    };

    setCart([...cart, newItem]);
    setSelected(null); setQty(1); setUType("STRIP"); setSearch("");
  };

  // ✅ ADD MANUAL ITEM TO BILL
  const addManualToBill = () => {
    if (!manualName || !manualPrice) return;
    
    const price = parseFloat(manualPrice);
    const total = price * qty;

    const newItem: CartItem = {
      id: Date.now(),
      inventoryId: null, // No DB ID
      name: manualName,
      generic: "Manual Entry",
      batchNo: "N/A",
      quantity: qty,
      unitType: "UNIT", // Default to Unit
      pricePerUnit: price.toFixed(2),
      totalPrice: total,
      isManual: true
    };

    setCart([...cart, newItem]);
    setManualName(""); setManualPrice(""); setQty(1);
  };

  // 🗑️ REMOVE FROM BILL
  const removeFromBill = (id: number) => {
    setCart(cart.filter(c => c.id !== id));
  };

  // 🚀 HANDLE CHECKOUT
  const handleCheckout = async () => {
    if (!cart.length) return;
    setLoading(true);
    
    const total = cart.reduce((s, i) => s + i.totalPrice, 0).toFixed(2);
    const formData = new FormData();
    
    formData.append("cartData", JSON.stringify(cart));
    formData.append("totalAmount", total);

    try {
        const res = await processRetailSale(formData);
        if (res.success) {
          setSuccess({ total, count: cart.length, orderId });
          setCart([]);
        } else {
          alert(res.error);
        }
    } catch (e) {
        alert("Transaction failed");
    }
    setLoading(false);
  };

  // ✅ SUCCESS SCREEN
  if (success) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-8 animate-fade-in bg-slate-50/50">
      <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100 text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-emerald-500">
           <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Payment Received</h1>
        <p className="text-slate-500 font-medium">Order ID: <span className="font-mono text-slate-800 font-bold">#{success.orderId}</span></p>
        
        <div className="my-8 py-6 border-y border-dashed border-slate-200">
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
           <p className="text-5xl font-black text-slate-900 tracking-tighter">₹{success.total}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex-1 flex justify-center items-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95">
            <Printer size={18}/> Print Receipt
          </button>
          <button onClick={() => setSuccess(null)} className="flex-1 py-3.5 rounded-xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
            Next Sale
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] animate-fade-in">
      
      {/* 📦 LEFT: SEARCH & MANUAL TABS */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* TABS HEADER */}
        <div className="p-2 m-4 bg-slate-100 rounded-2xl flex gap-1 border border-slate-200">
            <button 
                onClick={() => setActiveTab("search")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Database size={18}/> Inventory Search
            </button>
            <button 
                onClick={() => setActiveTab("manual")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <PenTool size={18}/> Manual Entry
            </button>
        </div>

        {/* TAB 1: INVENTORY SEARCH */}
        {activeTab === "search" && (
            <>
                <div className="px-6 pb-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="relative group">
                        <Search className="absolute left-5 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                        type="text" placeholder="Search medicine by name, generic..." 
                        className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-lg placeholder:text-slate-400"
                        onChange={e => setSearch(e.target.value)} value={search} autoFocus 
                        />
                        <div className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                            <ScanBarcode size={20} opacity={0.5}/>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {!filtered.length ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Package size={48} className="text-slate-300"/>
                        </div>
                        <h3 className="text-lg font-bold text-slate-600">No products found</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2">Try searching with a different keyword or scan a barcode.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 content-start pb-20">
                    {filtered.map(i => (
                        <button 
                        key={i.id} onClick={() => { setSelected(i); setQty(1); setUType("STRIP"); }}
                        className={`text-left p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                            selected?.id === i.id 
                            ? 'border-indigo-500 bg-white ring-4 ring-indigo-500/10 shadow-xl scale-[1.02] z-10' 
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-1'
                        }`}
                        >
                        {selected?.id === i.id && <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>}
                        
                        <div className="flex justify-between items-start mb-3 pl-2">
                            <div>
                            <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{i.batch.product.name}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{i.batch.product.genericName}</p>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 uppercase tracking-wider">
                                {i.batch.product.type}
                            </span>
                        </div>
                        
                        <div className="flex gap-2 pl-2">
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                                Stock: {i.currentStock}
                            </span>
                            {i.batch.product.tabletsPerStrip > 1 && (
                                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-100">
                                    Loose: {i.looseStock}
                                </span>
                            )}
                        </div>
                        </button>
                    ))}
                    </div>
                )}
                </div>
            </>
        )}

        {/* TAB 2: MANUAL ENTRY FORM */}
        {activeTab === "manual" && (
            <div className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <PenTool size={32}/>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">Manual Item Entry</h2>
                    <p className="text-slate-500 mt-2">Add items that are not in your inventory.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Item Name</label>
                        <input 
                            value={manualName} onChange={(e) => setManualName(e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            placeholder="e.g. Bandage / Service Charge"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Price (₹)</label>
                            <input 
                                type="number"
                                value={manualPrice} onChange={(e) => setManualPrice(e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Quantity</label>
                            <div className="flex items-center border rounded-xl overflow-hidden bg-white">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-4 hover:bg-slate-100"><Minus size={18}/></button>
                                <span className="flex-1 text-center font-bold text-lg">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="p-4 hover:bg-slate-100"><Plus size={18}/></button>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={addManualToBill}
                        disabled={!manualName || !manualPrice}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 mt-4"
                    >
                        Add to Bill
                    </button>
                </div>
            </div>
        )}

      </div>

      {/* 🧾 RIGHT: CART & BILLING */}
      <div className="lg:col-span-5 h-full flex flex-col gap-6">
        
        {/* A. SELECTION PANEL (Conditional - Only for Inventory Items) */}
        {activeTab === "search" && selected && (
          <div className="bg-white p-6 rounded-[32px] border border-indigo-100 shadow-xl shadow-indigo-100/50 animate-slide-in-up relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-white rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Currently Adding</p>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{selected.batch.product.name}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                   <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Batch: {selected.batch.batchNumber}</span>
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={20}/></button>
            </div>

            {isMulti ? (
              <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                <button 
                  onClick={() => setUType("STRIP")} 
                  className={`p-3 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all ${uType === 'STRIP' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-200 hover:bg-white'}`}
                >
                   <Package size={20}/> 
                   <span>{itemType === 'INJECTION' ? 'Full Box' : 'Full Strip'}</span>
                </button>
                <button 
                  onClick={() => setUType("TABLET")} 
                  className={`p-3 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all ${uType === 'TABLET' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-orange-200 hover:bg-white'}`}
                >
                   {itemType === 'INJECTION' ? <Syringe size={20}/> : <Tablets size={20}/>} 
                   <span>Loose Unit</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-xl text-center text-xs font-bold text-slate-500 border border-slate-200 mb-6 uppercase tracking-wide">
                 Selling as Single Unit
              </div>
            )}

            <div className="flex gap-4 relative z-10">
              <div className="flex items-center border-2 border-slate-100 rounded-2xl bg-slate-50">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-4 hover:text-indigo-600 transition-colors"><Minus size={20}/></button>
                <span className="w-12 text-center font-black text-xl text-slate-800">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-4 hover:text-indigo-600 transition-colors"><Plus size={20}/></button>
              </div>
              <button 
                onClick={addToBill} 
                className="flex-1 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Add <span className="opacity-40">|</span> <span>₹{calcTotal().toFixed(2)}</span>
              </button>
            </div>
          </div>
        )}

        {/* B. CART LIST */}
        <div className={`bg-white rounded-[32px] border border-slate-200 shadow-xl flex-1 flex flex-col overflow-hidden relative ${selected && activeTab === 'search' ? 'h-[calc(100%-340px)]' : 'h-full'}`}>
          <div className="bg-white/80 backdrop-blur-md p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
            <h2 className="font-bold flex items-center gap-2 text-slate-800"><Receipt size={20} className="text-indigo-600"/> Current Bill</h2>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">#{orderId}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
            {!cart.length && (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingCart size={48} className="mb-3 text-slate-300"/> 
                  <p className="font-bold text-slate-400">Cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Add items to start billing.</p>
               </div>
            )}
            {cart.map(i => (
              <div key={i.id} className={`flex justify-between items-center bg-slate-50 p-4 rounded-2xl border group hover:bg-white hover:shadow-sm transition-all ${i.isManual ? 'border-orange-200 bg-orange-50/50' : 'border-slate-100'}`}>
                <div>
                  <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">{i.name}</p>
                      {i.isManual && <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">MANUAL</span>}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex gap-2">
                     <span className={i.unitType === 'STRIP' ? 'text-indigo-600' : 'text-orange-600'}>
                        {i.quantity} {i.isManual ? 'Units' : (i.unitType === 'STRIP' ? 'Strips' : (i.unitType === 'UNIT' ? 'Units' : 'Tabs'))}
                     </span>
                     <span className="opacity-30">|</span>
                     <span>₹{i.pricePerUnit}/unit</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-slate-800">₹{i.totalPrice.toFixed(2)}</span>
                  <button onClick={() => removeFromBill(i.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>

          {/* C. CHECKOUT FOOTER */}
          <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
            <div className="flex justify-between items-end mb-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Mode</p>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-100 flex items-center gap-1"><Banknote size={12}/> CASH</span>
                   <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-bold border border-purple-100 flex items-center gap-1"><CreditCard size={12}/> UPI</span>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Payable</p>
                 <span className="text-4xl font-black text-slate-900 tracking-tight">₹{cart.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout} 
              disabled={!cart.length || loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 transition-all hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex justify-center items-center gap-2"
            >
              {loading ? (
                 <span className="animate-pulse">Processing Transaction...</span>
              ) : (
                 <>Confirm Sale <CheckCircle size={20}/></>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}