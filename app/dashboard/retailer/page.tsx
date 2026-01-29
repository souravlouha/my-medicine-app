import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import { 
  Package, TrendingUp, Activity, ShoppingBag, 
  IndianRupee, Calendar, AlertTriangle, Wallet 
} from "lucide-react";
import { WeeklySalesChart } from "@/components/dashboard/DashboardCharts"; 

export const dynamic = "force-dynamic";

// Helper Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', currency: 'INR', maximumFractionDigits: 0 
  }).format(amount);
};

export default async function RetailerDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  // ✅ DATA FETCHING: SalesRecord যোগ করা হলো
  const [user, inventory, salesRecords, recentOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    
    // Inventory
    prisma.inventory.findMany({ 
        where: { userId }, 
        include: { batch: { include: { product: true } } } 
    }),

    // ✅ SALES RECORDS (Real Sales Data from POS)
    prisma.salesRecord.findMany({
        where: { sellerId: userId },
        orderBy: { date: 'desc' },
        include: { batch: { include: { product: true } } }
    }),

    // Recent Purchases (Orders I placed)
    prisma.order.findMany({
        where: { senderId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    })
  ]);

  if (!user) return <div>User not found</div>;

  // --- 🧮 CALCULATIONS ---

  // 1. Revenue & Profit (From SalesRecord)
  const totalRevenue = salesRecords.reduce((sum, sale) => sum + sale.totalPrice, 0);
  
  // Profit Calculation (Approximate logic: Sales Price - Cost Price)
  // যেহেতু আমাদের কাছে প্রতিটি সেলের সঠিক কস্ট প্রাইস এই মুহূর্তে নেই, 
  // আমরা আনুমানিক ২০% মার্জিন ধরছি অথবা শুধু রেভেনিউ দেখাচ্ছি।
  // ভবিষ্যতে Inventory মডেলে 'buyingPrice' থাকলে সঠিক প্রফিট বের করা যাবে।
  const estimatedProfit = totalRevenue * 0.20; // 20% Profit Margin Assumption

  // 2. Inventory Value
  const totalItems = inventory.reduce((acc, item) => acc + item.currentStock, 0);
  const inventoryValue = inventory.reduce((acc, item) => acc + (item.currentStock * item.batch.mrp), 0);

  // 3. Weekly Sales Chart Data
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7DaysMap = new Map();
  
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = days[d.getDay()];
    last7DaysMap.set(dayName, { name: dayName, sales: 0 });
  }

  // Fill actual sales data
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

  // 4. Activity Log (Combine Sales & Orders)
  const activities = [
    ...salesRecords.slice(0, 5).map(s => ({
        type: "SALE",
        title: `Sold ${s.quantity}x ${s.batch.product.name}`,
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


  return (
    <div className="min-h-screen bg-slate-50/80 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Retail Dashboard</h1>
                <p className="text-slate-500 font-medium">Welcome back, <span className="text-blue-600">{user.name}</span></p>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-xs font-bold text-slate-500">
                {new Date().toDateString()}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Revenue */}
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

            {/* Net Profit (Est) */}
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
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Inventory Value (MRP)</p>
                <h3 className="text-2xl font-black text-slate-800">{formatCurrency(inventoryValue)}</h3>
            </div>

            {/* Total Items */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm group hover:-translate-y-1 transition">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Package size={24}/></div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Stock In Hand</p>
                <h3 className="text-2xl font-black text-slate-800">{totalItems} <span className="text-sm text-slate-400 font-bold">Units</span></h3>
            </div>
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Sales Trend</h3>
                <div className="h-[300px] w-full">
                    <WeeklySalesChart data={weeklyChartData} />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-blue-500"/> Recent Activity
                </h3>
                <div className="flex-1 space-y-6">
                    {activities.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm mt-10">No recent activity.</p>
                    ) : (
                        activities.map((act, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className={`mt-1 h-2 w-2 rounded-full ${act.type === 'SALE' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">
                                        {new Date(act.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{act.title}</p>
                                    <p className="text-xs text-slate-500 font-mono mt-1">{formatCurrency(act.amount)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}