import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import { 
  Package, TrendingUp, Activity, ShoppingBag, 
  IndianRupee, AlertTriangle, Wallet, Trophy, Star, Plus, ShoppingCart, ArrowRight 
} from "lucide-react";
import { WeeklySalesChart } from "@/components/dashboard/DashboardCharts"; 
import Link from "next/link";

export const dynamic = "force-dynamic";

// Helper Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', currency: 'INR', maximumFractionDigits: 0 
  }).format(amount);
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

export default async function RetailerDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  // ✅ DATA FETCHING
  const [user, inventory, salesRecords, recentOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    
    // Inventory
    prisma.inventory.findMany({ 
        where: { userId }, 
        include: { batch: { include: { product: true } } } 
    }),

    // ✅ SALES RECORDS
    prisma.salesRecord.findMany({
        where: { sellerId: userId },
        orderBy: { date: 'desc' },
        include: { batch: { include: { product: true } } }
    }),

    // Recent Purchases
    prisma.order.findMany({
        where: { senderId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    })
  ]);

  if (!user) return <div>User not found</div>;

  // --- 🧮 CALCULATIONS ---

  // 1. Revenue & Profit
  const totalRevenue = salesRecords.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const estimatedProfit = totalRevenue * 0.20; 

  // 2. Inventory Value
  const totalItems = inventory.reduce((acc, item) => acc + item.currentStock, 0);
  const inventoryValue = inventory.reduce((acc, item) => acc + (item.currentStock * item.batch.mrp), 0);

  // 3. Weekly Sales Chart Data
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7DaysMap = new Map();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = days[d.getDay()];
    last7DaysMap.set(dayName, { name: dayName, sales: 0 });
  }

  salesRecords.forEach(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - saleDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays <= 7) {
        const dayName = days[saleDate.getDay()];
        if (last7DaysMap.has(dayName)) {
            const entry = last7DaysMap.get(dayName);
            entry.sales += sale.totalPrice;
            last7DaysMap.set(dayName, entry);
        }
    }
  });
  const weeklyChartData = Array.from(last7DaysMap.values());

  // 4. 🔥 TOP PRODUCTS CALCULATION
  const productStats = new Map();

  salesRecords.forEach(sale => {
      const productName = sale.batch?.product?.name || sale.manualItemName || "Manual Item";
      const current = productStats.get(productName) || { quantity: 0, revenue: 0 };
      productStats.set(productName, {
          name: productName,
          quantity: current.quantity + sale.quantity,
          revenue: current.revenue + sale.totalPrice
      });
  });

  const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

  const maxQty = topProducts.length > 0 ? topProducts[0].quantity : 1;

  // 5. Activity Log (With Manual Check)
  const activities = [
    ...salesRecords.slice(0, 5).map(s => ({
        type: "SALE",
        title: `Sold ${s.quantity}x ${s.batch?.product?.name || s.manualItemName || "Manual Sale"}`,
        date: s.date,
        amount: s.totalPrice
    })),
    ...recentOrders.map(o => ({
        type: "ORDER",
        title: `Ordered Stock`,
        date: o.createdAt,
        amount: o.totalAmount
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // 🚨 6. LOW STOCK ALERT (New Feature)
  const lowStockItems = inventory
    .filter(item => item.currentStock < 20) // Threshold: less than 20
    .slice(0, 3); // Top 3 critical items

  return (
    <div className="min-h-screen bg-slate-50/80 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header & Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getGreeting()}, {user.name} 👋</h1>
                <p className="text-slate-500 font-medium">Here's what's happening in your store today.</p>
            </div>
            <div className="flex gap-3">
                <Link href="/dashboard/retailer/pos" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95">
                    <Plus size={18}/> New Sale
                </Link>
                <Link href="/dashboard/retailer/shop" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition active:scale-95">
                    <ShoppingCart size={18}/> Restock
                </Link>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Revenue */}
            <div className="bg-blue-600 text-white p-6 rounded-[24px] shadow-lg shadow-blue-200 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-black">{formatCurrency(totalRevenue)}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                        <TrendingUp size={14}/> +From Sales
                    </div>
                </div>
                <IndianRupee className="absolute right-4 bottom-4 text-blue-500/50" size={64}/>
            </div>

            {/* Profit */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm group hover:-translate-y-1 transition">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Wallet size={24}/></div>
                    <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">~20% Margin</span>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Net Profit</p>
                <h3 className="text-2xl font-black text-slate-800">{formatCurrency(estimatedProfit)}</h3>
            </div>

            {/* Inventory Value */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm group hover:-translate-y-1 transition">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Activity size={24}/></div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Inventory Value</p>
                <h3 className="text-2xl font-black text-slate-800">{formatCurrency(inventoryValue)}</h3>
            </div>

            {/* Stock Count */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm group hover:-translate-y-1 transition">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Package size={24}/></div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Stock In Hand</p>
                <h3 className="text-2xl font-black text-slate-800">{totalItems} <span className="text-sm text-slate-400 font-bold">Units</span></h3>
            </div>
        </div>

        {/* 🚨 Low Stock Alert Section (New) */}
        {lowStockItems.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white text-orange-500 rounded-2xl shadow-sm"><AlertTriangle size={24}/></div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Low Stock Alert</h3>
                        <p className="text-slate-500 text-sm">Some items are running low. Restock them soon.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {lowStockItems.map((item, i) => (
                        <div key={i} className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-slate-700 border border-orange-100 shadow-sm">
                            {item.batch.product.name} <span className="text-orange-500">({item.currentStock} left)</span>
                        </div>
                    ))}
                    {inventory.filter(i => i.currentStock < 20).length > 3 && (
                        <div className="px-3 py-2 bg-white rounded-xl text-xs font-bold text-slate-500 border border-orange-100 shadow-sm">
                            +{inventory.filter(i => i.currentStock < 20).length - 3} more
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* 📊 Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Sales Chart (Span 2) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Sales Trend</h3>
                <div className="h-[300px] w-full">
                    <WeeklySalesChart data={weeklyChartData} />
                </div>
            </div>

            {/* RIGHT COLUMN: Top Products & Recent Activity (Span 1) */}
            <div className="flex flex-col gap-6">
                
                {/* 🔥 Top Products Segment */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Trophy size={20} className="text-amber-500 fill-amber-500"/> Top Selling
                    </h3>
                    <div className="space-y-4">
                        {topProducts.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-4">No sales data yet.</p>
                        ) : (
                            topProducts.map((item: any, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-bold text-slate-700 flex items-center gap-2">
                                            {i === 0 && <Star size={12} className="text-amber-400 fill-amber-400"/>}
                                            {item.name}
                                        </span>
                                        <span className="text-slate-500 font-mono text-xs">{item.quantity} sold</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${(item.quantity / maxQty) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Activity size={20} className="text-blue-500"/> Activity
                        </h3>
                        <Link href="/dashboard/retailer/sales" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight size={12}/>
                        </Link>
                    </div>
                    <div className="space-y-5">
                        {activities.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm mt-4">No recent activity.</p>
                        ) : (
                            activities.map((act, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${act.type === 'SALE' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">
                                            {new Date(act.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs font-bold text-slate-800 leading-tight">{act.title}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatCurrency(act.amount)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

        </div>

      </div>
    </div>
  );
}