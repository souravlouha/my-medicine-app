import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import CreateBatchForm from "./CreateBatchForm";
import { ProductionTrendChart } from "@/components/dashboard/DashboardCharts";
import { History, BarChart3, PackageCheck } from "lucide-react";

export default async function CreateBatchPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  // 1. EXISTING DATA FETCHING
  // প্রোডাক্ট লিস্ট আনা হচ্ছে যাতে ফর্মের ড্রপডাউনে দেখানো যায়
  const products = await prisma.product.findMany({
    where: { manufacturerId: userId }
  });

  // 2. ANALYTICS DATA
  const last7DaysBatches = await prisma.batch.findMany({
    where: { 
      manufacturerId: userId,
      createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } 
    },
    orderBy: { createdAt: 'asc' }
  });

  const productionChartData = last7DaysBatches.reduce((acc: any[], curr) => {
    const date = new Date(curr.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    const existing = acc.find(item => item.date === date);
    if (existing) existing.quantity += curr.totalQuantity;
    else acc.push({ date: date, quantity: curr.totalQuantity });
    return acc;
  }, []);

  const recentBatches = await prisma.batch.findMany({
    where: { manufacturerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { product: true }
  });

  const thisMonthTotal = await prisma.batch.aggregate({
    where: {
      manufacturerId: userId,
      createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    },
    _sum: { totalQuantity: true }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 space-y-8 pb-20">
      
      {/* PRODUCTION FORM SECTION */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🏭 Advanced Production Line</h1>
            <p className="text-blue-100 text-sm">Auto-ID, Hierarchy & QR Generation</p>
          </div>
        </div>
        
        <div className="p-8">
           <CreateBatchForm products={products} />
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="max-w-4xl w-full">
         <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="text-orange-500"/> Production Analytics
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 h-full">
              <ProductionTrendChart data={productionChartData} />
           </div>

           <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">This Month Output</p>
                     <h3 className="text-3xl font-black text-gray-800 mt-1">
                        {(thisMonthTotal._sum.totalQuantity || 0).toLocaleString()} 
                        <span className="text-sm font-medium text-gray-500 ml-1">Strips</span>
                     </h3>
                  </div>
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
                     <PackageCheck size={28} />
                  </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                     <History size={16} className="text-gray-500" />
                     <h3 className="font-bold text-gray-700 text-sm">Recently Created Batches</h3>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto">
                     {recentBatches.map((batch) => (
                        <div key={batch.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                           <div>
                              <p className="text-sm font-bold text-gray-800">{batch.product.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">{batch.batchNumber}</p>
                           </div>
                           <div className="text-right">
                              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200">
                                 {batch.totalQuantity} Qty
                              </span>
                              <p className="text-[10px] text-gray-400 mt-1">{new Date(batch.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                     ))}
                     {recentBatches.length === 0 && <p className="p-6 text-center text-xs text-gray-400">No production history found.</p>}
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}