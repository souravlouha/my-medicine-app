"use client";

import { createAdvancedBatchAction } from "@/lib/actions/manufacturer-actions";
import { useState, useMemo } from "react"; 
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import Link from "next/link";

export default function CreateBatchForm({ products }: { products: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // 1. Form States
  const [selectedProductId, setSelectedProductId] = useState("");
  const [mrp, setMrp] = useState<number | string>(""); 
  
  // 2. Hierarchy States
  const [totalCartons, setTotalCartons] = useState(2);
  const [boxesPerCarton, setBoxesPerCarton] = useState(4);
  const [stripsPerBox, setStripsPerBox] = useState(10);

  // 3. Success State
  const [createdBatch, setCreatedBatch] = useState<{id: string, no: string} | null>(null);

  // 🧮 Real-time Calculation
  const totalStrips = useMemo(() => {
    return totalCartons * boxesPerCarton * stripsPerBox;
  }, [totalCartons, boxesPerCarton, stripsPerBox]);

  // Handle Product Change
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedProductId(pId);
    const product = products.find(p => p.id === pId);
    
    if (product) setMrp(product.basePrice || "");
    else setMrp("");
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    formData.append("totalCartons", totalCartons.toString());
    formData.append("boxesPerCarton", boxesPerCarton.toString());
    formData.append("stripsPerBox", stripsPerBox.toString());

    const res = await createAdvancedBatchAction(formData);

    if (res.success) {
      // ✅ FIX: এখানে (res as any) ব্যবহার করা হয়েছে যাতে লাল দাগ না দেখায়
      setCreatedBatch({ 
          id: (res as any).batchId || "", 
          no: (res as any).batchNo || "" 
      });
      router.refresh();
    } else {
      alert("❌ " + res.error);
    }
    setLoading(false);
  }

  // ✅ FULL HIERARCHY PREVIEW + PRINT VIEW
  if (createdBatch) {
    const selectedProduct = products.find((p) => p.id === selectedProductId);

    return (
      <div className="space-y-8 animate-fade-in">

        {/* ── Screen-only: Success header ─────────────────────────────── */}
        <div className="print:hidden p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-green-800">✅ Production Successful!</h2>
          <p className="mt-2 text-gray-600">
            Batch <span className="font-mono font-bold bg-white px-2 py-1 rounded border">{createdBatch.no}</span> has been generated.
          </p>
          <p className="text-sm font-bold text-green-600 mt-1">
            Total Output: {totalStrips} Strips | {totalCartons} Cartons
          </p>
        </div>

        {/* ── Screen-only: Action bar ─────────────────────────────────── */}
        <div className="print:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700">QR Hierarchy Preview</h3>
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black flex items-center gap-2 shadow-lg transition"
            >
              🖨️ Print Labels
            </button>
            <button
              onClick={() => { setCreatedBatch(null); router.push("/dashboard/manufacturer"); }}
              className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition border border-gray-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* ── Print-only: page title ─────────────────────────────────── */}
        <div className="hidden print:block text-center mb-4 border-b pb-4">
          <h1 className="text-lg font-black uppercase tracking-widest text-gray-900">
            QR Label Sheet
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Batch: {createdBatch.no} · Generated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* ── Hierarchy view (shown on screen + in print) ─────────────── */}
        <div className="space-y-8">
          {Array.from({ length: totalCartons }).map((_, cIndex) => {
            const cartonId = `CARTON-${createdBatch.no}-${cIndex + 1}`;

            return (
              <div
                key={cIndex}
                className="border-4 border-gray-800 rounded-3xl p-8 bg-white break-inside-avoid print:rounded-none print:border-2 print:p-4"
              >
                {/* Carton header */}
                <div className="flex items-center gap-6 border-b-2 border-gray-200 pb-6 mb-6 break-inside-avoid">
                  <div className="bg-white p-2 border border-gray-200 rounded-lg flex-shrink-0">
                    <QRCode value={`${baseUrl}/verify/${cartonId}`} size={100} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase text-gray-900">CARTON {cIndex + 1}</h3>
                    <p className="font-mono text-xs text-gray-600 mt-1 font-bold">{cartonId}</p>
                    {selectedProduct && (
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedProduct.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Contains {boxesPerCarton} Boxes × {stripsPerBox} Strips</p>
                  </div>
                </div>

                {/* Boxes grid — 2 col on screen, up to 2 col in print */}
                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
                  {Array.from({ length: boxesPerCarton }).map((_, bIndex) => {
                    const boxId = `BOX-${createdBatch.no}-${cIndex + 1}-${bIndex + 1}`;

                    return (
                      <div
                        key={bIndex}
                        className="border-2 border-gray-300 rounded-2xl p-5 bg-gray-50 break-inside-avoid print:rounded-none print:p-3"
                      >
                        {/* Box header */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-white p-1.5 border border-gray-200 rounded flex-shrink-0">
                            <QRCode value={`${baseUrl}/verify/${boxId}`} size={60} />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase text-gray-700">
                              BOX {bIndex + 1}
                            </p>
                            <p className="text-[10px] text-gray-500 font-bold font-mono break-all">{boxId}</p>
                            <p className="text-[10px] text-gray-400">Contains {stripsPerBox} Strips</p>
                          </div>
                        </div>

                        {/* Strip grid: 4 col for print labels */}
                        <div className="grid grid-cols-5 print:grid-cols-4 gap-2 print:gap-1">
                          {Array.from({ length: stripsPerBox }).map((_, sIndex) => {
                            const stripId = `STRIP-${createdBatch.no}-${cIndex + 1}-${bIndex + 1}-${sIndex + 1}`;

                            return (
                              <div
                                key={sIndex}
                                className="flex flex-col items-center bg-white p-2 print:p-1 rounded border border-gray-200 shadow-sm break-inside-avoid hover:border-blue-400 transition"
                              >
                                <QRCode value={`${baseUrl}/verify/${stripId}`} size={40} />
                                {/* Labels under QR — visible on print */}
                                <div className="w-full text-center mt-1 space-y-0">
                                  <p className="text-[7px] font-mono font-bold text-gray-500 leading-tight break-all">
                                    S{sIndex + 1}
                                  </p>
                                  <p className="text-[6px] font-mono text-gray-400 leading-tight break-all print:block hidden">
                                    {createdBatch.no}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Print-only: footer ─────────────────────────────────────── */}
        <div className="hidden print:block text-center mt-6 pt-4 border-t text-xs text-gray-400">
          Generated by MedTrace · {selectedProduct?.name ?? ""} · {createdBatch.no}
        </div>

      </div>
    );
  }

  // ✅ PRODUCTION FORM
  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      
      {/* 1. Product & Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Product</label>
            <div className="flex gap-2">
                <select 
                  name="productId" 
                  required 
                  value={selectedProductId}
                  onChange={handleProductChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.strength}) - [Code: {p.productCode}]
                        </option>
                    ))}
                </select>
                <Link href="/dashboard/manufacturer/catalog" className="bg-blue-50 text-blue-600 px-5 flex items-center rounded-xl font-bold hover:bg-blue-100 whitespace-nowrap border border-blue-200">
                   + Add New
                </Link>
            </div>
         </div>
         
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Set MRP (Consumer Price)</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500 font-bold">₹</span>
              <input 
                name="mrp" 
                type="number" 
                step="0.01" 
                required 
                value={mrp} 
                onChange={(e) => setMrp(e.target.value)}
                placeholder="100.00" 
                className="w-full pl-8 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 font-bold text-gray-800" 
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">This price will be printed on QR.</p>
         </div>
      </div>

      {/* 2. Hierarchy Configuration */}
      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 shadow-sm">
         <div className="flex items-center gap-2 mb-4">
            <span className="bg-orange-100 p-2 rounded-lg text-xl">📦</span>
            <h3 className="text-lg font-bold text-orange-900">Packaging Configuration</h3>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">1. Total Cartons</label>
               <input 
                 type="number" 
                 min="1"
                 value={totalCartons}
                 onChange={(e) => setTotalCartons(parseInt(e.target.value) || 0)}
                 className="w-full p-3 border border-orange-200 rounded-xl focus:outline-orange-500 font-bold text-xl text-center" 
               />
            </div>
            <div className="flex flex-col justify-center items-center">
               <span className="text-gray-400 font-bold text-xs mb-1">CONTAINS</span>
               <span className="text-2xl text-gray-300">×</span>
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">2. Boxes per Carton</label>
               <input 
                 type="number" 
                 min="1"
                 value={boxesPerCarton}
                 onChange={(e) => setBoxesPerCarton(parseInt(e.target.value) || 0)}
                 className="w-full p-3 border border-orange-200 rounded-xl focus:outline-orange-500 font-bold text-xl text-center" 
               />
            </div>
         </div>

         <div className="mt-6 pt-6 border-t border-orange-200/50 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">3. Strips per Box</label>
               <input 
                 type="number" 
                 min="1"
                 value={stripsPerBox}
                 onChange={(e) => setStripsPerBox(parseInt(e.target.value) || 0)}
                 className="w-full p-3 border border-orange-200 rounded-xl focus:outline-orange-500 font-bold text-xl text-center" 
               />
            </div>
            <div className="md:col-span-2 bg-white p-4 rounded-xl border border-orange-200 flex justify-between items-center">
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Production Output</p>
                  <p className="text-xs text-gray-400">(Cartons × Boxes × Strips)</p>
               </div>
               <div className="text-right">
                  <span className="text-3xl font-black text-blue-600">{totalStrips.toLocaleString()}</span>
                  <span className="text-sm font-bold text-blue-400 ml-1">Strips</span>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Dates */}
      <div className="grid grid-cols-2 gap-6">
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Manufacturing Date</label>
            <input name="mfgDate" type="date" required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
         </div>
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
            <input name="expDate" type="date" required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
         </div>
      </div>

      <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-5 rounded-xl shadow-xl hover:bg-blue-700 disabled:opacity-50 transition transform active:scale-95 text-lg">
        {loading ? "⚙️ Initializing Production Line..." : "🚀 Confirm & Generate All QRs"}
      </button>

    </form>
  );
}