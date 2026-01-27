"use client";

import { useState } from "react";
import { Plus, Trash2, Calculator, Save, User, Package, Calendar, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { createShipmentAction } from "@/lib/actions/shipment-actions"; 
import { generateInvoicePDF } from "@/utils/generateInvoice"; 

interface Props {
  inventory: any[];
  retailers: any[];
  invoiceNo: string;
}

export default function CreateShipmentForm({ inventory, retailers, invoiceNo }: Props) {
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // ফর্ম ইনপুট স্টেটস
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [qty, setQty] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  const selectedBatch = inventory.find(i => i.batchId === selectedBatchId);

  // ১. কার্টে প্রোডাক্ট অ্যাড করা
  const addToCart = () => {
    if (!selectedBatch || qty <= 0 || price <= 0) return alert("Please fill valid details");
    if (qty > selectedBatch.currentStock) return alert("Insufficient Stock!");

    const existingItem = cart.find(item => item.batchId === selectedBatchId);
    if (existingItem) return alert("This item is already in the cart.");

    const newItem = {
      batchId: selectedBatchId,
      productName: selectedBatch.batch.product.name,
      batchNo: selectedBatch.batch.batchNumber,
      expiry: new Date(selectedBatch.batch.expDate).toLocaleDateString(),
      quantity: qty,
      unitPrice: price,
      total: qty * price,
      gst: (qty * price) * 0.18 
    };

    setCart([...cart, newItem]);
    setSelectedBatchId("");
    setQty(0);
    setPrice(0);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const subTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const totalTax = cart.reduce((acc, item) => acc + item.gst, 0);
  const grandTotal = subTotal + totalTax;

  // ✅ ২. ইনভয়েস প্রিভিউ ফাংশন (NEW TAB OPEN)
  const handlePreview = () => {
    if (!selectedRetailer || cart.length === 0) return alert("Select retailer & add items first!");
    
    const retailerName = retailers.find(r => r.id === selectedRetailer)?.name || "Retailer";
    
    // শেষ প্যারামিটার 'true' দেওয়ার ফলে এটি নতুন ট্যাবে ওপেন হবে
    generateInvoicePDF(invoiceNo, retailerName, cart, grandTotal, true);
  };

  // ✅ ৩. ফাইনাল সাবমিট ফাংশন (DOWNLOAD & SAVE)
  const handleSubmit = async () => {
    if (!selectedRetailer || cart.length === 0) return alert("Please select retailer and add items.");
    
    setLoading(true);

    const payload = {
        retailerId: selectedRetailer,
        items: cart,
        totalAmount: grandTotal,
        invoiceNo: invoiceNo,
        date: dispatchDate
    };

    try {
        const result = await createShipmentAction(payload);

        if (result.success) {
            const retailerName = retailers.find(r => r.id === selectedRetailer)?.name || "Retailer";
            
            // শেষ প্যারামিটার 'false' দেওয়ার ফলে এটি ডাউনলোড হবে
            generateInvoicePDF(invoiceNo, retailerName, cart, grandTotal, false);

            alert("✅ Shipment Confirmed Successfully!");
            router.push("/dashboard/distributor");
        } else {
            alert("❌ Error: " + result.error);
        }
    } catch (error) {
        console.error("Submission Error:", error);
        alert("Something went wrong!");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      
      {/* বাম পাশ: ইনপুট এরিয়া */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Retailer & Date */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Retailer</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18}/>
                    <select 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium text-slate-700"
                        onChange={(e) => setSelectedRetailer(e.target.value)}
                        value={selectedRetailer}
                    >
                        <option value="">-- Choose Retailer --</option>
                        {retailers.map(r => <option key={r.id} value={r.id}>{r.name} - {r.address}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dispatch Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-400" size={18}/>
                    <input 
                        type="date" 
                        value={dispatchDate}
                        onChange={(e) => setDispatchDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium text-slate-700" 
                    />
                </div>
            </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Package className="text-blue-600" size={20}/> Add Products
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                    <label className="text-xs font-bold text-slate-500">Product</label>
                    <select 
                        className="w-full p-3 mt-1 rounded-xl border border-slate-200 outline-none text-sm font-medium"
                        value={selectedBatchId}
                        onChange={(e) => {
                            setSelectedBatchId(e.target.value);
                            const b = inventory.find(i => i.batchId === e.target.value);
                            if(b) setPrice(b.batch.mrp);
                        }}
                    >
                        <option value="">Select Medicine</option>
                        {inventory.map(i => (
                            <option key={i.batchId} value={i.batchId}>
                                {i.batch.product.name} ({i.batch.batchNumber})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Qty</label>
                    <input 
                        type="number" 
                        className="w-full p-3 mt-1 rounded-xl border border-slate-200 outline-none text-sm font-bold text-center"
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        min={1}
                    />
                </div>

                <div className="md:col-span-3">
                    <label className="text-xs font-bold text-slate-500">Price (₹)</label>
                    <input 
                        type="number" 
                        className="w-full p-3 mt-1 rounded-xl border border-slate-200 outline-none text-sm font-bold"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />
                </div>

                <div className="md:col-span-2">
                    <button 
                        onClick={addToCart}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex justify-center items-center gap-1 transition"
                    >
                        <Plus size={18}/> Add
                    </button>
                </div>
            </div>
            
            {selectedBatch && (
                <div className="mt-2 flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-500">Expiry: <b>{new Date(selectedBatch.batch.expDate).toLocaleDateString()}</b></span>
                    <span className={qty > selectedBatch.currentStock ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                        Stock Available: {selectedBatch.currentStock}
                    </span>
                </div>
            )}
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                    <tr>
                        <th className="p-4 font-bold">Product</th>
                        <th className="p-4 font-bold text-center">Qty</th>
                        <th className="p-4 font-bold text-right">Price</th>
                        <th className="p-4 font-bold text-right">Total</th>
                        <th className="p-4 font-bold text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {cart.length === 0 && (
                        <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">Cart is empty.</td></tr>
                    )}
                    {cart.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                            <td className="p-4">
                                <p className="font-bold text-slate-800">{item.productName}</p>
                                <p className="text-xs text-slate-400 font-mono">{item.batchNo}</p>
                            </td>
                            <td className="p-4 text-center font-bold text-slate-700">{item.quantity}</td>
                            <td className="p-4 text-right text-slate-600">₹{item.unitPrice}</td>
                            <td className="p-4 text-right font-bold text-slate-800">₹{item.total}</td>
                            <td className="p-4 text-center">
                                <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition">
                                    <Trash2 size={16}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* ডান পাশ: বিলিং এবং বাটন */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 sticky top-6">
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calculator className="text-blue-600" size={20}/> Summary
                </h3>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Invoice No</p>
                    <p className="text-sm font-mono font-bold text-blue-600">{invoiceNo}</p>
                </div>
            </div>

            <div className="space-y-3 border-b border-dashed border-slate-200 pb-6 mb-6">
                <div className="flex justify-between text-slate-500 text-sm">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                    <span>GST (18%)</span>
                    <span className="font-bold text-slate-800">₹{totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 text-sm font-medium">
                    <span>Discount</span>
                    <span>- ₹0.00</span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-slate-800">Total Payable</span>
                <span className="text-3xl font-black text-slate-900">₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="space-y-3">
                {/* ✅ Preview Invoice Button */}
                <button 
                    onClick={handlePreview}
                    disabled={cart.length === 0}
                    className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-bold transition flex justify-center items-center gap-2"
                >
                    <Eye size={18}/> Preview Invoice
                </button>

                {/* ✅ Confirm Button */}
                <button 
                    onClick={handleSubmit}
                    disabled={cart.length === 0 || loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                    {loading ? "Processing..." : "Confirm & Dispatch"}
                </button>
            </div>
        </div>
      </div>

    </div>
  );
}