import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Search, ShoppingCart, Filter, Tag, Info } from "lucide-react";
import Link from "next/link";

export default async function RetailerShopPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  // ১. সব প্রোডাক্ট ফেচ করা (Catalog)
  // বাস্তবে এখানে স্টক চেক করা লাগতে পারে, কিন্তু আপাতত সব প্রোডাক্ট দেখাচ্ছি
  const products = await prisma.product.findMany({
    include: {
      manufacturer: true, // কে বানিয়েছে তা দেখার জন্য
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
         <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
               <ShoppingCart size={32} className="text-blue-200"/> Marketplace
            </h1>
            <p className="text-blue-100 max-w-lg">
               Browse the master catalog and place bulk orders to verified distributors.
            </p>
         </div>
         <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Available Medicines</p>
            <p className="text-3xl font-black">{products.length}</p>
         </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 sticky top-4 z-10">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by medicine name, generic name or company..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50">
            <Filter size={20}/> Filters
         </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition group">
               
               {/* Product Header */}
               <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition">
                     {product.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md uppercase tracking-wide">
                     {product.type}
                  </span>
               </div>

               {/* Details */}
               <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
               <p className="text-sm text-gray-500 mb-4">{product.genericName}</p>

               <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                     <Tag size={14} className="text-gray-400"/>
                     <span>Code: <span className="font-mono text-gray-700">{product.productCode}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                     <Info size={14} className="text-gray-400"/>
                     <span>Mfg by: <span className="font-bold text-gray-700">{product.manufacturer.name}</span></span>
                  </div>
               </div>

               {/* Price & Action */}
               <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div>
                     <p className="text-[10px] text-gray-400 font-bold uppercase">Est. Price</p>
                     <p className="text-lg font-black text-gray-800">₹{product.basePrice || "N/A"}</p>
                  </div>
                  
                  {/* অর্ডার বাটন: এটি পরে Order Create Page এ নিয়ে যাবে */}
                  <Link 
                     href={`/dashboard/retailer/shop/${product.id}`} 
                     className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition flex items-center gap-2"
                  >
                     <ShoppingCart size={16}/> Order
                  </Link>
               </div>
            </div>
         ))}
      </div>
      
      {products.length === 0 && (
         <div className="text-center py-20 text-gray-400">
            <p>No medicines found in the catalog.</p>
         </div>
      )}

    </div>
  );
}