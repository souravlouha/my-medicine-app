"use client";

import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Truck, DollarSign, PackageOpen } from "lucide-react";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function IncomingAnalytics({ shipments }: { shipments: any[] }) {
  
  // 1. Calculate KPI Metrics
  const totalValue = shipments.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalItems = shipments.reduce((sum, s) => sum + s.items.length, 0);

  // 2. Prepare Data for Donut Chart (Value by Manufacturer)
  const supplierDataMap: Record<string, number> = {};
  shipments.forEach(s => {
    const name = s.sender.name;
    supplierDataMap[name] = (supplierDataMap[name] || 0) + s.totalAmount;
  });
  
  const pieData = Object.entries(supplierDataMap).map(([name, value]) => ({ name, value }));

  // 3. Prepare Data for Bar Chart (Product Type Count)
  const typeDataMap: Record<string, number> = {};
  shipments.forEach(s => {
    s.items.forEach((item: any) => {
      const type = item.batch.product.type; // e.g., TABLET
      typeDataMap[type] = (typeDataMap[type] || 0) + item.quantity;
    });
  });

  const barData = Object.entries(typeDataMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      
      {/* --- KPI COLUMN (Left) --- */}
      <div className="space-y-6 lg:col-span-1">
        {/* Total Value Card */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 p-4">
             <DollarSign size={60} className="text-blue-600"/>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total In-Transit Value</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">₹{(totalValue/1000).toFixed(1)}k</h3>
          <p className="text-[10px] text-gray-500 mt-2 font-bold flex items-center gap-1">
             <Truck size={12}/> Across {shipments.length} Shipments
          </p>
        </div>

        {/* Total Stock Incoming */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 p-4">
             <PackageOpen size={60} className="text-purple-600"/>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Incoming Units</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{totalItems} <span className="text-sm text-gray-400">Batches</span></h3>
          <p className="text-[10px] text-gray-500 mt-2 font-bold">Needs Warehouse Space</p>
        </div>
      </div>

      {/* --- CHARTS (Middle & Right) --- */}
      
      {/* Donut Chart: Supplier Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1 flex flex-col items-center justify-center">
         <h4 className="text-xs font-bold text-gray-400 uppercase w-full text-left mb-2">Top Suppliers</h4>
         <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={pieData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                     {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                  </Pie>
                  <Tooltip 
                     formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
               </PieChart>
            </ResponsiveContainer>
         </div>
         <div className="flex flex-wrap justify-center gap-2 mt-2">
            {pieData.map((entry, index) => (
               <div key={index} className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}
               </div>
            ))}
         </div>
      </div>

      {/* Bar Chart: Medicine Types */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
         <h4 className="text-xs font-bold text-gray-400 uppercase w-full text-left mb-4">Incoming Product Mix</h4>
         <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0"/>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10, fontWeight: 'bold', fill:'#6b7280'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}/>
                  <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
}