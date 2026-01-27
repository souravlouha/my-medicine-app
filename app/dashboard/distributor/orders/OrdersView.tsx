"use client";

import { useState } from "react";
import { 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  ShoppingCart, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Truck, 
  XCircle, Package, User, Calendar, CreditCard, ChevronDown, ChevronUp, Box, FileText, 
  TrendingUp, PieChart as PieChartIcon, Phone, Mail, MapPin, AlertCircle
} from "lucide-react";
import { updateOrderStatusAction } from "@/lib/actions/distributor-actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Props Definition
interface Product {
  name: string;
  strength: string | null;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price?: number; 
}

interface Order {
  id: string;
  orderId: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  sender?: { name: string; email?: string; phone?: string; address?: string }; 
  receiver?: { name: string }; 
  items: OrderItem[];
}

interface Props {
  sentOrders: Order[];
  receivedOrders: Order[];
}

export default function OrdersView({ sentOrders, receivedOrders }: Props) {
  const [activeTab, setActiveTab] = useState<"INCOMING" | "OUTGOING">("INCOMING");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]); 

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  // --- STATISTICS CALCULATIONS ---
  const totalRevenue = receivedOrders.reduce((acc, o) => acc + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);
  
  // ✅ FIX: Variable name is now 'pendingOrders' to match usage below
  const pendingOrders = receivedOrders.filter(o => o.status === "PENDING").length;
  
  const pendingValue = receivedOrders.filter(o => o.status === "PENDING").reduce((acc, o) => acc + o.totalAmount, 0);
  
  const completionRate = receivedOrders.length > 0 
    ? ((receivedOrders.filter(o => o.status === "DELIVERED" || o.status === "SHIPPED").length / receivedOrders.length) * 100).toFixed(0) 
    : 0;

  // Chart Data
  const getChartData = (orders: Order[]) => {
    const counts = orders.reduce((acc: any, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).filter(item => item.value > 0);
  };

  const incomingPieData = getChartData(receivedOrders);
  const outgoingPieData = getChartData(sentOrders);
  const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444']; 

  // ✅ FIX: timeAgo function added inside component
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    return "Just now";
  };

  // --- REPORT GENERATION ---
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text("SUPPLY CHAIN ORDER REPORT", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 26);
    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);
    
    // Summary Table
    autoTable(doc, {
      startY: 45,
      head: [["Metric", "Value"]],
      body: [
        ["Total Incoming Orders", receivedOrders.length.toString()],
        ["Total Pending Orders", pendingOrders.toString()],
        ["Total Revenue", `Rs. ${totalRevenue.toLocaleString()}`],
        ["Outgoing Purchases", sentOrders.length.toString()]
      ],
      theme: 'plain',
      // ✅ FIX: Changed 'width' to 'cellWidth' to fix type error
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } } 
    });

    // Orders Table
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    const tableTitle = activeTab === "INCOMING" ? "Incoming Orders (From Retailers)" : "My Purchases (Outgoing)";
    doc.text(tableTitle, 14, finalY);

    // ✅ FIX: Handling undefined values for PDF table
    const rows = (activeTab === "INCOMING" ? receivedOrders : sentOrders).map(o => [
        o.orderId || "", 
        (o.sender?.name || o.receiver?.name || "N/A"), 
        o.status || "", 
        `Rs. ${o.totalAmount.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [["Order ID", "Party Name", "Status", "Amount"]],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    window.open(URL.createObjectURL(doc.output('blob')), '_blank');
  };

  // --- HELPER: Status Badge ---
  const getStatusBadge = (status: string) => {
    const styles: any = {
      PENDING: "bg-amber-100 text-amber-700 border-amber-200",
      APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
      SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
      DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
      CANCELLED: "bg-red-50 text-red-600 border-red-200"
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[status] || "bg-gray-100"}`}>{status}</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans text-slate-800">
      
      {/* --- 1. KPI HEADER --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Incoming Orders" value={receivedOrders.length} icon={<ArrowDownLeft/>} color="blue"/>
        {/* ✅ FIX: Using 'pendingOrders' variable correctly */}
        <KPICard title="Pending Action" value={pendingOrders} icon={<Clock/>} color="amber"/>
        <KPICard title="My Purchases" value={sentOrders.length} icon={<ShoppingCart/>} color="purple"/>
        <KPICard title="Total Sales" value={`₹${(totalRevenue/1000).toFixed(1)}k`} icon={<CreditCard/>} color="emerald"/>
      </div>

      {/* --- 2. MIDDLE SECTION (Restored Clean Style + Report Button) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <ChartCard title="Incoming Status" data={incomingPieData} emptyMessage="No incoming orders" color="#3B82F6"/>
         <ChartCard title="Purchases Status" data={outgoingPieData} emptyMessage="No purchases made" color="#8B5CF6"/>
         
         {/* Report Card */}
         <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden group h-full min-h-[250px]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition duration-700"></div>
            <div className="relative z-10 flex flex-col h-full justify-center">
               <div className="bg-white/10 p-3 rounded-xl w-fit mb-4 backdrop-blur-sm"><FileText size={24} className="text-white"/></div>
               <h2 className="text-xl font-bold mb-2">Detailed Report</h2>
               <p className="text-slate-300 text-xs mb-6 leading-relaxed">Download comprehensive audit reports.</p>
               <button onClick={handleDownloadReport} className="w-full bg-white text-slate-900 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 transition shadow-lg flex items-center justify-center gap-2">
                  Preview Report <ArrowUpRight size={14}/>
               </button>
            </div>
         </div>
      </div>

      {/* --- 3. TABS & DETAILED LIST --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
         <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button onClick={() => setActiveTab("INCOMING")} className={`flex-1 py-5 text-sm font-bold flex justify-center items-center gap-2 transition ${activeTab === "INCOMING" ? "bg-white text-blue-700 border-b-2 border-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
               Incoming Orders <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-1">{receivedOrders.length}</span>
            </button>
            <button onClick={() => setActiveTab("OUTGOING")} className={`flex-1 py-5 text-sm font-bold flex justify-center items-center gap-2 transition ${activeTab === "OUTGOING" ? "bg-white text-purple-700 border-b-2 border-purple-600 shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
               My Purchases <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full ml-1">{sentOrders.length}</span>
            </button>
         </div>

         <div className="p-8 space-y-6 bg-slate-50/30">
            {(activeTab === "INCOMING" ? receivedOrders : sentOrders).map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
                    
                    {/* --- CARD HEADER --- */}
                    <div className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-start gap-4 w-full lg:w-auto">
                            <div className={`p-4 rounded-2xl hidden sm:block ${activeTab === 'INCOMING' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                <Package size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h4 className="text-lg font-bold text-slate-800">#{order.orderId}</h4>
                                    {getStatusBadge(order.status)}
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${order.status === 'PENDING' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                        {order.status === 'PENDING' ? 'UNPAID' : 'PAID'}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1 text-slate-700 font-bold">
                                        <User size={12} className="text-slate-400"/> 
                                        {activeTab === "INCOMING" ? order.sender?.name : order.receiver?.name}
                                    </span>
                                    <span className="hidden sm:inline text-slate-300">|</span>
                                    {/* ✅ FIX: timeAgo usage */}
                                    <span className="flex items-center gap-1" title={new Date(order.createdAt).toDateString()}>
                                        <Calendar size={12}/> {timeAgo(order.createdAt)}
                                    </span>
                                    <span className="hidden sm:inline text-slate-300">|</span>
                                    <span className="flex items-center gap-1">
                                        <Box size={12}/> {order.items.length} Products
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Grand Total</p>
                                <p className="text-xl font-black text-slate-800">₹{order.totalAmount.toLocaleString()}</p>
                            </div>
                            <button onClick={() => toggleExpand(order.id)} className={`p-2.5 rounded-xl border transition ${expandedOrders.includes(order.id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                {expandedOrders.includes(order.id) ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                            </button>
                        </div>
                    </div>

                    {/* --- EXPANDED DETAILS --- */}
                    {expandedOrders.includes(order.id) && (
                        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300 border-t border-slate-100 bg-slate-50/50 pt-6">
                            
                            {/* 1. Progress Tracker */}
                            <div className="mb-8 px-4">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                    <span className="text-blue-600">Order Placed</span>
                                    <span className={order.status !== 'PENDING' && order.status !== 'CANCELLED' ? "text-blue-600" : ""}>Confirmed</span>
                                    <span className={order.status === 'SHIPPED' || order.status === 'DELIVERED' ? "text-emerald-600" : ""}>Shipped & Delivered</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${order.status === 'CANCELLED' ? 'bg-red-500 w-full' : (order.status === 'SHIPPED' || order.status === 'DELIVERED') ? 'bg-emerald-500 w-full' : 'bg-blue-500'}`}
                                        style={{ width: order.status === 'PENDING' ? '33%' : order.status === 'APPROVED' ? '66%' : '100%' }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* 2. Items Table */}
                                <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                            <tr><th className="px-6 py-3">Medicine</th><th className="px-6 py-3">Strength</th><th className="px-6 py-3 text-center">Qty</th><th className="px-6 py-3 text-right">Price</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {order.items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition">
                                                    <td className="px-6 py-3 font-bold text-slate-700">{item.product.name}</td>
                                                    <td className="px-6 py-3 text-slate-500">{item.product.strength || "N/A"}</td>
                                                    <td className="px-6 py-3 text-center font-mono font-bold text-slate-600">{item.quantity}</td>
                                                    <td className="px-6 py-3 text-right font-medium text-slate-600">₹{item.price || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 3. Info & Actions Sidebar */}
                                <div className="w-full lg:w-80 space-y-4">
                                    
                                    {/* Contact Info (Icons Fixed) */}
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">Contact Details</h5>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="p-2 bg-slate-50 rounded-lg text-blue-500"><User size={16}/></div>
                                                <span className="font-bold">{activeTab === "INCOMING" ? order.sender?.name : order.receiver?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="p-2 bg-slate-50 rounded-lg text-emerald-500"><Phone size={16}/></div>
                                                <span>{order.sender?.phone || "+91 98765 43210"}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="p-2 bg-slate-50 rounded-lg text-purple-500"><Mail size={16}/></div>
                                                <span className="truncate">{order.sender?.email || "contact@medtrace.com"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Billing Summary */}
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">Billing Summary</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-slate-500">
                                                <span>Subtotal</span>
                                                <span>₹{(order.totalAmount * 0.82).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>Tax (GST 18%)</span>
                                                <span>₹{(order.totalAmount * 0.18).toFixed(2)}</span>
                                            </div>
                                            <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-800 text-base">
                                                <span>Grand Total</span>
                                                <span>₹{order.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {activeTab === "INCOMING" && order.status === "PENDING" && (
                                        <div className="flex gap-2">
                                            <form action={updateOrderStatusAction} className="flex-1"><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="newStatus" value="CANCELLED" /><button className="w-full py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition">Reject</button></form>
                                            <form action={updateOrderStatusAction} className="flex-1"><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="newStatus" value="APPROVED" /><button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-slate-200">Approve</button></form>
                                        </div>
                                    )}
                                    {activeTab === "INCOMING" && order.status === "APPROVED" && (
                                        <form action={updateOrderStatusAction}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="newStatus" value="SHIPPED" /><button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-purple-200 flex items-center justify-center gap-2"><Truck size={16}/> Dispatch & Complete</button></form>
                                    )}
                                    
                                    {/* Shipped Status (No Button) */}
                                    {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                                        <div className="w-full py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                                            <CheckCircle size={16}/> Order Completed Successfully
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            
            {receivedOrders.length === 0 && activeTab === "INCOMING" && <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">No incoming orders found.</div>}
            {sentOrders.length === 0 && activeTab === "OUTGOING" && <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">No purchase history found.</div>}
         </div>
      </div>
    </div>
  );
}

// ✅ FIX: Sub-Components with Icons Imported
function KPICard({ title, value, icon, color }: any) {
    const colors: any = { blue: "text-blue-600 bg-blue-50", amber: "text-amber-600 bg-amber-50", purple: "text-purple-600 bg-purple-50", emerald: "text-emerald-600 bg-emerald-50" };
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
            </div>
        </div>
    );
}

function ChartCard({ title, data, emptyMessage, color }: any) {
    const COLORS = [color, '#F59E0B', '#10B981', '#EF4444'];
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[250px]">
            <h3 className="text-sm font-bold text-slate-700 w-full mb-4 border-b border-slate-100 pb-2">{title}</h3>
            <div className="h-[180px] w-full flex items-center justify-center">
               {data.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                          {data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                       </Pie>
                       <RechartsTooltip />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-100 mx-auto mb-2 flex items-center justify-center bg-slate-50">
                        <PieChartIcon size={20} className="opacity-20"/>
                    </div>
                    <p className="text-xs font-medium">{emptyMessage}</p>
                 </div>
               )}
            </div>
        </div>
    );
}