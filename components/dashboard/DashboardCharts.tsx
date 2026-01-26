"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

// 1. SALES TREND (Area Chart)
export function SalesTrendChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Revenue Trend (Monthly)</h3>
      <div className="h-[320px] w-full"> {/* Height Fixed */}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 2. ✅ PRODUCTION VS SALES (NEW & BEST OPTION)
export function ProductionVsSalesChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full"> {/* Container Fix */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {/* Production Bar */}
          <Bar 
            name="Production" 
            dataKey="production" 
            fill="#8b5cf6" 
            radius={[4, 4, 0, 0]} 
            barSize={15}
          />
          {/* Sales Bar */}
          <Bar 
            name="Sales" 
            dataKey="sales" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            barSize={15}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. ✅ WEEKLY SALES (Fixed "day" vs "name" bug)
export function WeeklySalesChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full"> {/* Removed Outer Card Wrapper */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          
          {/* 🔴 FIX: আগে এখানে dataKey="day" ছিল, এখন "name" করা হয়েছে কারণ page.tsx এ name পাঠানো হচ্ছে */}
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
          
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
          <Tooltip 
            cursor={{fill: '#F3F4F6'}}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="sales" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. INVENTORY PIE
export function InventoryPieChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px] flex flex-col items-center justify-center">
      <h3 className="text-lg font-bold text-gray-800 mb-2 w-full text-left">📦 Stock Distribution</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 text-xs font-bold text-gray-500 mt-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. TOP PRODUCTS
export function TopProductsChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full"> {/* Removed fixed height wrapper */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            tick={{fontSize: 11, fontWeight: 'bold', fill: '#374151'}} 
          />
          <Tooltip 
             formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
             cursor={{fill: '#F3F4F6'}}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar 
            dataKey="value" 
            fill="#8B5CF6" 
            radius={[0, 6, 6, 0]} 
            barSize={24}
            background={{ fill: '#F9FAFB' }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
// ... (আগের কোড যেমন আছে তেমনই থাকবে, শুধু নিচে এটা যোগ করুন)

// 6. PRODUCTION TREND CHART (For Create Batch Page)
export function ProductionTrendChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px]">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🏭 Production Output (Last 7 Days)</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
            <Tooltip 
              cursor={{fill: '#FFF7ED'}}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="quantity" name="Strips Produced" fill="#F97316" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
// ... (আগের সব কোড যেমন আছে তেমনই থাকবে, শুধু ফাইলের শেষে নিচের অংশটুকু যোগ করুন)

// 7. SHIPMENT STATUS CHART (For Shipment Page)
export function ShipmentStatusChart({ data }: { data: any[] }) {
  const STATUS_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px] flex flex-col items-center justify-center">
      <h3 className="text-lg font-bold text-gray-800 mb-2 w-full text-left">🚚 Delivery Status</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold text-gray-500 mt-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}></span>
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    </div>
  );
}