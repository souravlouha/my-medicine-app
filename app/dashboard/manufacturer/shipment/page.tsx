import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DispatchClient from "./DispatchClient"; 
// 👇 নতুন ইম্পোর্ট
import { ShipmentStatusChart } from "@/components/dashboard/DashboardCharts";
import { Truck, FileText, TrendingUp, Clock } from "lucide-react";

export default async function ShipmentPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  // ১. ডাটাবেস থেকে সব তথ্য আনা (ফর্মের জন্য)
  const [user, distributors, inventory] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, address: true, licenseNo: true, phone: true } 
    }),
    prisma.user.findMany({
      where: { role: "DISTRIBUTOR" },
      select: { id: true, name: true, address: true, licenseNo: true }
    }),
    prisma.inventory.findMany({
      where: { userId: userId, currentStock: { gt: 0 } }, 
      include: { batch: { include: { product: true } } }
    })
  ]);

  // ২. নতুন এনালিটিক্স ডাটা (New Analytics Data) ✅
  const shipmentStats = await prisma.shipment.groupBy({
    by: ['status'],
    where: { manufacturerId: userId },
    _count: { status: true }
  });

  const recentShipments = await prisma.shipment.findMany({
    where: { manufacturerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { receiver: true }
  });

  const totalDispatchValue = await prisma.shipment.aggregate({
    where: { 
      manufacturerId: userId,
      createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } // This Month
    },
    _sum: { totalAmount: true }
  });

  // ৩. চার্ট ডাটা প্রসেসিং
  const statusChartData = shipmentStats.map(stat => ({
    name: stat.status.replace("_", " "),
    value: stat._count.status
  }));

  // ৪. ফর্মের জন্য ডাটা ফরম্যাট
  const formattedBatches = inventory.map((item) => ({
    id: item.batch.id,
    medicineName: item.batch.product.name,
    currentStock: item.currentStock,
    expDate: item.batch.expDate,
    price: item.batch.mrp, 
  }));

  const manufacturerInfo = {
    name: user?.name,
    location: user?.address,
    licenseNo: user?.licenseNo,
    gstNo: "GST-PENDING" 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 pb-20">
      
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">🚚 Dispatch & Logistics</h1>
           <p className="text-gray-500">Create shipments, generate invoices, and track logistics.</p>
        </div>
      </div>

      {/* 🟢 EXISTING DISPATCH FORM (UNCHANGED) */}
      <DispatchClient 
        distributors={distributors} 
        batches={formattedBatches} 
        manufacturer={manufacturerInfo} 
      />

      {/* 🟠 NEW LOGISTICS ANALYTICS SECTION */}
      <div className="border-t border-gray-200 pt-10">
         <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600"/> Logistics Overview
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Status Chart */}
            <div className="md:col-span-1">
               <ShipmentStatusChart data={statusChartData.length > 0 ? statusChartData : [{name: 'No Data', value: 1}]} />
            </div>

            {/* 2. Stats & History */}
            <div className="md:col-span-2 space-y-6">
               
               {/* Value Card */}
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dispatched Value (This Month)</p>
                      <h3 className="text-3xl font-black text-gray-800 mt-1">
                         ₹{(totalDispatchValue._sum.totalAmount || 0).toLocaleString()}
                      </h3>
                   </div>
                   <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                      <Truck size={28} />
                   </div>
               </div>

               {/* Recent Shipment History List */}
               <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                   <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <h3 className="font-bold text-gray-700 text-sm">Recent Shipments</h3>
                   </div>
                   <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto">
                      {recentShipments.map((ship) => (
                         <div key={ship.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                            <div className="flex items-center gap-3">
                               <div className="bg-blue-100 p-2 rounded text-blue-600">
                                  <FileText size={16} />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-gray-800">{ship.receiver.name}</p>
                                  <p className="text-[10px] text-gray-500 font-mono">ID: {ship.shipmentId}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${ship.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {ship.status.replace("_", " ")}
                               </span>
                               <p className="text-[10px] text-gray-400 mt-1 font-bold">₹{ship.totalAmount.toLocaleString()}</p>
                            </div>
                         </div>
                      ))}
                      {recentShipments.length === 0 && <p className="p-6 text-center text-xs text-gray-400">No shipments found.</p>}
                   </div>
               </div>

            </div>
         </div>
      </div>

    </div>
  );
}