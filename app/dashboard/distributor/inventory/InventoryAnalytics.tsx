"use client";

import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Package, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function InventoryAnalytics({ inventory }: { inventory: any[] }) {
  
  // 1. KPI Calculations
  const totalValue = inventory.reduce((acc, item) => acc + (item.currentStock * item.batch.mrp), 0);
  const lowStockCount = inventory.filter(item => item.currentStock < 50).length;

  // 2. Data for Donut Chart (Stock by Type)
  const typeMap: Record<string, number> = {};
  inventory.forEach(item => {
    const type = item.batch.product.type;
    typeMap[type] = (typeMap[type] || 0) + item.currentStock;
  });
  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // 3. Data for Expiry Risk (Bar Chart)
  let safe = 0, warning = 0, critical = 0;
  const now = new Date();
  
  inventory.forEach(item => {
    const expDate = new Date(item.batch.expDate);
    const monthsLeft = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsLeft > 6) safe += item.currentStock;
    else if (monthsLeft > 3) warning += item.currentStock;
    else critical += item.currentStock;
  });

  const expiryData = [
    { name: 'Safe (>6m)', value: safe, fill: '#10B981' }, // Green
    { name: 'Warning (3-6m)', value: warning, fill: '#F59E0B' }, // Orange
    { name: 'Critical (<3m)', value: critical, fill: '#EF4444' }, // Red
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      
      {/* --- KPI COLUMN (Left) --- */}
      <div className="space-y-6 lg:col-span-1">
         
         {/* Total Value */}
         <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 p-4">
               <DollarSign size={60} className="text-blue-600"/>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Inventory Value</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">₹{(totalValue/1000).toFixed(1)}k</h3>
            <p className="text-[10px] text-gray-500 mt-2 font-bold">Real-time valuation</p>
         </div>

         {/* Health Stats */}
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
               <ShieldCheck className="mx-auto text-green-600 mb-2" size={20}/>
               <h4 className="text-xl font-black text-green-700">{inventory.length}</h4>
               <p className="text-[10px] font-bold text-green-600 uppercase">Active Batches</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
               <AlertTriangle className="mx-auto text-red-500 mb-2" size={20}/>
               <h4 className="text-xl font-black text-red-600">{lowStockCount}</h4>
               <p className="text-[10px] font-bold text-red-500 uppercase">Low Stock Alerts</p>
            </div>
         </div>
      </div>

      {/* --- CHARTS (Middle & Right) --- */}

      {/* 1. Stock Composition (Donut) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1 flex flex-col items-center">
         <h4 className="text-xs font-bold text-gray-400 uppercase w-full text-left mb-2">Stock Composition</h4>
         <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={pieData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                     {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                  </Pie>
                  {/* ✅ FIX: value: any ব্যবহার করা হয়েছে টাইপ এরর এড়ানোর জন্য */}
                  <Tooltip 
                     formatter={(value: any) => [`${value} Units`, 'Stock']}
                     contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  />
               </PieChart>
            </ResponsiveContainer>
         </div>
         <div className="flex flex-wrap justify-center gap-2 mt-2">
            {pieData.slice(0, 3).map((entry, index) => (
               <div key={index} className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}
               </div>
            ))}
         </div>
      </div>

      {/* 2. Expiry Risk Analysis (Bar) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
         <h4 className="text-xs font-bold text-gray-400 uppercase w-full text-left mb-4">Expiry Risk Analysis</h4>
         <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={expiryData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0"/>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fontWeight: 'bold', fill:'#6b7280'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}/>
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {expiryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
         <p className="text-[10px] text-gray-400 text-center mt-2">Volume of stock segmented by remaining shelf life.</p>
      </div>

    </div>
  );
}