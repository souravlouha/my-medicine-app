import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ ফিক্স: কুকির বদলে auth ইম্পোর্ট
import { redirect } from "next/navigation";
import { Package, AlertTriangle, Search, Filter } from "lucide-react";
import InventoryAnalytics from "./InventoryAnalytics";

export default async function DistributorInventoryPage() {
  // ✅ ফিক্স: কুকির বদলে সেশন ব্যবহার করা হলো
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // ১. ইনভেন্টরি ডাটা ফেচ করা
  const inventoryItems = await prisma.inventory.findMany({
    where: { 
      userId: userId,
      currentStock: { gt: 0 } // জিরো স্টকের আইটেম দেখাবো না
    },
    include: {
      batch: {
        include: { product: true, manufacturer: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <Package className="text-blue-600" /> My Inventory
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your stock levels and monitor batch expiry.</p>
         </div>
      </div>

      {/* 📊 NEW ANALYTICS DASHBOARD */}
      {inventoryItems.length > 0 ? (
         <InventoryAnalytics inventory={inventoryItems} />
      ) : (
         <div className="p-8 bg-blue-50 rounded-2xl text-center text-blue-700 font-bold border border-blue-100">
            Analytics will appear here once you add stock.
         </div>
      )}

      {/* Main Inventory Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
         
         {/* Table Controls */}
         <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-3 top-3 text-gray-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search medicine or batch..." 
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">
               <Filter size={16}/> Filter
            </button>
         </div>

         {/* Items List */}
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                     <th className="py-4 px-6">Medicine Name</th>
                     <th className="py-4 px-6">Batch Details</th>
                     <th className="py-4 px-6">Expiry Date</th>
                     <th className="py-4 px-6 text-center">Stock Level</th>
                     <th className="py-4 px-6 text-right">Value (₹)</th>
                     <th className="py-4 px-6 text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {inventoryItems.length === 0 && (
                     <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-400">Inventory is empty. Receive shipments to add stock.</td>
                     </tr>
                  )}
                  {inventoryItems.map((item) => {
                     const isLowStock = item.currentStock < 50;
                     const isExpiring = new Date(item.batch.expDate) < new Date(new Date().setMonth(new Date().getMonth() + 3));
                     
                     return (
                        <tr key={item.id} className="hover:bg-gray-50 transition">
                           <td className="py-4 px-6">
                              <p className="font-bold text-gray-800 text-base">{item.batch.product.name}</p>
                              <p className="text-xs text-gray-500">{item.batch.product.genericName}</p>
                              <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">{item.batch.product.type}</span>
                           </td>
                           <td className="py-4 px-6">
                              <p className="font-mono text-gray-700 font-bold">{item.batch.batchNumber}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Mfr: {item.batch.manufacturer.name}</p>
                           </td>
                           <td className="py-4 px-6">
                              <p className={`font-bold ${isExpiring ? "text-orange-600" : "text-gray-700"}`}>
                                 {new Date(item.batch.expDate).toLocaleDateString()}
                              </p>
                              {isExpiring && <span className="text-[10px] text-orange-500 font-bold">Expiring Soon</span>}
                           </td>
                           <td className="py-4 px-6 text-center">
                              <span className={`px-3 py-1 rounded-lg font-bold text-sm ${isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                 {item.currentStock}
                              </span>
                           </td>
                           <td className="py-4 px-6 text-right font-bold text-gray-700">
                              ₹{(item.currentStock * item.batch.mrp).toLocaleString()}
                           </td>
                           <td className="py-4 px-6 text-center">
                              {isLowStock ? (
                                 <span className="text-xs font-bold text-red-500 flex justify-center items-center gap-1 bg-red-50 py-1 px-2 rounded"><AlertTriangle size={12}/> Re-order</span>
                              ) : (
                                 <span className="text-xs font-bold text-green-500 bg-green-50 py-1 px-2 rounded">In Stock</span>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}