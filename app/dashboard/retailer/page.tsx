import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import ManualInput from "../distributor/ManualInput";
import ProfileUpdate from "./ProfileUpdate";
import QuickSale from "./QuickSale";
import ReceiveScanner from "../distributor/ReceiveScanner";
import { Download, Search } from "lucide-react"; // Search আইকন যোগ করা হলো

export default async function RetailerDashboard() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const allTransfers = await prisma.transfer.findMany({
    where: { toId: userId },
    include: { batch: true },
    orderBy: { createdAt: 'desc' }
  });

  const stocks = allTransfers.filter(t => t.status === "RECEIVED");
  
  const sales = await prisma.sale.findMany({ where: { retailerId: userId } });
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.salePrice, 0);

  const today = new Date();
  
  const nearExpiry = stocks.filter(s => {
    const expDate = new Date(s.batch.expDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 90;
  });

  const lowStock = stocks.filter(s => s.quantity < 5);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 font-sans">
      {/* ১. হেডার ও প্রোফাইল */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">{user?.name}</h1>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Verified Store</span>
          </div>
          <p className="text-gray-500 font-bold text-sm mt-1">📍 {user?.location} | 📞 {user?.phone}</p>
        </div>
        <div className="w-full md:w-72">
          {/* প্রোফাইল পেজে যাওয়ার নতুন বাটন */}
          <a 
            href="/dashboard/profile" 
            className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 hover:text-white p-4 rounded-2xl border border-blue-100 text-xs font-black text-blue-600 uppercase tracking-widest transition-all shadow-sm group"
          >
            <span className="group-hover:rotate-90 transition-transform duration-500">⚙️</span> 
            Edit Shop Details
          </a>
        </div>
      </div>

      {/* ২. মেইন কার্ডস */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0D1B3E] p-6 rounded-3xl text-white shadow-lg">
          <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Total Revenue</p>
          <p className="text-4xl font-black mt-1">₹ {totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-50 text-blue-900 shadow-sm">
          <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Units Sold</p>
          <p className="text-4xl font-black mt-1">{sales.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-green-50 text-green-900 shadow-sm">
          <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Stock Batches</p>
          <p className="text-4xl font-black mt-1">{stocks.length}</p>
        </div>
      </div>

      {/* ৩. কুইক সেল বাটন */}
      <div className="grid grid-cols-1">
        <QuickSale retailerId={userId!} />
      </div>

      {/* ৪. অ্যালার্ট সেকশন */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
          <h3 className="text-red-700 font-black flex items-center gap-2 uppercase text-xs tracking-widest mb-4">🚨 Near Expiry</h3>
          {nearExpiry.length > 0 ? (
             <div className="space-y-3">
                {nearExpiry.map(item => (
                   <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border border-red-50">
                      <span className="font-bold text-gray-800">{item.medicineName}</span>
                      <span className="text-xs text-red-600 font-black italic">EXP: {item.batch.expDate}</span>
                   </div>
                ))}
             </div>
          ) : <p className="text-gray-400 text-xs text-center">No items near expiry ✅</p>}
        </div>

        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <h3 className="text-orange-700 font-black flex items-center gap-2 uppercase text-xs tracking-widest mb-4">📦 Low Stock</h3>
          {lowStock.length > 0 ? (
             <div className="space-y-3">
                {lowStock.map(item => (
                   <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border border-orange-50">
                      <span className="font-bold text-gray-800">{item.medicineName}</span>
                      <span className="text-xs text-orange-600 font-black uppercase">Only {item.quantity} Left!</span>
                   </div>
                ))}
             </div>
          ) : <p className="text-gray-400 text-xs text-center">Stock levels are healthy ✅</p>}
        </div>
      </div>

      {/* ৫. Current Stock Status */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-blue-50/50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-black text-blue-800 uppercase text-xs tracking-widest">Current Stock Status</h3>
          {/* নতুন Master Tracker লিঙ্ক */}
          <a href="/dashboard/track" className="text-[10px] font-black text-blue-600 uppercase hover:underline">Track Any Unit →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {stocks.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30 flex justify-between items-center group hover:border-blue-200 transition-all">
              <div>
                <p className="font-bold text-gray-800">{item.medicineName}</p>
                <p className="text-[10px] text-gray-400 font-mono">Batch: {item.batchId}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-blue-600">{item.quantity}</p>
                <p className="text-[10px] uppercase font-bold text-gray-400">Strips Left</p>
              </div>
            </div>
          ))}
          {stocks.length === 0 && <p className="col-span-full text-center text-gray-400 text-xs py-10">No stock available</p>}
        </div>
      </div>

      {/* ৬. রিস্টক ইনপুট */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-black mb-2 text-gray-800 uppercase tracking-tight">📥 Add New Stock</h2>
        <ManualInput />
      </div>

      {/* ৭. ইনভেন্টরি লগ টেবিল */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 text-center">
          <h3 className="font-black text-gray-700 uppercase text-xs tracking-widest">Inbound History Log</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="p-4">Medicine</th>
              <th className="p-4">Batch ID</th>
              <th className="p-4">Qty</th>
              <th className="p-4 text-right">Action / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allTransfers.map((item) => (
              <tr key={item.id} className="text-sm hover:bg-gray-50/50 transition-colors group">
                <td className="p-4 font-bold text-gray-800">{item.medicineName}</td>
                <td className="p-4 font-mono text-xs text-blue-500">{item.batchId}</td>
                <td className="p-4 font-semibold text-gray-600">{item.quantity}</td>
                <td className="p-4 text-right flex justify-end gap-3 items-center">
                  
                  {/* ১. নতুন Invoice দেখার বাটন */}
                  {item.invoiceNo && (
                    <a 
                      href={`/dashboard/invoice/${item.invoiceNo}`}
                      target="_blank"
                      className="flex items-center gap-1 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                      <Download size={12} /> Invoice
                    </a>
                  )}

                  {/* ২. পুরনো রিসিভ/স্ট্যাটাস লজিক (অপরিবর্তিত) */}
                  {item.status === "PENDING" ? (
                    <ReceiveScanner transferId={item.id} />
                  ) : (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                      RECEIVED
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}