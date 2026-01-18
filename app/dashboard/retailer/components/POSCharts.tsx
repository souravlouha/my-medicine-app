"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

export default function POSCharts({ salesData }: { salesData: any[] }) {
  
  // ১. গত ৭ দিনের সেলস ডাটা প্রসেসিং
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const salesForDay = salesData.filter(s => s.date.toISOString().startsWith(date));
    const totalRevenue = salesForDay.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const estimatedProfit = totalRevenue * 0.20; // ধরে নিচ্ছি ২০% প্রফিট মার্জিন

    return {
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      sales: totalRevenue,
      profit: estimatedProfit
    };
  });

  return (
    <div className="space-y-6">
      
      {/* 📊 Weekly Revenue Chart */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Weekly Revenue Trend</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              {/* ✅ FIX: value: any ব্যবহার করা হয়েছে টাইপ এরর এড়াতে */}
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [`₹${value}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📊 Estimated Profit Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Est. Weekly Profit</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              {/* ✅ FIX: value: any ব্যবহার করা হয়েছে এবং Number() দিয়ে সেফ করা হয়েছে */}
              <Tooltip 
                cursor={{fill: '#f0fdf4'}}
                contentStyle={{ borderRadius: '8px', border: 'none' }}
                formatter={(value: any) => [`₹${Number(value).toFixed(0)}`, 'Profit']}
              />
              <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}