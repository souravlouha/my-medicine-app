"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function RetailerCharts({ salesData, inventoryData }: { salesData: any[], inventoryData: any[] }) {
  
  // ১. বার চার্টের ডেটা তৈরি (Last 7 Days Sales)
  const salesChartData = salesData.map(item => ({
    name: new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    amount: item.totalPrice
  })).slice(0, 7); // শুধু শেষ ৭টা দেখাবে

  // ২. পাই চার্টের ডেটা তৈরি (Category Distribution)
  // প্রোডাক্ট টাইপ অনুযায়ী গ্রুপিং (Tablet, Syrup etc.)
  const categoryCount: any = {};
  inventoryData.forEach(item => {
    const type = item.batch.product.type || "Others";
    categoryCount[type] = (categoryCount[type] || 0) + item.currentStock;
  });

  const pieChartData = Object.keys(categoryCount).map(key => ({
    name: key,
    value: categoryCount[key]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 📊 Sales Trend Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Sales Trend</h3>
        <div className="h-[300px] w-full">
          {salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">No Sales Data Available</div>
          )}
        </div>
      </div>

      {/* 🥧 Inventory Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Inventory by Category</h3>
        <div className="h-[300px] w-full">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-slate-400">No Inventory Data</div>
          )}
        </div>
      </div>

    </div>
  );
}