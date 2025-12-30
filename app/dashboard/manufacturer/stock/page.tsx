"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { saveProductionBatch } from "./actions";

export default function StockManager() {
  const [loading, setLoading] = useState(false);
  const [productionData, setProductionData] = useState<any>(null);
  
  const [form, setForm] = useState({
    medicineName: "", 
    medicineId: "", 
    mfgDate: new Date().toISOString().split("T")[0],
    expDate: "", 
    cartonCount: 1, 
    boxesPerCarton: 1, 
    stripsPerBox: 1,
    pricePerStrip: 0
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = Date.now().toString().slice(-4);
    const medCode = form.medicineId.toUpperCase();
    const cartons = [];

    for (let c = 1; c <= form.cartonCount; c++) {
      const cartonId = `${medCode}-CRT-${timestamp}-${c}`;
      const boxes = [];
      for (let b = 1; b <= form.boxesPerCarton; b++) {
        const boxId = `${cartonId}-BX-${b}`;
        const strips = [];
        for (let s = 1; s <= form.stripsPerBox; s++) {
          strips.push({ id: `${boxId}-STP-${s}` });
        }
        boxes.push({ id: boxId, strips });
      }
      cartons.push({ id: cartonId, boxes });
    }
    setProductionData({ cartons });
  };

  const handleSync = async () => {
    setLoading(true);
    const res = await saveProductionBatch(form, productionData.cartons);
    
    if (res.success) {
      alert("✅ SUCCESS! সব ডাটাবেসে সেভ হয়েছে। ড্যাশবোর্ড চেক করুন।");
      setProductionData(null);
      // পেজ রিলোড দিলে ড্যাশবোর্ডের ডাটা ফ্রেশ হবে
      window.location.reload(); 
    } else {
      alert("❌ ERROR: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-3xl shadow-lg border">
        <h2 className="text-xl font-bold mb-6">Production Setup</h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input className="p-3 border rounded-xl" placeholder="Medicine Name" onChange={e => setForm({...form, medicineName: e.target.value})} required />
          <input className="p-3 border rounded-xl uppercase" placeholder="Unique ID (e.g. DEP-20)" onChange={e => setForm({...form, medicineId: e.target.value})} required />
          
          <input 
            type="number" 
            step="0.01" 
            className="p-3 border border-blue-200 bg-blue-50 rounded-xl" 
            placeholder="Price Per Strip" 
            onChange={e => setForm({...form, pricePerStrip: parseFloat(e.target.value)})} 
            required 
          />

          <input type="number" className="p-3 border rounded-xl" placeholder="Cartons" onChange={e => setForm({...form, cartonCount: parseInt(e.target.value)})} required />
          <input type="number" className="p-3 border rounded-xl" placeholder="Boxes/Carton" onChange={e => setForm({...form, boxesPerCarton: parseInt(e.target.value)})} required />
          <input type="number" className="p-3 border rounded-xl" placeholder="Strips/Box" onChange={e => setForm({...form, stripsPerBox: parseInt(e.target.value)})} required />
          
          <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl font-bold lg:col-span-2">
            Generate All QR
          </button>
        </form>
      </div>

      {productionData && (
        <div className="space-y-6">
          <button onClick={handleSync} disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-green-700 transition-all">
            {loading ? "Syncing..." : "🔥 CONFIRM & UPLOAD TO DATABASE"}
          </button>

          <div className="bg-white p-8 rounded-3xl border shadow-inner max-h-[500px] overflow-y-auto">
            <h3 className="font-bold mb-6 text-center text-2xl">QR Hierarchy Preview</h3>
            {productionData.cartons.map((c: any) => (
              <div key={c.id} className="mb-10 p-6 border-2 border-dashed border-gray-200 rounded-3xl">
                <div className="flex items-center gap-6 mb-6 border-b pb-4">
                  <QRCodeSVG value={c.id} size={80} />
                  <span className="font-mono font-black text-xl">CARTON: {c.id}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {c.boxes.map((b: any) => (
                    <div key={b.id} className="p-4 border rounded-2xl bg-gray-50/50">
                      <div className="flex items-center gap-4 mb-4">
                        <QRCodeSVG value={b.id} size={50} />
                        <span className="text-sm font-bold">BOX: {b.id}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {b.strips.map((s: any) => (
                          <div key={s.id} className="flex flex-col items-center p-2 border bg-white rounded-lg shadow-sm">
                            <QRCodeSVG value={s.id} size={40} />
                            <span className="text-[7px] font-mono mt-2 truncate w-full text-center">{s.id.split('-').pop()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}