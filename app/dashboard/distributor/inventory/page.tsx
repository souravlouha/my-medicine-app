import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Package, Search, Filter, AlertCircle, TrendingUp } from "lucide-react";
import InventoryAnalytics from "./InventoryAnalytics";
import { updateSellingPriceAction } from "@/lib/actions/distributor-actions"; 

export default async function DistributorInventoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // 1. Fetch Data
  const rawInventoryItems = await prisma.inventory.findMany({
    where: { 
      userId: userId,
      currentStock: { gt: 0 } 
    },
    include: {
      batch: {
        include: { product: true, manufacturer: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // ✅ FIX 2: Date Serialization (Prevent "Server-side exception")
  // ডাটাবেসের Date অবজেক্টগুলোকে String-এ কনভার্ট করা হচ্ছে যাতে Client Component ক্র্যাশ না করে।
  const inventoryItems = JSON.parse(JSON.stringify(rawInventoryItems));

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-blue-600" /> My Inventory
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage stock and set selling prices for retailers.</p>
          </div>
      </div>

      {/* Analytics Section */}
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
                <input type="text" placeholder="Search medicine or batch..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
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
                      <th className="py-4 px-6 text-center">Stock Level</th>
                      <th className="py-4 px-6 text-right">Buying Price (M)</th>
                      <th className="py-4 px-6 text-right">MRP</th>
                      <th className="py-4 px-6 text-right bg-blue-50/50 border-l border-blue-100">Your Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inventoryItems.length === 0 && (
                      <tr><td colSpan={6} className="py-10 text-center text-gray-400">Inventory is empty. Receive shipments to add stock.</td></tr>
                  )}
                  {inventoryItems.map((item: any) => {
                      const isLowStock = item.currentStock < 50;
                      
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
                            <td className="py-4 px-6 text-center">
                              <span className={`px-3 py-1 rounded-lg font-bold text-sm ${isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                  {item.currentStock} Units
                              </span>
                            </td>
                            
                            <td className="py-4 px-6 text-right font-bold text-gray-500">
                              ₹{item.batch.product.basePrice || "N/A"}
                            </td>

                            <td className="py-4 px-6 text-right font-bold text-gray-500">
                              ₹{item.batch.mrp}
                            </td>

                            {/* ✅ FIX 1: Form Action Type Error Fixed */}
                            <td className="py-4 px-6 text-right bg-blue-50/30 border-l border-blue-50">
                              <form 
                                action={async (formData) => {
                                  "use server";
                                  await updateSellingPriceAction(formData);
                                }} 
                                className="flex items-center justify-end gap-2"
                              >
                                  <input type="hidden" name="inventoryId" value={item.id} />
                                  <div className="relative">
                                    <span className="absolute left-2 top-1.5 text-gray-400 text-xs">₹</span>
                                    <input 
                                        type="number" 
                                        name="price"
                                        defaultValue={item.sellingPrice || ""} 
                                        placeholder="Set"
                                        className="w-20 pl-5 pr-2 py-1.5 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700 text-right"
                                        step="0.01"
                                        required
                                    />
                                  </div>
                                  <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm" title="Update">
                                    <TrendingUp size={14}/>
                                  </button>
                              </form>
                              
                              {(!item.sellingPrice || item.sellingPrice === 0) && (
                                  <p className="text-[10px] text-red-500 mt-1 flex items-center justify-end gap-1"><AlertCircle size={10}/> Not set</p>
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