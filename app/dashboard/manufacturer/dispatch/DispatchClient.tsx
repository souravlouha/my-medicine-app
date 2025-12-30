"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Props টাইপ ডিফাইন করা হলো
type Props = {
  distributors: any[];
  batches: any[];
  manufacturer: any; // ম্যানুফ্যাকচারার ডাটা রিসিভ করছি
};

export default function DispatchClient({ distributors, batches, manufacturer }: Props) {
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  // কার্টে অ্যাড করা
  const addToShipment = (batch: any) => {
    const exists = cart.find((c) => c.id === batch.id);
    if (exists) {
      alert("⚠️ This batch is already in the shipment list!");
      return;
    }
    // ডিফল্ট প্রাইস ১০ টাকা ধরছি (যদি ডাটাবেসে না থাকে)
    const unitPrice = batch.price || 15.50; 
    const initialQty = batch.currentStock < 10 ? batch.currentStock : 10;
    
    setCart([...cart, { ...batch, quantity: initialQty, unitPrice }]);
  };

  const removeFromCart = (batchId: string) => setCart(cart.filter((c) => c.id !== batchId));

  const updateQuantity = (batchId: string, newQty: number, maxStock: number) => {
    if (newQty > maxStock) return alert(`⚠️ Max stock available: ${maxStock}`);
    if (newQty < 1) return;
    setCart(cart.map(item => item.id === batchId ? { ...item, quantity: newQty } : item));
  };

  // 🔥 PDF জেনারেশন এবং প্রিভিউ ফাংশন
  const generatePDF = () => {
    if (!selectedDistributor || cart.length === 0) {
      alert("❌ Please select a distributor and add items!");
      return;
    }

    const dist = distributors.find((d) => d.id === selectedDistributor);
    const doc = new jsPDF();

    // 1. Header (Company Info)
    doc.setFontSize(22);
    doc.setTextColor(13, 27, 62); // Dark Blue
    doc.setFont("helvetica", "bold");
    doc.text(manufacturer?.name || "MEDTRACE PHARMA", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(manufacturer?.location || "Industrial Area, India", 14, 26);
    doc.text(`GSTIN: ${manufacturer?.gstNo || "N/A"}`, 14, 31);
    doc.text(`DL No: ${manufacturer?.licenseNo || "N/A"}`, 14, 36);

    // 2. Invoice Title & Date (Right Side)
    doc.setFontSize(16);
    doc.setTextColor(13, 27, 62);
    doc.text("TAX INVOICE", 140, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Invoice No: INV-${Date.now().toString().slice(-6)}`, 140, 28);
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 140, 33);

    // Line Divider
    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 45, 196, 45);

    // 3. Bill To (Distributor Info)
    doc.setFontSize(11);
    doc.setTextColor(13, 27, 62);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 14, 55);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(dist?.name || "Distributor Name", 14, 62);
    doc.text(dist?.location || "Location", 14, 67);
    doc.text(`GSTIN: ${dist?.gstNo || "N/A"}`, 14, 72);
    doc.text(`DL No: ${dist?.licenseNo || "N/A"}`, 14, 77);

    // 4. Product Table
    const tableRows = cart.map((item, index) => [
      index + 1,
      item.medicineName,
      item.id.substring(0, 10), // Batch ID
      new Date(item.expDate).toLocaleDateString("en-GB"),
      item.quantity,
      `INR ${item.unitPrice.toFixed(2)}`,
      `INR ${(item.quantity * item.unitPrice).toFixed(2)}`
    ]);

    // Calculate Total
    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    autoTable(doc, {
      startY: 85,
      head: [['#', 'Medicine Name', 'Batch No', 'Expiry', 'Qty', 'Rate', 'Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [13, 27, 62], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        6: { halign: 'right', fontStyle: 'bold' } // Total column right aligned
      }
    });

    // 5. Footer (Total Amount & Sign)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: INR ${totalAmount.toFixed(2)}`, 140, finalY + 10);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", 140, finalY + 30);
    doc.text("_______________________", 140, finalY + 40);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a computer generated invoice.", 14, 280);

    // 🔥 Preview PDF in New Tab
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT SIDE: SELECTION --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Distributor List */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-gray-600 text-[10px]">1</span> Select Distributor
             </h3>
             {distributors.length === 0 ? <p className="text-red-400 font-bold">No Distributors Found</p> : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {distributors.map((dist) => (
                   <div key={dist.id} onClick={() => setSelectedDistributor(dist.id)}
                     className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedDistributor === dist.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}>
                      <h4 className="font-bold text-[#0D1B3E]">{dist.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Lic: {dist.licenseNo || "N/A"}</p>
                      <p className="text-[10px] text-gray-400 mt-1">📍 {dist.location || "N/A"}</p>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Batch List */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-gray-600 text-[10px]">2</span> Add Items
             </h3>
             <div className="overflow-x-auto max-h-96 overflow-y-auto scrollbar-thin">
               <table className="w-full text-left">
                 <thead className="sticky top-0 bg-white z-10">
                   <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                     <th className="pb-3 pl-2">Batch ID</th><th className="pb-3">Product</th><th className="pb-3">Stock</th><th className="pb-3 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {batches.map((batch) => (
                     <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                       <td className="py-4 pl-2 font-mono text-xs font-bold text-gray-600">{batch.id.substring(0, 10)}...</td>
                       <td className="py-4 text-sm font-bold text-[#0D1B3E]">{batch.medicineName}</td>
                       <td className="py-4 text-xs font-bold text-green-600">{batch.currentStock} Units</td>
                       <td className="py-4 text-right">
                         <button onClick={() => addToShipment(batch)} disabled={batch.currentStock <= 0} className="bg-[#0D1B3E] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 disabled:bg-gray-300">+ Add</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: INVOICE PREVIEW --- */}
        <div className="lg:col-span-1">
           <div className="bg-[#0D1B3E] p-8 rounded-[2.5rem] text-white sticky top-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-6 relative z-10">Invoice Preview</h3>
              
              <div className="mb-6 p-4 bg-white/10 rounded-2xl border border-white/5 relative z-10">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
                 {selectedDistributor ? (
                   <div><p className="font-bold text-white">{distributors.find(d => d.id === selectedDistributor)?.name}</p></div>
                 ) : <p className="text-xs text-gray-500 italic">No distributor selected</p>}
              </div>

              <div className="space-y-3 mb-8 relative z-10 max-h-60 overflow-y-auto scrollbar-thin">
                 {cart.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex-1"><p className="text-xs font-bold text-white">{item.medicineName}</p></div>
                      <div className="flex items-center gap-3">
                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.currentStock)} className="w-12 bg-transparent text-right text-white font-bold border-b border-gray-600 outline-none text-sm" />
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400">✕</button>
                      </div>
                   </div>
                 ))}
              </div>

              {/* 🔥 PREVIEW PDF BUTTON */}
              <button onClick={generatePDF} className="w-full bg-white text-[#0D1B3E] py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10">
                <span>📄 Preview Invoice PDF</span>
              </button>
           </div>
        </div>
    </div>
  );
}