import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Calendar, Search, Filter, TrendingUp, 
  Package, Tablets, CheckCircle2, IndianRupee 
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales History</h1>
            <p className="text-slate-500 font-medium mt-1">Track every transaction and monitor your revenue.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
            <div className="text-right">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Total Revenue</p>
              <h2 className="text-2xl font-black text-emerald-700 flex items-center justify-end gap-1">
                <IndianRupee size={20}/> {totalRevenue.toLocaleString()}
              </h2>
            </div>
            <div className="h-10 w-10 bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
              <TrendingUp size={20}/>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
          
          {/* Filters & Search */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-white/50 backdrop-blur-sm">
             <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition" size={18}/>
                <input 
                  type="text" 
                  placeholder="Search by medicine name, batch no..." 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition font-medium"
                />
             </div>
             <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 bg-white rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm hover:shadow">
                <Filter size={18}/> Filter
             </button>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-6">Date & Time</th>
                  <th className="p-6">Medicine Info</th>
                  <th className="p-6">Batch No</th>
                  <th className="p-6 text-center">Quantity</th>
                  <th className="p-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sales.length === 0 ? (
                   <tr>
                      <td colSpan={5} className="p-16 text-center text-slate-400 font-medium bg-slate-50/30">
                        <div className="flex flex-col items-center gap-2">
                          <Package size={32} className="opacity-20"/>
                          <p>No sales records found yet.</p>
                        </div>
                      </td>
                   </tr>
                ) : (
                  sales.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-blue-50/30 transition group duration-200">
                      
                      {/* Date */}
                      <td className="p-6">
                        <div className="flex items-center gap-3 font-bold text-slate-700">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                            <Calendar size={18}/>
                          </div>
                          <div>
                            <p>{new Date(sale.date).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                              {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Medicine Info */}
                      <td className="p-6">
                        <p className="font-bold text-slate-900 text-base">{sale.batch.product.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{sale.batch.product.genericName}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-500 border border-slate-200">
                          {sale.batch.product.type}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="p-6">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {sale.batch.batchNumber}
                        </span>
                      </td>
                      
                      {/* Quantity & Unit Type */}
                      <td className="p-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                          <span className="text-lg font-black text-slate-800">{sale.quantity}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${sale.unitType === 'TABLET' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                             {sale.unitType === "TABLET" ? <Tablets size={12}/> : <Package size={12}/>}
                             {sale.unitType === "TABLET" ? "Tabs" : "Strips"}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-6 text-right">
                        <p className="text-lg font-black text-emerald-600 flex items-center justify-end gap-0.5">
                          <IndianRupee size={16} strokeWidth={3}/>{sale.totalPrice.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] font-bold text-slate-400">
                          <CheckCircle2 size={12} className="text-emerald-500"/> Paid via Cash/UPI
                        </div>
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