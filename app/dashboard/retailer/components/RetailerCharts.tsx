"use client";

import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function RetailerCharts({ inventory }: { inventory: any[] }) {
  
  // ১. ডাটা প্রসেসিং: ক্যাটাগরি অনুযায়ী স্টক (Pie Chart)
  const stockByType: Record<string, number> = {};
  inventory.forEach(item => {
    const type = item.batch.product.type;
    stockByType[type] = (stockByType[type] || 0) + item.currentStock;
  });
  const pieData = Object.entries(stockByType).map(([name, value]) => ({ name, value }));

  // ২. ডাটা প্রসেসিং: টপ ৫ ভ্যালুয়েবল প্রোডাক্ট (Bar Chart)
  const valueData = inventory
    .map(item => ({
      name: item.batch.product.name.substring(0, 10) + "..", // নাম ছোট করা
      value: item.currentStock * item.batch.mrp,
      stock: item.currentStock
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // সেরা ৫টি

  // ৩. ডাটা প্রসেসিং: স্টক হেলথ (Donut Chart)
  const lowStockCount = inventory.filter(i => i.currentStock < 20).length;
  const healthyStockCount = inventory.filter(i => i.currentStock >= 20).length;
  const healthData = [
    { name: 'Healthy Stock', value: healthyStockCount },
    { name: 'Low Stock', value: lowStockCount },
  ];
  const HEALTH_COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* 📊 Chart 1: Stock Composition (Pie) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
         <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 w-full text-left">Medicine Types</h3>
         <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                     {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: "10px" }}/>
               </PieChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 📊 Chart 2: Top Value Inventory (Bar) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
         <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Highest Value Stock</h3>
         <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={valueData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total Value']} />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 📊 Chart 3: Stock Health (Donut) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
         <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 w-full text-left">Stock Health</h3>
         <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={healthData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" startAngle={180} endAngle={0}>
                     {healthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={HEALTH_COLORS[index % HEALTH_COLORS.length]} />
                     ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
               </PieChart>
            </ResponsiveContainer>
         </div>
         <div className="text-center -mt-10">
            <p className="text-2xl font-black text-gray-800">{inventory.length}</p>
            <p className="text-xs text-gray-400">Total Batches</p>
         </div>
      </div>

    </div>
  );
}