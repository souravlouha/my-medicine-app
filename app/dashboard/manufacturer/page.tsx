import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import ClientMedicineManager from "./ClientMedicineManager";

export default async function ManufacturerDashboard() {
  const cookieStore = await cookies();
  let userId = cookieStore.get("userId")?.value;

  // ১. ইউজার ফলব্যাক (তোমার আগের লজিক)
  if (!userId) {
     const fallbackUser = await prisma.user.findFirst();
     userId = fallbackUser?.id;
  }

  // ২. রিয়েল ইনভেন্টরি স্টক (তোমার আগের লজিক)
  const stockData = await prisma.batch.aggregate({
    _sum: { currentStock: true },
    where: { manufacturerId: userId }
  });
  const totalStock = stockData._sum.currentStock || 0;

  // ৩. লেটেস্ট ব্যাচ লিস্ট (টেবিলের জন্য - আগের লজিক)
  const latestBatches = await prisma.batch.findMany({
    where: { manufacturerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5 
  });

  // ৪. উইকলি চার্ট লজিক (তোমার আগের ডাইনামিক লজিক)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentBatches = await prisma.batch.findMany({
    where: {
      manufacturerId: userId,
      createdAt: { gte: sevenDaysAgo }
    },
    select: { createdAt: true, totalStrips: true }
  });

  const chartData = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = days[d.getDay()];
    
    const dayBatches = recentBatches.filter(b => {
      const bDate = new Date(b.createdAt);
      return bDate.getDate() === d.getDate() && bDate.getMonth() === d.getMonth();
    });

    const totalProduced = dayBatches.reduce((sum, b) => sum + (b.totalStrips || 0), 0);
    chartData.push({ day: dayName, count: totalProduced });
  }
  const maxVal = Math.max(...chartData.map(d => d.count), 10);

  // 🔥 ৫. পাই চার্ট (PIE CHART) লজিক (নতুন অ্যাড করা হয়েছে)
  // আমরা দেখব কোন মেডিসিন সবচেয়ে বেশি তৈরি হচ্ছে
  const distributionData = await prisma.batch.groupBy({
    by: ['medicineName'],
    _sum: { totalStrips: true },
    where: { manufacturerId: userId },
    orderBy: { _sum: { totalStrips: 'desc' } },
    take: 3 // টপ ৩টি মেডিসিন দেখাবে
  });

  // পাই চার্টের জন্য কালার সেট
  const pieColors = ['#3B82F6', '#10B981', '#F59E0B']; // Blue, Green, Yellow
  const totalProduction = distributionData.reduce((acc, curr) => acc + (curr._sum.totalStrips || 0), 0);

  return (
    <div className="space-y-8 pb-20 bg-gray-50/50 min-h-screen">
      
      {/* --- TOP ROW: STATS & PIE CHART --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: LIVE STOCK (তোমার আগের কার্ড, ডিজাইন ইমপ্রুভড) */}
        <div className="lg:col-span-1 bg-[#0D1B3E] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group text-white flex flex-col justify-between h-80">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-bl-full -mr-10 -mt-10 blur-xl transition-all group-hover:scale-110"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-3 w-3 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-[#0D1B3E]"></span>
               </span>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">System Live</p>
            </div>
            <h2 className="text-7xl font-black tracking-tighter mb-1">
                {totalStock.toLocaleString()}
            </h2>
            <p className="text-sm font-medium text-gray-400">Total Active Units</p>
          </div>

          <div className="w-full bg-white/10 rounded-full h-12 flex items-center px-4 backdrop-blur-sm border border-white/5">
             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 w-full text-center">
               Last Sync: Just Now
             </span>
          </div>
        </div>

        {/* CARD 2: PIE CHART (নতুন অ্যাড করা হয়েছে) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-80 relative overflow-hidden">
           <h3 className="text-sm font-black text-[#0D1B3E] uppercase tracking-widest mb-6">Production Distribution</h3>
           
           <div className="flex items-center justify-center gap-10 h-full">
              {/* CSS Only Pie Chart using Conic Gradient */}
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner"
                   style={{
                     background: `conic-gradient(
                       ${pieColors[0]} 0% ${distributionData[0] ? (distributionData[0]._sum.totalStrips! / totalProduction) * 100 : 0}%,
                       ${pieColors[1]} 0% ${distributionData[1] ? ((distributionData[0]._sum.totalStrips! + distributionData[1]._sum.totalStrips!) / totalProduction) * 100 : 0}%,
                       #E5E7EB 0% 100%
                     )`
                   }}>
                 <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                    <span className="text-2xl font-black text-[#0D1B3E]">{distributionData.length}</span>
                    <span className="text-[8px] font-bold uppercase text-gray-400">Medicines</span>
                 </div>
              </div>

              {/* Legend (Side Details) */}
              <div className="space-y-4">
                 {distributionData.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: pieColors[idx] || 'gray' }}></div>
                      <div>
                        <p className="text-xs font-bold text-[#0D1B3E]">{item.medicineName.split('(')[0]}</p>
                        <p className="text-[10px] font-bold text-gray-400">
                          {((item._sum.totalStrips! / totalProduction) * 100).toFixed(1)}% Share
                        </p>
                      </div>
                   </div>
                 ))}
                 {distributionData.length === 0 && <p className="text-xs text-gray-400 italic">No production data yet.</p>}
              </div>
           </div>
        </div>
      </div>

      {/* --- MIDDLE ROW: WEEKLY BAR CHART (IMPROVED TOOLTIP) --- */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-center mb-12">
             <div>
               <h3 className="text-lg font-black text-[#0D1B3E] uppercase tracking-tighter">Weekly Throughput</h3>
               <p className="text-xs text-gray-400 font-bold mt-1">Production volume over the last 7 days</p>
             </div>
             <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
               Analytics
             </div>
          </div>
          
          <div className="flex items-end justify-between h-52 px-4 gap-6">
            {chartData.map((s, index) => {
              const heightPercentage = Math.round((s.count / maxVal) * 100);
              const barHeight = heightPercentage > 0 ? `${heightPercentage}%` : '4px';
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end relative">
                  
                  {/* 🔥 FIX: Tooltip এখন অনেক বেশি ভিজিবল এবং প্রফেশনাল */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -top-12 bg-gray-900 text-white text-[10px] font-bold py-2 px-3 rounded-lg shadow-xl transform translate-y-2 group-hover:translate-y-0 z-10 pointer-events-none whitespace-nowrap">
                    {s.count.toLocaleString()} Units
                    {/* Tooltip Arrow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                  
                  {/* The Bar with Gradient */}
                  <div 
                    style={{ height: barHeight }} 
                    className={`w-full max-w-[50px] rounded-t-2xl transition-all duration-700 ease-out relative overflow-hidden group-hover:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.5)] ${s.count > 0 ? 'bg-gradient-to-t from-[#0D1B3E] to-blue-600' : 'bg-gray-100'}`}
                  >
                  </div>
                  
                  {/* Day Label */}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${s.count > 0 ? 'text-[#0D1B3E]' : 'text-gray-300'}`}>
                    {s.day}
                  </span>
                </div>
              );
            })}
          </div>
      </div>

      {/* --- BOTTOM SECTION: CATALOG & TABLE --- */}
      <ClientMedicineManager />

      <div className="bg-[#0D1B3E] p-10 rounded-[3rem] shadow-2xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <h3 className="text-xl font-black uppercase tracking-tighter mb-10 relative z-10">Live Production Tracker</h3>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] border-b border-white/10">
                <th className="pb-6 pl-4">Batch ID</th>
                <th className="pb-6">Medicine</th>
                <th className="pb-6">Mfg Date</th>
                <th className="pb-6">Qty</th>
                <th className="pb-6 text-right pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {latestBatches.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition-all duration-300 group">
                  <td className="py-6 pl-4 font-mono text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors">
                    {b.id.substring(0, 15)}...
                  </td>
                  <td className="py-6 text-sm font-bold text-gray-200 group-hover:text-white">
                    {b.medicineName.split('(')[0]}
                    <span className="block text-[9px] text-gray-500 font-normal mt-1">{b.medicineName.split('(')[1]?.replace(')', '')}</span>
                  </td>
                  <td className="py-6 text-[11px] text-gray-400 font-bold">
                    {new Date(b.mfgDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-6 text-sm font-black text-blue-400">{b.totalStrips}</td>
                  <td className="py-6 text-right pr-4">
                    <span className="bg-green-500/10 text-green-400 text-[8px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {latestBatches.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">No Data Available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}