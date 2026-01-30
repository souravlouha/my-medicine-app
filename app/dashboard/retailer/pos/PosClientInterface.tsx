"use client";

import { useState, useEffect } from "react";
import { 
  Search, ShoppingCart, Tablets, Package, 
  CheckCircle, Printer, X, Plus, Minus, CreditCard, Banknote, Trash2, Receipt, Syringe 
} from "lucide-react";
import { processRetailSale } from "@/lib/actions/pos-actions";
import { toast } from "sonner"; // টোস্ট নোটিফিকেশনের জন্য (অপশনাল)

// কার্ট আইটেমের টাইপ ডেফিনিশন
interface CartItem {
  id: number; // ইউনিক আইডি কার্টের জন্য (Temporary)
  inventoryId: string;
  name: string;
  generic: string;
  batchNo: string;
  quantity: number;
  unitType: "STRIP" | "TABLET" | "UNIT";
  pricePerUnit: string; // toFixed returns string
  totalPrice: number;
}

export default function PosClientInterface({ inventory }: { inventory: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // ✅ Cart State (একাধিক আইটেম রাখার জন্য)
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  
  // Selection States
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState<"STRIP" | "TABLET" | "UNIT">("STRIP");
  
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [orderId, setOrderId] = useState("POS-000");

  useEffect(() => {
    setOrderId(`POS-${Math.floor(1000 + Math.random() * 9000)}`);
  }, [successData]);

  // 🔍 Filter Logic
  const filteredInventory = inventory.filter((item) => 
    item.batch.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch.product.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper Variables for Dynamic Logic
  const tabletsPerStrip = selectedItem?.batch?.product?.tabletsPerStrip || 1;
  const itemType = selectedItem?.batch?.product?.type || "TABLET";
  
  // Logic: Is this item capable of being sold loosely? (e.g. Tablets or Multi-pack Injections)
  const isMultiPack = tabletsPerStrip > 1;

  // 💰 Calculate Single Item Price (For Selection Panel)
  const calculateCurrentItemTotal = () => {
    if (!selectedItem) return 0;
    const pricePerStrip = selectedItem.sellingPrice > 0 ? selectedItem.sellingPrice : selectedItem.batch.mrp;
    
    if (unitType === "STRIP" || unitType === "UNIT") {
      return pricePerStrip * quantity;
    } else {
      const pricePerTab = pricePerStrip / tabletsPerStrip;
      return pricePerTab * quantity;
    }
  };

  // ✅ ADD TO BILL FUNCTION
  const addToBill = () => {
      const total = calculateCurrentItemTotal();
      
      // If it's not a multi-pack item (like Syrup), force "UNIT" mode
      // But for consistency with backend Enum, let's map it:
      // If backend uses STRIP/TABLET/UNIT:
      // Single items (Syrup) -> UNIT (if backend supports) or STRIP (as full unit)
      // Multi items -> STRIP (Box) or TABLET (Loose)
      
      let finalUnitType = unitType;
      if (!isMultiPack) {
          finalUnitType = "UNIT"; // Or "STRIP" if you use STRIP for single units in backend
      }

      const newItem: CartItem = {
          id: Date.now(), // Temporary ID for UI key
          inventoryId: selectedItem.id,
          name: selectedItem.batch.product.name,
          generic: selectedItem.batch.product.genericName,
          batchNo: selectedItem.batch.batchNumber,
          quantity: quantity,
          unitType: finalUnitType,
          pricePerUnit: (total / quantity).toFixed(2),
          totalPrice: total
      };

      setPosCart([...posCart, newItem]);
      
      // Reset Selection
      setSelectedItem(null);
      setQuantity(1);
      setUnitType("STRIP");
      setSearchTerm(""); // Optional: Clear search
  };

  // 🗑️ REMOVE FROM BILL
  const removeFromBill = (id: number) => {
      setPosCart(posCart.filter(item => item.id !== id));
  };

  // 💰 CALCULATE GRAND TOTAL
  const grandTotal = posCart.reduce((sum, item) => sum + item.totalPrice, 0);

  // 🚀 HANDLE CHECKOUT (Submit All Items)
  async function handleCheckout() {
    if (posCart.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    // ✅ পুরো কার্ট ডাটা JSON হিসেবে পাঠাচ্ছি
    formData.append("cartData", JSON.stringify(posCart)); 
    formData.append("totalAmount", grandTotal.toFixed(2));

    try {
        const res = await processRetailSale(formData);
        if (res.success) {
          setSuccessData({
            total: grandTotal.toFixed(2),
            itemsCount: posCart.length,
            orderId: orderId
          });
          setPosCart([]); // Clear Cart
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
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Sale Completed!</h1>
            <p className="text-slate-500 font-medium">Order #{successData.orderId}</p>
            <p className="text-slate-400 text-sm">{successData.itemsCount} items sold successfully.</p>
        </div>
        <div className="bg-white border border-dashed border-slate-300 p-8 rounded-2xl w-full max-w-sm shadow-sm text-center">
             <span className="text-lg font-bold text-slate-800">Total Collected</span> 
             <div className="text-4xl font-black text-emerald-600 mt-2">₹{successData.total}</div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg">
            <Printer size={20} /> Print Receipt
          </button>
          <button onClick={() => setSuccessData(null)} className="px-8 py-3.5 rounded-xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            Next Customer
          </button>
        </div>
      </div>
    );
  }

  // ✅ MAIN POS INTERFACE
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-140px)]">
      
      {/* 📦 LEFT: SEARCH & PRODUCT LIST (Col-span 7) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="relative group">
                <Search className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition" size={20} />
                <input 
                    type="text" 
                    placeholder="Search medicine (e.g. Calpol)..." 
                    className="w-full pl-12 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-lg"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                    autoFocus
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInventory.length === 0 && (
                    <div className="col-span-2 text-center py-20 text-slate-400">
                        <Package size={48} className="mb-4 opacity-20 mx-auto"/>
                        <p>No medicines found.</p>
                    </div>
                )}
                {filteredInventory.map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => { setSelectedItem(item); setQuantity(1); setUnitType("STRIP"); }}
                        className={`text-left p-4 rounded-xl border transition relative overflow-hidden ${selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'bg-white hover:shadow-md'}`}
                    >
                        {selectedItem?.id === item.id && <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>}
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg truncate w-32">{item.batch.product.name}</h3>
                                <p className="text-xs font-medium text-slate-500">{item.batch.product.genericName}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">{item.batch.product.type}</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                                Stock: {item.currentStock}
                            </span>
                            {item.batch.product.tabletsPerStrip > 1 && (
                                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">
                                    Loose: {item.looseStock}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 🧾 RIGHT: CART & BILLING */}
      <div className="lg:col-span-5 h-full flex flex-col gap-4">
        
        {/* A. Item Config Panel (If Selected) */}
        {selectedItem && (
            <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-md animate-slide-in-up">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{selectedItem.batch.product.name}</h3>
                        <p className="text-xs text-slate-500">Batch: {selectedItem.batch.batchNumber}</p>
                    </div>
                    <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-red-50 text-red-500 rounded-full"><X size={20}/></button>
                </div>

                {/* Sell Type Logic */}
                {isMultiPack ? (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button onClick={() => setUnitType("STRIP")} className={`p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border ${unitType === 'STRIP' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}>
                            <Package size={16}/> {itemType === 'INJECTION' ? 'Full Box' : 'Strip'}
                        </button>
                        <button onClick={() => setUnitType("TABLET")} className={`p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border ${unitType === 'TABLET' ? 'bg-orange-500 text-white' : 'hover:bg-slate-50'}`}>
                            {itemType === 'INJECTION' ? <Syringe size={16}/> : <Tablets size={16}/>} 
                            {itemType === 'INJECTION' ? 'Loose Vial' : 'Loose Tab'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-100 p-2 rounded-lg text-center text-xs font-bold text-slate-500 mb-4">
                        Selling as Single Unit
                    </div>
                )}

                {/* Quantity & Add */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-xl overflow-hidden">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-slate-100"><Minus size={18}/></button>
                        <span className="px-4 font-bold text-lg">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-slate-100"><Plus size={18}/></button>
                    </div>
                    <button onClick={addToBill} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition flex justify-center items-center gap-2">
                        Add to Bill <span>₹{calculateCurrentItemTotal().toFixed(2)}</span>
                    </button>
                </div>
            </div>
        )}

        {/* B. Cart List */}
        <div className={`bg-white rounded-3xl border border-slate-200 shadow-xl flex-1 flex flex-col overflow-hidden ${selectedItem ? 'h-[calc(100%-240px)]' : 'h-full'}`}>
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><Receipt size={20}/> Current Bill</h2>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-mono">#{orderId}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {posCart.length === 0 ? (
                    <div className="text-center py-10 opacity-50 h-full flex flex-col items-center justify-center">
                        <ShoppingCart size={40} className="mx-auto mb-2 text-slate-300"/>
                        <p className="text-sm text-slate-500">Bill is empty</p>
                    </div>
                ) : (
                    posCart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                                <h4 className="font-bold text-slate-800">{item.name}</h4>
                                <div className="text-xs text-slate-500 font-bold flex gap-2">
                                    <span className={item.unitType === 'STRIP' ? 'text-blue-500' : 'text-orange-500'}>
                                        {item.quantity} {item.unitType === 'STRIP' ? 'Strips/Boxes' : (item.unitType === 'UNIT' ? 'Units' : 'Tabs/Vials')}
                                    </span>
                                    <span>x ₹{item.pricePerUnit}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-slate-700">₹{item.totalPrice.toFixed(2)}</span>
                                <button onClick={() => removeFromBill(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* C. Checkout Footer */}
            <div className="p-5 border-t bg-slate-50">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Total Payable</p>
                        <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">CASH</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">UPI</span>
                        </div>
                    </div>
                    <span className="text-3xl font-black text-slate-800">₹{grandTotal.toFixed(2)}</span>
                </div>
                <button 
                    onClick={handleCheckout} 
                    disabled={posCart.length === 0 || loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? "Processing..." : <>Confirm Sale <CheckCircle size={20}/></>}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}