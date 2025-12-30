"use client";

import { useState } from "react";

export default function DispatchDashboard() {
  const [filter, setFilter] = useState("ALL");

  // --- MOCK DATA (পরে ডাটাবেস থেকে আসবে) ---
  const kpiData = [
    { title: "Total Dispatched", value: "1,240", sub: "Boxes", change: "+12%", icon: "📦", color: "blue" },
    { title: "In Transit", value: "45", sub: "Shipments", change: "Active", icon: "🚚", color: "orange" },
    { title: "Delivered", value: "89%", sub: "Success Rate", change: "+5%", icon: "✅", color: "green" },
    { title: "Revenue", value: "₹4.2M", sub: "This Month", change: "+18%", icon: "💰", color: "indigo" },
  ];

  const recentLogs = [
    { id: "SHP-001", dest: "Apollo Pharmacy, Kolkata", date: "2025-01-02", items: 120, status: "DELIVERED", amount: "₹45,000" },
    { id: "SHP-002", dest: "Frank Ross, Howrah", date: "2025-01-03", items: 50, status: "IN_TRANSIT", amount: "₹12,500" },
    { id: "SHP-003", dest: "Sanjeevani, Dhanbad", date: "2025-01-04", items: 200, status: "PENDING", amount: "₹80,000" },
    { id: "SHP-004", dest: "HealthKart, Siliguri", date: "2025-01-04", items: 75, status: "IN_TRANSIT", amount: "₹22,100" },
    { id: "SHP-005", dest: "MedPlus, Durgapur", date: "2025-01-01", items: 300, status: "DELIVERED", amount: "₹1,20,000" },
  ];

  // Pie Chart Data (CSS Conic Gradient)
  const pieSegments = [
    { label: "Delivered", value: 65, color: "#10B981" }, // Green
    { label: "In Transit", value: 25, color: "#F59E0B" }, // Orange
    { label: "Pending", value: 10, color: "#3B82F6" },   // Blue
  ];

  // Bar Chart Data
  const barData = [40, 70, 45, 90, 60, 85, 50]; // Weekly trend

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. KPI CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/10 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                 {kpi.icon}
               </div>
               <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-full">{kpi.change}</span>
            </div>
            <h3 className="text-3xl font-black text-[#0D1B3E] tracking-tighter">{kpi.value}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{kpi.title}</p>
          </div>
        ))}
      </div>

      {/* 2. ANALYTICS SECTION (CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Shipment Volume (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
           <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-lg font-black text-[#0D1B3E] uppercase tracking-tight">Shipment Volume</h3>
               <p className="text-xs text-gray-400 font-bold uppercase">Last 7 Days Activity</p>
             </div>
             <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-gray-200">View Report</button>
           </div>
           
           <div className="flex items-end justify-between h-48 gap-4 px-2">
             {barData.map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                 <div className="w-full bg-blue-50 rounded-t-xl relative h-full overflow-hidden">
                    <div 
                      style={{ height: `${h}%` }} 
                      className="absolute bottom-0 w-full bg-[#0D1B3E] rounded-t-xl transition-all duration-1000 group-hover:bg-blue-600"
                    ></div>
                 </div>
                 <span className="text-[9px] font-bold text-gray-400 uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Status Distribution (Pie Chart) */}
        <div className="lg:col-span-1 bg-[#0D1B3E] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
           
           <div className="relative z-10">
             <h3 className="text-lg font-black uppercase tracking-tight mb-6">Delivery Status</h3>
             
             <div className="flex items-center justify-center py-4">
                {/* CSS Conic Gradient Pie Chart */}
                <div className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl relative"
                     style={{
                       background: `conic-gradient(
                         ${pieSegments[0].color} 0% ${pieSegments[0].value}%, 
                         ${pieSegments[1].color} ${pieSegments[0].value}% ${pieSegments[0].value + pieSegments[1].value}%, 
                         ${pieSegments[2].color} ${pieSegments[0].value + pieSegments[1].value}% 100%
                       )`
                     }}>
                   <div className="w-28 h-28 bg-[#0D1B3E] rounded-full flex flex-col items-center justify-center z-10">
                      <span className="text-3xl font-black">100%</span>
                      <span className="text-[8px] uppercase tracking-widest text-gray-400">Tracking</span>
                   </div>
                </div>
             </div>

             <div className="space-y-3 mt-4">
               {pieSegments.map((seg, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                       <span className="text-xs font-bold text-gray-300">{seg.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{seg.value}%</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* 3. SHIPMENT LOGS TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-black text-[#0D1B3E] uppercase tracking-tight">Recent Dispatch Logs</h3>
              <p className="text-xs text-gray-400 font-bold uppercase">Real-time shipment tracking history</p>
            </div>
            
            <div className="flex gap-3">
               <input type="text" placeholder="Search Invoice ID..." className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-100" />
               <button className="bg-[#0D1B3E] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-800 transition-all">
                 + New Dispatch
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     <th className="py-4 pl-8">Shipment ID</th>
                     <th className="py-4">Destination</th>
                     <th className="py-4">Dispatch Date</th>
                     <th className="py-4">Items</th>
                     <th className="py-4">Amount</th>
                     <th className="py-4 pr-8 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {recentLogs.map((log) => (
                     <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                        <td className="py-5 pl-8 font-mono text-xs font-bold text-blue-600 group-hover:underline">{log.id}</td>
                        <td className="py-5">
                           <p className="text-xs font-bold text-[#0D1B3E]">{log.dest.split(',')[0]}</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase">{log.dest.split(',')[1]}</p>
                        </td>
                        <td className="py-5 text-xs font-medium text-gray-500">{log.date}</td>
                        <td className="py-5 text-xs font-bold text-gray-700">{log.items} Boxes</td>
                        <td className="py-5 text-xs font-bold text-gray-900">{log.amount}</td>
                        <td className="py-5 pr-8 text-right">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              log.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                              log.status === 'IN_TRANSIT' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-gray-100 text-gray-500 border-gray-200'
                           }`}>
                              {log.status.replace('_', ' ')}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         {/* Pagination Footer */}
         <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
            <button className="text-[10px] font-bold text-gray-400 uppercase hover:text-blue-600">View All History ↓</button>
         </div>
      </div>

    </div>
  );
}