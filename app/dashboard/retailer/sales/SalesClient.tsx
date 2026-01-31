"use client";

import { useState, useMemo } from "react";
import { 
  Calendar, Search, Package, Tablets, CheckCircle2, IndianRupee, 
  List, Layers, TrendingUp, History, Download, ReceiptText, Syringe,
  Filter, ChevronDown, Printer, ShoppingBag, BarChart3, AlertCircle
} from "lucide-react";

export default function SalesClient({ sales }: { sales: any[] }) {
  const [viewMode, setViewMode] = useState<"items" | "bills">("items");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔍 Filter Logic (Safe Check Added for Manual Items)
  const filteredSales = useMemo(() => sales.filter(s => {
      // যদি ব্যাচ থাকে তবে প্রোডাক্টের নাম, না থাকলে ম্যানুয়াল নাম
      const prodName = s.batch?.product?.name || s.manualItemName || "Manual Item";
      const batchNo = s.batch?.batchNumber || "N/A";
      
      return prodName.toLowerCase().includes(searchTerm.toLowerCase()) || 
             batchNo.toLowerCase().includes(searchTerm.toLowerCase());
  }), [sales, searchTerm]);

  // 🧾 Grouping Logic
  const groupedBills = useMemo(() => {
    const groups = filteredSales.reduce((acc: any, sale) => {
      const dateKey = new Date(sale.date).toISOString(); 
      if (!acc[dateKey]) {
        acc[dateKey] = {
          id: dateKey, 
          date: sale.date,
          totalAmount: 0,
          items: []
        };
      }
      acc[dateKey].items.push(sale);
      acc[dateKey].totalAmount += sale.totalPrice;
      return acc;
    }, {});
    
    return Object.values(groups).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredSales]);

  // 📊 Dashboard Statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalOrders = groupedBills.length;
  const totalItemsSold = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 pb-20">
       
       {/* 1. Header & Stats Section */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Title Card */}
          <div className="lg:col-span-2 relative bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] shadow-xl shadow-indigo-100 overflow-hidden text-white flex flex-col justify-center">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
                     <TrendingUp size={24} className="text-white"/>
                   </div>
                   <h1 className="text-2xl font-black tracking-tight">Sales Overview</h1>
                </div>
                <p className="text-indigo-100 font-medium text-sm max-w-lg">
                  Monitor your daily sales performance, track total orders, and manage billing history seamlessly.
                </p>
             </div>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-center gap-2 hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                   <ShoppingBag size={14}/> Orders
                </div>
                <p className="text-3xl font-black text-slate-800">{totalOrders}</p>
             </div>

             <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-center gap-2 hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                   <Package size={14}/> Items Sold
                </div>
                <p className="text-3xl font-black text-slate-800">{totalItemsSold}</p>
             </div>

             <div className="col-span-2 bg-emerald-50 p-5 rounded-[24px] border border-emerald-100 flex items-center justify-between group">
                <div>
                   <p className="text-emerald-600/80 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                   <p className="text-3xl font-black text-emerald-700 flex items-center gap-1">
                      <IndianRupee size={24} strokeWidth={3}/> {totalRevenue.toLocaleString()}
                   </p>
                </div>
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                   <BarChart3 size={20}/>
                </div>
             </div>
          </div>
       </div>

       {/* 2. Controls & Filters */}
       <div className="sticky top-4 z-30">
          <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-white/50 shadow-lg shadow-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-3">
             <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                <input 
                  type="text" 
                  placeholder="Search medicine, batch..." 
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition font-medium text-sm text-slate-700 placeholder:text-slate-400"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode("items")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'items' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <List size={16}/> Items
                </button>
                <button 
                  onClick={() => setViewMode("bills")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'bills' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <Layers size={16}/> Bills
                </button>
             </div>
          </div>
       </div>

       {/* 3. Content Area */}
       {filteredSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-slate-300"/>
             </div>
             <h3 className="text-slate-800 font-bold text-lg">No records found</h3>
             <p className="text-slate-500 text-sm">Try changing your filters or search term.</p>
          </div>
       ) : (
         <>
           {/* VIEW MODE 1: ITEMS TABLE */}
           {viewMode === "items" && (
             <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-200">
                      <tr>
                        <th className="p-5 pl-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Batch</th>
                        <th className="p-5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                        <th className="p-5 text-right pr-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors group">
                          {/* 1. Time Column */}
                          <td className="p-5 pl-6 whitespace-nowrap">
                             <div className="flex flex-col">
                                <span suppressHydrationWarning className="font-bold text-slate-700 text-sm">
                                   {new Date(sale.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                </span>
                                <span suppressHydrationWarning className="text-xs text-slate-400 font-mono">
                                   {new Date(sale.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                          </td>

                          {/* 2. Product Column (Updated for Manual Items) */}
                          <td className="p-5">
                             {sale.batch ? (
                                // ✅ Real Inventory Item
                                <div className="flex items-center gap-3">
                                   <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${
                                      sale.batch.product.type === 'INJECTION' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                   }`}>
                                      {sale.batch.product.type === 'INJECTION' ? <Syringe size={18}/> : <Tablets size={18}/>}
                                   </div>
                                   <div>
                                      <p className="font-bold text-slate-800 text-sm">{sale.batch.product.name}</p>
                                      <p className="text-xs text-slate-500">{sale.batch.product.type}</p>
                                   </div>
                                </div>
                             ) : (
                                // ⚠️ Manual Item
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg bg-orange-50 text-orange-600">
                                      <AlertCircle size={18}/>
                                   </div>
                                   <div>
                                      <p className="font-bold text-slate-800 text-sm">{sale.manualItemName || "Manual Item"}</p>
                                      <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded flex items-center w-fit mt-1">
                                         EXT-ITEM
                                      </span>
                                   </div>
                                </div>
                             )}
                          </td>

                          {/* 3. Batch Column */}
                          <td className="p-5">
                             {sale.batch ? (
                                <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                   {sale.batch.batchNumber}
                                </span>
                             ) : (
                                <span className="text-xs text-slate-400 italic">N/A</span>
                             )}
                          </td>

                          {/* 4. Quantity */}
                          <td className="p-5 text-center">
                             <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                {sale.quantity} {sale.unitType === 'TABLET' ? 'Tabs' : 'Units'}
                             </span>
                          </td>

                          {/* 5. Total Price */}
                          <td className="p-5 pr-6 text-right">
                             <span className="font-black text-emerald-600">₹{sale.totalPrice.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           )}

           {/* VIEW MODE 2: GROUPED BILLS */}
           {viewMode === "bills" && (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* @ts-ignore */}
                {groupedBills.map((bill: any, idx) => (
                   <div key={idx} className="bg-white border border-slate-200 rounded-[24px] p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group flex flex-col">
                      
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4 border-b border-dashed border-slate-100 pb-4">
                         <div className="flex gap-3">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100">
                               <ReceiptText size={20}/>
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Time</p>
                               <p suppressHydrationWarning className="font-bold text-slate-800 text-sm font-mono">
                                  {new Date(bill.date).toLocaleString('en-IN', {
                                     weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                               <CheckCircle2 size={10}/> PAID
                            </span>
                         </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2 mb-4 flex-1">
                         {bill.items.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs items-center">
                               <div className="flex items-center gap-2 text-slate-600 font-medium">
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500">
                                     {item.quantity}x
                                  </span>
                                  {/* ✅ Manual Item Name Handling */}
                                  {item.batch ? item.batch.product.name : (item.manualItemName || "Manual Item")}
                               </div>
                               <div className="font-bold text-slate-800">₹{item.totalPrice.toFixed(2)}</div>
                            </div>
                         ))}
                         {bill.items.length > 3 && (
                            <p className="text-[10px] font-bold text-indigo-500 pt-1 text-center bg-indigo-50/50 py-1 rounded-lg">
                               + {bill.items.length - 3} more items
                            </p>
                         )}
                      </div>

                      {/* Card Footer */}
                      <div className="flex justify-between items-center pt-2 mt-auto border-t border-slate-50">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Total Bill</p>
                            <p className="text-xl font-black text-slate-900">₹{bill.totalAmount.toFixed(2)}</p>
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 rounded-xl" title="Print">
                               <Printer size={16}/>
                            </button>
                            <button className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 rounded-xl" title="Download">
                               <Download size={16}/>
                            </button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
           )}
         </>
       )}
    </div>
  );
}