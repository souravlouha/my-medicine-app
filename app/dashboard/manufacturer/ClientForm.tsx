"use client";

import { useState } from "react";
import { createBatchAction } from "./actions";
import QRCode from "react-qr-code";

export default function ClientForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [isCustom, setIsCustom] = useState(false);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const result = await createBatchAction(formData);
    
    setLoading(false);
    setMessage(result.message);

    if (result.success && result.data) {
      setQrCodes(result.data);
    }
  }

  const parseType = (uid: string) => {
    if (uid.startsWith("CTN")) return "CARTON";
    if (uid.startsWith("BOX")) return "BOX";
    return "STRIP";
  };

  const getHierarchy = () => {
    const cartons = qrCodes.filter((u) => parseType(u.uid) === "CARTON");
    const boxes = qrCodes.filter((u) => parseType(u.uid) === "BOX");
    const strips = qrCodes.filter((u) => parseType(u.uid) === "STRIP");

    return cartons.map((carton) => ({
      ...carton,
      boxes: boxes.filter((b) => b.uid.includes(carton.uid.split('-').slice(2).join('-'))).map((box) => ({
        ...box,
        strips: strips.filter((s) => s.uid.includes(box.uid.split('-').slice(2).join('-')))
      }))
    }));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 no-print">
        <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">✨ Create New Batch</h2>
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Medicine Name</label>
                <input name="medicineName" type="text" required className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" defaultValue="Paracetamol 500mg"/>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Batch ID</label>
                <input name="batchId" type="text" placeholder="B-2025-01" required className="w-full border p-3 rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Total Strips</label>
                <input name="quantity" type="number" required className="w-full border p-3 rounded-lg" defaultValue={100} />
            </div>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
             <div className="flex items-center justify-between mb-4">
               <label className="text-sm font-bold text-blue-800">📦 Packaging Setup</label>
               <input type="checkbox" checked={isCustom} onChange={(e) => setIsCustom(e.target.checked)} /> 
             </div>
             <div className="grid grid-cols-2 gap-6">
                <input name="stripsPerBox" type="number" className="border p-3 rounded-xl font-bold" defaultValue={20} readOnly={!isCustom} />
                <input name="boxesPerCarton" type="number" className="border p-3 rounded-xl font-bold" defaultValue={10} readOnly={!isCustom} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
             <input name="mfgDate" type="date" required className="border p-3 rounded-lg" />
             <input name="expDate" type="date" required className="border p-3 rounded-lg" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
            {loading ? "Processing..." : "🚀 Generate Batch & QR Codes"}
          </button>
          {message && <div className="p-4 rounded-xl text-center text-sm font-bold bg-blue-50 text-blue-700">{message}</div>}
        </form>
      </div>

      {qrCodes.length > 0 && (
        <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between border-b pb-4 no-print">
            <h3 className="text-2xl font-black text-blue-900">📦 QR Hierarchy</h3>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">🖨️ Print Labels</button>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {qrCodes.map((unit) => (
              <div key={unit.uid} className="inline-block p-4 border rounded-xl bg-white text-center m-2 shadow-sm break-inside-avoid">
                <QRCode value={unit.uid} size={80} />
                <p className="text-[10px] font-mono mt-2 font-bold">{unit.uid}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}