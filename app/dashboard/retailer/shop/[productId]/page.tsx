import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, User, MapPin, CheckCircle, ShoppingCart, Package, Tag, Percent } from "lucide-react";
import Link from "next/link";

// Helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2
  }).format(amount);
};

export default async function ProductOrderPage({ params }: { params: Promise<{ productId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { productId } = await params;

  if (!productId) {
    return <div className="p-10 text-center text-red-500 font-bold">Error: Invalid Product ID</div>;
  }

  // 1. Get Product Details
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { manufacturer: true }
  });

  if (!product) return <div className="p-10 text-center text-slate-500">Product Not Found</div>;

  // 2. Find Distributors with Stock
  const distributorInventory = await prisma.inventory.findMany({
    where: {
      batch: { productId: productId },
      user: { role: 'DISTRIBUTOR' }, 
      currentStock: { gt: 0 }
    },
    include: {
      user: true,  
      batch: true  
    },
    // অর্ডার: যাদের দাম কম, তাদের আগে দেখাবে
    orderBy: [
      { sellingPrice: 'asc' }, 
      { currentStock: 'desc' }
    ]
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans text-slate-800">
      
      <Link href="/dashboard/retailer/shop" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-4 transition w-fit">
        <ArrowLeft size={18} /> Back to Marketplace
      </Link>

      {/* Product Details Header */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{product.name}</h1>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase border border-slate-200">{product.type}</span>
            </div>
            <p className="text-slate-500 font-medium text-lg">{product.genericName} • {product.strength}</p>
            
            <div className="mt-6 flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100">
                   Mfg by {product.manufacturer.name}
                </div>
            </div>
         </div>

         <div className="text-right relative z-10 flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available From</p>
            <div className="flex items-baseline justify-end gap-2">
                <p className="text-5xl font-black text-blue-600">{distributorInventory.length}</p>
                <span className="text-lg font-bold text-slate-400">Distributors</span>
            </div>
         </div>
      </div>

      {/* Distributors List */}
      <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
             <User size={24} className="text-blue-500"/> Select a Distributor
          </h2>

          <div className="grid grid-cols-1 gap-4">
             {distributorInventory.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-[24px] border border-dashed border-slate-200">
                   <Package size={48} className="mx-auto text-slate-300 mb-4 opacity-50"/>
                   <h3 className="text-lg font-bold text-slate-600">Out of Stock</h3>
                   <p className="text-slate-400 text-sm mt-1">No distributors currently have this item available.</p>
                </div>
             ) : (
                distributorInventory.map((inventory) => {
                    const mrp = inventory.batch.mrp;
                    // ✅ ডাটাবেস থেকে দাম নেওয়া হচ্ছে (যদি null থাকে তবে MRP)
                    const sellingPrice = inventory.sellingPrice && inventory.sellingPrice > 0 
                                         ? inventory.sellingPrice 
                                         : mrp;

                    const discount = sellingPrice < mrp 
                                     ? Math.round(((mrp - sellingPrice) / mrp) * 100) 
                                     : 0;

                    return (
                        <div key={inventory.id} className="bg-white p-6 rounded-[24px] border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6 group">
                           
                           {/* Distributor Info */}
                           <div className="flex items-center gap-5 flex-1 w-full">
                              <div className="h-14 w-14 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
                                 {inventory.user.name.charAt(0)}
                              </div>
                              <div>
                                 <h3 className="font-bold text-slate-900 text-lg">{inventory.user.name}</h3>
                                 <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                        <MapPin size={12} className="text-slate-400"/> 
                                        {inventory.user.address || "Location N/A"}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                        <CheckCircle size={12}/> Verified
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* Stock Info */}
                           <div className="flex items-center gap-8 w-full md:w-auto bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 justify-between md:justify-start">
                              <div className="text-left">
                                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Available</p>
                                 <p className="font-black text-slate-800 text-lg flex items-center gap-1">
                                    {inventory.currentStock.toLocaleString()} <span className="text-xs font-bold text-slate-400">Units</span>
                                 </p>
                              </div>
                              <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                              <div className="text-right md:text-left">
                                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Expiry</p>
                                 <p className="font-bold text-slate-700 text-sm font-mono">
                                    {new Date(inventory.batch.expDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                 </p>
                              </div>
                           </div>

                           {/* Price & Action */}
                           <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                              <div className="text-left md:text-right">
                                 {discount > 0 && (
                                     <div className="flex items-center gap-2 justify-end mb-1">
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <Percent size={10}/> {discount}% OFF
                                        </span>
                                     </div>
                                 )}
                                 
                                 <p className="text-2xl font-black text-blue-600">{formatCurrency(sellingPrice)}</p>
                                 <p className="text-[10px] text-slate-400 font-medium line-through">MRP: {formatCurrency(mrp)}</p>
                              </div>

                              <form action="/dashboard/retailer/cart/add"> 
                                  <input type="hidden" name="inventoryId" value={inventory.id} />
                                  <input type="hidden" name="price" value={sellingPrice} />
                                  <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-600 transition shadow-lg shadow-slate-900/20 flex items-center gap-2 active:scale-95 whitespace-nowrap">
                                     <ShoppingCart size={18}/> Buy Now
                                  </button>
                              </form>
                           </div>

                        </div>
                    );
                })
             )}
          </div>
      </div>
    </div>
  );
}