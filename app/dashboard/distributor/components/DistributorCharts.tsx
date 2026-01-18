"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';

// 📊 8. INVENTORY VALUE BY TYPE (Pie Chart)
export function InventoryValueChart({ data }: { data: any[] }) {
  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px] flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-2">💰 Inventory Value Distribution</h3>
      <div className="flex-1 min-h-0">
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
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold text-gray-500 mt-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// 📊 9. ORDER STATUS OVERVIEW (Bar Chart)
export function OrderStatusChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px]">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Order Status Overview</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} allowDecimals={false} />
          <Tooltip 
            cursor={{fill: '#F3F4F6'}}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}