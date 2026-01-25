import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ ফিক্স: কুকির বদলে auth ইম্পোর্ট
import { redirect } from "next/navigation";
import { ShoppingCart, Tag, Factory } from "lucide-react";
import OrderCard from "./OrderCard"; 

export default async function PlaceOrderPage() {
  // ✅ ফিক্স: কুকির বদলে সেশন ব্যবহার করা হলো
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // ১. সব প্রোডাক্ট ফেচ করা (Catalog)
  const products = await prisma.product.findMany({
    include: {
      manufacturer: true // কার প্রোডাক্ট সেটা জানার জন্য
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 space-y-8">
      
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <ShoppingCart className="text-blue-600"/> B2B Marketplace
            </h1>
            <p className="text-gray-500 text-sm">Browse catalogs from manufacturers and restock your inventory.</p>
         </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
               
               {/* Card Header */}
               <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.genericName}</p>
                     </div>
                     <span className="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                        {product.type}
                     </span>
                  </div>
               </div>

               {/* Details */}
               <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                     <Factory size={16} className="text-blue-500"/>
                     <span className="font-bold">{product.manufacturer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                     <Tag size={16} className="text-green-500"/>
                     <span>Price: <span className="font-black text-gray-900">₹{product.basePrice || "N/A"}</span> / unit</span>
                  </div>
                  <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100">
                     📦 Strength: {product.strength}
                  </div>
               </div>

               {/* Action Area (Client Component) */}
               <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <OrderCard product={product} />
               </div>

            </div>
         ))}
      </div>
    </div>
  );
}