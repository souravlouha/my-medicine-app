import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle, Package, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createOrderAction } from "@/lib/actions/retailer-actions"; // এটি আমরা পরে বানাবো

export default async function ProductOrderPage({ params }: { params: { productId: string } }) {
  // Await params object before accessing properties
  const { productId } = await params;
  
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  // ১. প্রোডাক্ট ডিটেইলস এবং স্টক চেক করা (Distributor এর কাছে)
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      manufacturer: true,
      // ডিস্ট্রিবিউটরদের কাছে এই প্রোডাক্টের কোন ব্যাচগুলো আছে তা দেখা
      batches: {
        where: {
          inventory: {
            some: {
              currentStock: { gt: 0 } // যাদের কাছে স্টক আছে
            }
          }
        },
        include: {
          inventory: {
            include: { user: true } // ডিস্ট্রিবিউটরের তথ্য
          }
        }
      }
    }
  });

  if (!product) return <div>Product not found</div>;

  // ২. ইউনিক ডিস্ট্রিবিউটরদের লিস্ট বের করা (যাদের কাছে স্টক আছে)
  const distributorsWithStock = product.batches.flatMap(batch => 
    batch.inventory.map(inv => ({
      distributor: inv.user,
      batchId: batch.id,
      stock: inv.currentStock,
      price: batch.mrp, // আপাতত MRP কেই প্রাইস ধরছি
      batchNo: batch.batchNumber,
      expiry: batch.expDate
    }))
  ).filter(item => item.distributor.role === 'DISTRIBUTOR');

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      
      {/* Back Button */}
      <Link href="/dashboard/retailer/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-bold text-sm">
         <ArrowLeft size={16}/> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         
         {/* Left: Product Info */}
         <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-4">
                  {product.name.charAt(0)}
               </div>
               <h1 className="text-xl font-black text-gray-800">{product.name}</h1>
               <p className="text-sm text-gray-500">{product.genericName}</p>
               <span className="inline-block mt-2 text-xs font-bold bg-gray-100 px-3 py-1 rounded-full uppercase">{product.type}</span>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
               <h3 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                  <ShieldCheck size={14}/> Verified Manufacturer
               </h3>
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-sm">
                     {product.manufacturer.name.charAt(0)}
                  </div>
                  <div>
                     <p className="font-bold text-gray-800 text-sm">{product.manufacturer.name}</p>
                     <p className="text-xs text-gray-500">Lic: {product.manufacturer.licenseNo || "N/A"}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Available Distributors (Suppliers) */}
         <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
               <Building2 size={20} className="text-gray-400"/> Select Supplier
            </h2>

            <div className="space-y-4">
               {distributorsWithStock.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                     <Package className="mx-auto text-gray-300 mb-2" size={32}/>
                     <p className="text-gray-500">No distributors currently have stock of this medicine.</p>
                  </div>
               ) : (
                  distributorsWithStock.map((item) => (
                     <div key={item.batchId + item.distributor.id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:border-blue-300 transition group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h3 className="font-bold text-lg text-gray-800">{item.distributor.name}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                 <CheckCircle size={10} className="text-green-500"/> Verified Distributor
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-2xl font-black text-gray-800">₹{item.price}</p>
                              <p className="text-xs text-gray-400">per unit</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                           <p>Batch: <span className="font-mono text-gray-700">{item.batchNo}</span></p>
                           <p>Exp: <span className="font-medium text-gray-700">{new Date(item.expiry).toLocaleDateString()}</span></p>
                           <p>Stock: <span className="font-bold text-green-600">{item.stock} units</span></p>
                        </div>

                        {/* Order Form Action */}
                        {/* ⚠️ Note: createOrderAction টি আমরা পরের ধাপে বানাবো */}
                        <form action={createOrderAction} className="flex gap-3">
                           <input type="hidden" name="distributorId" value={item.distributor.id} />
                           <input type="hidden" name="productId" value={product.id} />
                           <input type="hidden" name="price" value={item.price} />
                           
                           <input 
                              type="number" 
                              name="quantity" 
                              placeholder="Qty" 
                              min="10" 
                              max={item.stock} 
                              className="w-24 px-3 py-2 border border-gray-300 rounded-xl font-bold text-center outline-none focus:border-blue-500"
                              required
                           />
                           <button type="submit" className="flex-1 bg-gray-900 text-white font-bold py-2 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-gray-200">
                              Place Order
                           </button>
                        </form>
                     </div>
                  ))
               )}
            </div>
         </div>

      </div>
    </div>
  );
}