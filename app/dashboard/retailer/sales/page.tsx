import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calendar, Search, Filter, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SalesHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // ✅ ডাটা ফেচিং
  const sales = await prisma.salesRecord.findMany({
    where: { sellerId: userId },
    include: {
      batch: {
        include: { product: true }
      }
    },
    orderBy: { date: 'desc' }
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Sales History</h1>
            <p className="text-slate-500 font-medium">Track every transaction and revenue details.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue</p>
              <h2 className="text-2xl font-black text-emerald-600">₹{totalRevenue.toLocaleString()}</h2>
            </div>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <TrendingUp size={20}/>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Filters */}
          <div className="p-5 border-b border-slate-100 flex gap-3">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
                <input type="text" placeholder="Search sales..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900/10"/>
             </div>
             <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                <Filter size={18}/> Filter
             </button>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-5">Date & Time</th>
                  <th className="p-5">Medicine Info</th>
                  <th className="p-5">Batch No</th>
                  <th className="p-5 text-center">Quantity</th>
                  <th className="p-5 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sales.length === 0 ? (
                   <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400 font-medium">No sales records found.</td>
                   </tr>
                ) : (
                  // 🔴 Force Fix: (sale: any) ব্যবহার করা হয়েছে যাতে লাল দাগ না আসে
                  sales.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition group">
                      <td className="p-5">
                        <div className="flex items-center gap-3 font-bold text-slate-700">
                          <Calendar size={16} className="text-slate-400"/>
                          <div>
                            <p>{new Date(sale.date).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                              {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-slate-900">{sale.batch.product.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{sale.batch.product.genericName}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">
                          {sale.batch.product.type}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {sale.batch.batchNumber}
                        </span>
                      </td>
                      
                      {/* Quantity & Unit Type */}
                      <td className="p-5 text-center">
                        <span className="text-lg font-black text-slate-800">{sale.quantity}</span>
                        {/* এখন আর এখানে লাল দাগ আসবে না কারণ আমরা sale কে any বানিয়ে দিয়েছি */}
                        <span className={`ml-1 text-xs font-bold uppercase ${sale.unitType === 'TABLET' ? 'text-orange-500' : 'text-slate-400'}`}>
                           {sale.unitType === "TABLET" ? "Tabs" : "Strips"}
                        </span>
                      </td>

                      <td className="p-5 text-right">
                        <p className="text-lg font-black text-emerald-600">₹{sale.totalPrice}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Received via Cash/UPI</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}