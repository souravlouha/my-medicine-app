"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createBulkShipmentAction } from "@/lib/actions/manufacturer-actions";
import { useRouter } from "next/navigation";

type Props = {
  distributors: any[];
  batches: any[];
  manufacturer: any;
};

export default function DispatchClient({ distributors, batches, manufacturer }: Props) {
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- CART LOGIC ---
  const addToShipment = (batch: any) => {
    const exists = cart.find((c) => c.id === batch.id);
    if (exists) return alert("⚠️ Already added!");
    
    // Price Logic: যদি ডাটাবেসে না থাকে, ডিফল্ট একটা প্রাইস বসাচ্ছি (পরে ক্যাটালগ থেকে আসবে)
    const unitPrice = batch.price || 500.00; 
    setCart([...cart, { ...batch, quantity: 10, unitPrice }]); // Default Qty 10
  };

  const removeFromCart = (id: string) => setCart(cart.filter((c) => c.id !== id));

  const updateQuantity = (id: string, qty: number, max: number) => {
    if (qty > max) return alert(`Max stock: ${max}`);
    setCart(cart.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  // --- 💾 CONFIRM SHIPMENT (DATABASE SAVE) ---
  const handleConfirm = async () => {
    if (!selectedDistributor || cart.length === 0) return alert("Select distributor and items!");
    if (!confirm("Are you sure you want to dispatch this shipment? Stock will be deducted.")) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("distributorId", selectedDistributor);
    formData.append("cartData", JSON.stringify(cart));

    const res = await createBulkShipmentAction(formData);

    if (res.success) {
      alert(res.message);
      // পিডিএফ অটো ডাউনলোড করতে চাইলে এখানে generatePDF() কল করতে পারেন
      router.push("/dashboard/manufacturer"); // ড্যাশবোর্ডে ফেরত
      router.refresh();
    } else {
      alert("❌ " + res.error);
    }
    setLoading(false);
  };

  // --- 📄 PROFESSIONAL INVOICE GENERATOR (SAMPLE COPY) ---
  const generatePDF = () => {
    if (!selectedDistributor || cart.length === 0) return alert("Data missing!");

    const dist = distributors.find((d) => d.id === selectedDistributor);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER (LEFT)
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(manufacturer?.name || "BOSE PHARMA", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(manufacturer?.location || "Industrial Estate, India", 14, 26);
    doc.text(`GSTIN: ${manufacturer?.gstNo || "24AAACC1206D1ZM"} | DL: ${manufacturer?.licenseNo || "DL-M-5678"}`, 14, 31);
    doc.text(`Email: ${manufacturer?.email || "support@medtrace.com"}`, 14, 36);

    // 2. INVOICE INFO (RIGHT)
    doc.setTextColor(0);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`NO: INV-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - 14, 28, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - 14, 33, { align: "right" });
    doc.text(`Status: Unpaid`, pageWidth - 14, 38, { align: "right" });

    // Divider
    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 45, pageWidth - 14, 45);

    // 3. BILLED TO
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO:", 14, 55);
    
    doc.setFont("helvetica", "normal");
    doc.text(dist?.name || "Client Name", 14, 60);
    doc.text(dist?.location || "South Kolkata, Jadavpur", 14, 65);
    doc.text(`GSTIN: ${dist?.gstNo || "N/A"}`, 14, 70);

    // 4. TABLE DATA PREPARATION
    let subTotal = 0;
    const tableRows = cart.map((item, index) => {
      const total = item.quantity * item.unitPrice;
      const taxAmt = total * 0.18; // 18% Tax Calculation
      const finalTotal = total + taxAmt;
      subTotal += total;

      return [
        index + 1,
        `${item.medicineName}\n(Batch: ${item.id.substring(0, 8)})`, // Medicine + Batch
        item.id.substring(0, 6).toUpperCase(),
        item.quantity,
        `INR\n${item.unitPrice.toFixed(2)}`,
        "18%", // Fixed Tax Rate
        `INR\n${taxAmt.toFixed(2)}`,
        `INR\n${finalTotal.toFixed(2)}`
      ];
    });

    const taxTotal = subTotal * 0.18;
    const grandTotal = subTotal + taxTotal;

    // 5. DRAW TABLE
    autoTable(doc, {
      startY: 80,
      head: [['#', 'Medicine', 'Batch', 'Qty', 'Price', 'Tax %', 'Tax Amt', 'Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold', lineColor: 200, lineWidth: 0.1 },
      styles: { fontSize: 9, cellPadding: 3, valign: 'middle', lineColor: 200, lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        7: { halign: 'right', fontStyle: 'bold' }, // Total Column Bold
        4: { halign: 'right' },
        6: { halign: 'right' }
      }
    });

    // 6. FOOTER SECTION
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Bank Details (Left Side)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bank Details:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Bank: HDFC Bank", 14, finalY + 6);
    doc.text("A/C No: XXXXXXXXXX5678", 14, finalY + 11);
    doc.text("IFSC: HDFC0001234", 14, finalY + 16);

    // Totals (Right Side)
    doc.setFontSize(10);
    doc.text("Sub Total:", 130, finalY, { align: "right" });
    doc.text(`INR ${subTotal.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

    doc.text("Tax (18%):", 130, finalY + 6, { align: "right" });
    doc.text(`INR ${taxTotal.toFixed(2)}`, pageWidth - 14, finalY + 6, { align: "right" });

    // Divider Line for Total
    doc.setDrawColor(200);
    doc.line(100, finalY + 10, pageWidth - 14, finalY + 10);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 130, finalY + 18, { align: "right" });
    doc.text(`INR ${grandTotal.toFixed(2)}`, pageWidth - 14, finalY + 18, { align: "right" });

    // Terms & Conditions (Bottom Left)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", 14, finalY + 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("1. Goods once sold will not be taken back.", 14, finalY + 41);
    doc.text("2. Interest @18% p.a. will be charged if not paid within due date.", 14, finalY + 46);

    // Signature (Bottom Right)
    doc.setFontSize(9);
    doc.text(`For ${manufacturer?.name || "Bose Pharma"}`, pageWidth - 14, finalY + 60, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signatory", pageWidth - 14, finalY + 80, { align: "right" });

    // Open PDF
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* LEFT: SELECTION */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* 1. Select Distributor */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">1. Select Distributor</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {distributors.map((dist) => (
               <div key={dist.id} onClick={() => setSelectedDistributor(dist.id)}
                 className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedDistributor === dist.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}>
                  <h4 className="font-bold text-[#0D1B3E]">{dist.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Lic: {dist.licenseNo || "N/A"}</p>
               </div>
             ))}
           </div>
        </div>

        {/* 2. Add Items */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">2. Add Items</h3>
           <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin">
             <table className="w-full text-left">
               <thead className="sticky top-0 bg-white z-10 border-b">
                 <tr className="text-[10px] font-black text-gray-400 uppercase">
                    <th className="pb-3">Batch ID</th><th className="pb-3">Product</th><th className="pb-3 text-green-600">Stock</th><th className="pb-3 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {batches.map((batch) => (
                   <tr key={batch.id} className="hover:bg-gray-50">
                     <td className="py-4 text-xs font-mono font-bold text-gray-500">{batch.id.substring(0, 8)}...</td>
                     <td className="py-4 font-bold text-[#0D1B3E]">{batch.medicineName}</td>
                     <td className="py-4 text-xs font-bold text-green-600">{batch.currentStock} Units</td>
                     <td className="py-4 text-right">
                       <button onClick={() => addToShipment(batch)} className="bg-[#0D1B3E] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-black">
                         + Add
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>

      {/* RIGHT: INVOICE PREVIEW & ACTIONS */}
      <div className="lg:col-span-1">
         <div className="bg-[#0D1B3E] p-8 rounded-[2.5rem] text-white sticky top-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h3 className="text-lg font-black uppercase tracking-tighter mb-6 relative z-10">Invoice Summary</h3>
            
            {/* Cart Items List */}
            <div className="space-y-3 mb-8 relative z-10 max-h-60 overflow-y-auto scrollbar-thin">
               {cart.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Cart is empty</p>}
               {cart.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex-1">
                       <p className="text-xs font-bold text-white">{item.medicineName}</p>
                       <p className="text-[10px] text-gray-400">Rate: ₹{item.unitPrice}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.currentStock)} className="w-10 bg-transparent text-right text-white font-bold border-b border-gray-600 outline-none text-sm" />
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">✕</button>
                    </div>
                 </div>
               ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 relative z-10">
               {/* 1. Preview PDF */}
               <button onClick={generatePDF} className="w-full bg-white text-[#0D1B3E] py-4 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-gray-100 transition flex justify-center items-center gap-2">
                  <span>📄 Preview Invoice</span>
               </button>

               {/* 2. Confirm Shipment (Main Action) */}
               <button 
                 onClick={handleConfirm} 
                 disabled={loading || cart.length === 0}
                 className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
               >
                  {loading ? "Processing..." : "🚀 Confirm & Dispatch"}
               </button>
            </div>

            <p className="text-[10px] text-gray-500 text-center mt-4">
               *Clicking confirm will update stock in database.
            </p>
         </div>
      </div>

    </div>
  );
}