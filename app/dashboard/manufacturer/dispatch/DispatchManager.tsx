"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createShipmentAction } from "./actions";

// --- Icons (Same as before) ---
const Icons = {
  Wallet: () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Truck: () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h12a1 1 0 001-1v-2.5M6 7H4v10h2V7z" /></svg>,
  Box: () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  User: () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Print: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  Add: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
};

type Props = {
  distributors: any[];
  batches: any[];
  manufacturer: any;
  shipments: any[];
};

export default function DispatchManager({ distributors, batches, manufacturer, shipments }: Props) {
  const [view, setView] = useState<'dashboard' | 'create'>('dashboard');
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // --- LOGIC ---
  const safeShipments = shipments || [];
  const totalRevenue = safeShipments.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalDispatched = safeShipments.length;
  const activeBatches = batches.length;
  const activeDistributors = distributors.length;

  // Chart Logic (Unchanged)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString();
    
    const dailyTotal = safeShipments
        .filter(s => new Date(s.createdAt).toLocaleDateString() === dateStr)
        .reduce((sum, s) => sum + s.totalAmount, 0);

    return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dailyTotal
    };
  });

  const maxChartValue = Math.max(...chartData.map(d => d.amount), 5000);

  const topProducts = batches
    .map(b => ({ 
      name: b.medicineName, 
      sold: b.totalStrips - b.currentStock, 
      percent: b.totalStrips > 0 ? ((b.totalStrips - b.currentStock) / b.totalStrips) * 100 : 0
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3);

  const addToShipment = (batch: any) => {
    const exists = cart.find((c) => c.id === batch.id);
    if (exists) return alert("Already added.");
    setCart([...cart, { ...batch, quantity: 10, unitPrice: batch.pricePerStrip || 50 }]);
  };

  const removeFromCart = (id: string) => setCart(cart.filter((c) => c.id !== id));

  const updateQuantity = (id: string, qty: number, max: number) => {
    if (qty > max) return alert("Max stock reached");
    setCart(cart.map(c => c.id === id ? { ...c, quantity: qty } : c));
  };

  const handleDispatch = async () => {
    if (!selectedDistributor || cart.length === 0) return alert("Select distributor & items.");
    if (!confirm("Confirm Dispatch?")) return;

    setLoading(true);
    if (!manufacturer?.id) { alert("Session Error. Reload."); setLoading(false); return; }

    const result = await createShipmentAction({
      manufacturerId: manufacturer.id,
      distributorId: selectedDistributor,
      items: cart
    });
    setLoading(false);

    if (result.success) {
      alert(result.message);
      setCart([]);
      setSelectedDistributor(null);
      setView('dashboard');
    } else {
      alert("Error: " + result.error);
    }
  };

  // 🔥 UPDATED PROFESSIONAL INVOICE GENERATOR (Matches your requirement) 🔥
  const generatePDF = () => {
    if (!selectedDistributor || cart.length === 0) return alert("No items selected!");
    const dist = distributors.find((d) => d.id === selectedDistributor);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(33, 33, 33); // Dark Grey
    doc.text(manufacturer?.name || "MEDTRACE PHARMA", margin, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(manufacturer?.location || "Industrial Estate, India", margin, 26);
    doc.text(`GSTIN: ${manufacturer?.gstNo || "24AAACC1206D1ZM"} | DL: DL-M-5678/2023`, margin, 31);
    doc.text(`Email: support@medtrace.com`, margin, 36);

    // --- Invoice Title & Details (Right Side) ---
    doc.setTextColor(33, 33, 33);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`NO: INV-${Date.now().toString().slice(-6)}`, pageWidth - margin, 28, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - margin, 33, { align: "right" });
    doc.text(`Status: Paid`, pageWidth - margin, 38, { align: "right" });

    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, 45, pageWidth - margin, 45);

    // --- Billed To Section ---
    const billToY = 55;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    doc.text("BILLED TO:", margin, billToY);
    
    doc.setFont("helvetica", "normal");
    doc.text(dist?.name || "Client Name", margin, billToY + 6);
    doc.text(dist?.location || "Location N/A", margin, billToY + 11);
    doc.text(`GSTIN: ${dist?.gstNo || "N/A"}`, margin, billToY + 16);

    // --- Table ---
    const tableRows = cart.map((item, index) => {
        const rate = item.unitPrice;
        const qty = item.quantity;
        const amount = rate * qty;
        
        // Simple Tax calculation (e.g. 18% total or split)
        const taxRate = 18; 
        const taxAmt = (amount * taxRate) / 100;
        const total = amount + taxAmt;

        return [
            index + 1,
            item.medicineName,
            item.id.substring(0, 8).toUpperCase(), // Batch
            qty,
            `INR ${rate.toFixed(2)}`,
            `${taxRate}%`,
            `INR ${taxAmt.toFixed(2)}`,
            `INR ${total.toFixed(2)}`
        ];
    });

    autoTable(doc, {
      startY: 80,
      head: [['#', 'Medicine', 'Batch', 'Qty', 'Price', 'Tax %', 'Tax Amt', 'Total']],
      body: tableRows,
      theme: 'plain', // Cleaner look, professional
      headStyles: { 
          fillColor: [240, 240, 240], // Light Gray Header
          textColor: [33, 33, 33], 
          fontStyle: 'bold',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
      },
      styles: { 
          fontSize: 9, 
          cellPadding: 4, 
          valign: 'middle',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
      },
      columnStyles: {
        0: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'center' },
        6: { halign: 'right' },
        7: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    // --- Bottom Section ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const leftX = margin;
    const rightX = pageWidth - margin;

    // Bank Details (Left Side)
    doc.setFont("helvetica", "bold");
    doc.text("Bank Details:", leftX, finalY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Bank: HDFC Bank", leftX, finalY + 6);
    doc.text("A/C No: XXXXXXXXXX5678", leftX, finalY + 11);
    doc.text("IFSC: HDFC0001234", leftX, finalY + 16);

    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", leftX, finalY + 30);
    doc.setFont("helvetica", "normal");
    doc.text("1. Goods once sold will not be taken back.", leftX, finalY + 36);
    doc.text("2. Interest @18% p.a. will be charged if not paid within due date.", leftX, finalY + 41);

    // Totals (Right Side)
    const subTotal = cart.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    const totalTax = (subTotal * 18) / 100;
    const grandTotal = subTotal + totalTax;

    const summaryX = pageWidth - 70; // Start X for labels

    doc.setFontSize(10);
    doc.text("Sub Total:", summaryX, finalY, { align: "right" });
    doc.text(`INR ${subTotal.toFixed(2)}`, rightX, finalY, { align: "right" });

    doc.text("Tax (18%):", summaryX, finalY + 6, { align: "right" });
    doc.text(`INR ${totalTax.toFixed(2)}`, rightX, finalY + 6, { align: "right" });

    // Divider for Total
    doc.setDrawColor(200, 200, 200);
    doc.line(summaryX - 20, finalY + 10, rightX, finalY + 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", summaryX, finalY + 18, { align: "right" });
    doc.text(`INR ${grandTotal.toFixed(2)}`, rightX, finalY + 18, { align: "right" });

    // Signature Area
    const signY = finalY + 50;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`For ${manufacturer?.name || "MEDTRACE PHARMA"}`, rightX, signY, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signatory", rightX, signY + 15, { align: "right" });

    window.open(doc.output('bloburl'), '_blank');
  };

  if (!mounted) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 p-6 md:p-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
             {view === 'dashboard' ? 'Logistics Hub' : 'Create Invoice'}
           </h1>
           <p className="text-sm font-medium text-slate-500 mt-1">
             {view === 'dashboard' ? 'Analytics & Performance' : 'New Shipment Entry'}
           </p>
        </div>
        <div className="flex gap-3">
           {view === 'create' && (
             <button onClick={() => setView('dashboard')} className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Back</button>
           )}
           {view === 'dashboard' && (
             <button onClick={() => setView('create')} className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-[#1d4ed8] transition-all flex items-center gap-2 transform hover:-translate-y-1">
                <Icons.Add /> New Shipment
             </button>
           )}
        </div>
      </div>

      {/* DASHBOARD */}
      {view === 'dashboard' && (
        <div className="space-y-8">
          
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Revenue", val: `₹${totalRevenue.toLocaleString()}`, icon: <Icons.Wallet />, bg: "bg-[#4F46E5]" }, 
              { label: "Dispatched", val: totalDispatched, icon: <Icons.Truck />, bg: "bg-[#0EA5E9]" }, 
              { label: "Active Batches", val: activeBatches, icon: <Icons.Box />, bg: "bg-[#10B981]" }, 
              { label: "Partners", val: activeDistributors, icon: <Icons.User />, bg: "bg-[#F59E0B]" }, 
            ].map((k, i) => (
              <div key={i} className={`p-6 rounded-2xl shadow-sm border border-slate-100 bg-white relative overflow-hidden group hover:shadow-md transition-all`}>
                 <div className="flex justify-between items-start relative z-10">
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{k.label}</p>
                       <h3 className="text-3xl font-black text-slate-800">{k.val}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${k.bg} text-white shadow-md transform group-hover:scale-110 transition-transform`}>
                       {k.icon}
                    </div>
                 </div>
                 <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${k.bg} opacity-10`}></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* REVENUE CHART */}
             <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-lg font-bold text-slate-800">Weekly Revenue</h3>
                   <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Last 7 Days</span>
                </div>
                
                <div className="flex items-end justify-between h-64 gap-4">
                   {chartData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                         <div className="w-full bg-slate-50 rounded-t-lg relative flex items-end h-full overflow-hidden">
                            <div 
                                style={{ height: `${(d.amount / maxChartValue) * 100}%`, minHeight: d.amount > 0 ? '4px' : '0px' }} 
                                className={`w-full rounded-t-lg transition-all duration-700 ease-out
                                ${d.amount > 0 ? 'bg-gradient-to-t from-blue-600 to-cyan-400 opacity-90 group-hover:opacity-100' : 'bg-transparent'}
                                `}
                            >
                                {d.amount > 0 && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                        ₹{d.amount}
                                    </div>
                                )}
                            </div>
                         </div>
                         <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{d.day}</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* TOP PRODUCTS */}
             <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Top Performers</h3>
                <div className="space-y-6">
                   {topProducts.length > 0 ? topProducts.map((prod, i) => (
                      <div key={i}>
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-700 w-2/3 truncate">{prod.name}</span>
                            <span className="text-xs font-bold text-blue-600">{prod.sold} Sold</span>
                         </div>
                         <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div style={{ width: `${prod.percent}%` }} className={`h-full rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-cyan-400' : 'bg-teal-400'}`}></div>
                         </div>
                      </div>
                   )) : <p className="text-xs text-slate-400 text-center py-10">No sales data recorded yet.</p>}
                </div>
             </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Recent Shipments</h3>
                <span className="text-xs font-bold text-slate-400 uppercase">Live Feed</span>
             </div>
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-50 bg-slate-50/50">
                   <th className="py-4 pl-8">Date</th><th className="py-4">Distributor</th><th className="py-4">Amount</th><th className="py-4">Status</th><th className="py-4 text-right pr-8">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {safeShipments.map((ship) => (
                   <tr key={ship.id} className="hover:bg-blue-50/30 transition-colors">
                     <td className="py-4 pl-8 text-xs font-bold text-slate-500">
                        {new Date(ship.createdAt).toLocaleDateString("en-GB")}
                     </td>
                     <td className="py-4 text-sm font-bold text-slate-700">{ship.distributor?.name}</td>
                     <td className="py-4 text-xs font-bold text-slate-900">₹{ship.totalAmount.toLocaleString()}</td>
                     <td className="py-4">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wide">
                         ● {ship.status.replace('_', ' ')}
                       </span>
                     </td>
                     <td className="py-4 pr-8 text-right">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors"><Icons.Print /></button>
                     </td>
                   </tr>
                 ))}
                 {safeShipments.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-xs text-slate-400 font-medium uppercase">No recent activity</td></tr>}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* CREATE VIEW */}
      {view === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">1. Select Distributor</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {distributors.map((d) => (
                     <div key={d.id} onClick={() => setSelectedDistributor(d.id)} className={`p-5 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${selectedDistributor === d.id ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-300'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedDistributor === d.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{d.name.charAt(0)}</div>
                        <div><h4 className="text-sm font-bold text-slate-800">{d.name}</h4><p className="text-[10px] text-slate-500">{d.location}</p></div>
                     </div>
                   ))}
                 </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">2. Select Inventory</h3>
                 <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 sticky top-0"><tr className="text-[10px] font-bold text-slate-500 uppercase"><th className="p-4 pl-6">Item</th><th className="p-4">Stock</th><th className="p-4 text-right pr-6">Action</th></tr></thead>
                     <tbody className="divide-y divide-slate-100 text-sm">
                       {batches.map((b) => (
                         <tr key={b.id} className="hover:bg-slate-50">
                           <td className="p-4 pl-6"><div className="font-bold text-slate-800">{b.medicineName}</div><div className="font-mono text-[10px] text-slate-400 uppercase">{b.id.substring(0,8)}</div></td>
                           <td className="p-4"><div className={`text-[10px] font-bold inline-flex items-center gap-1 px-2 py-1 rounded ${b.currentStock < 50 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{b.currentStock} Units</div></td>
                           <td className="p-4 text-right pr-6"><button onClick={() => addToShipment(b)} disabled={b.currentStock <= 0} className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors">Add</button></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
           </div>
           <div className="lg:col-span-1">
              <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white sticky top-6 flex flex-col h-[calc(100vh-100px)]">
                 <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Cart</h3>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold">{cart.length}</span>
                 </div>
                 <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 relative z-10 mb-6 pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/10 group hover:border-blue-500/50 transition-all">
                         <div className="flex justify-between items-start mb-2"><p className="text-xs font-bold text-white leading-tight">{item.medicineName}</p><button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400">×</button></div>
                         <div className="flex justify-between items-center"><p className="text-[10px] text-slate-400 font-mono uppercase">{item.id.substring(0,8)}</p><input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.currentStock)} className="w-12 bg-black/20 text-center text-white font-bold outline-none text-xs rounded py-1" /></div>
                      </div>
                    ))}
                    {cart.length === 0 && <div className="h-40 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-xl"><p className="text-xs font-bold uppercase">Empty</p></div>}
                 </div>
                 <div className="pt-6 border-t border-slate-700 space-y-4 mt-auto">
                   <div className="flex justify-between items-center text-xs"><span className="text-slate-400 font-bold uppercase">Total</span><span className="text-xl font-black text-white">₹{cart.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toLocaleString()}</span></div>
                   <button onClick={generatePDF} className="w-full py-3.5 rounded-xl text-xs font-bold border border-slate-600 hover:bg-slate-800 text-slate-300 transition-all uppercase tracking-wide">Preview Invoice</button>
                   <button onClick={handleDispatch} disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition-all disabled:opacity-50 flex justify-center items-center gap-2">{loading ? "Processing..." : "Confirm Dispatch"}</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}