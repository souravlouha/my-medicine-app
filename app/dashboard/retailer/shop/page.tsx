import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Search, ShoppingCart, Filter, Info, PackageCheck, Users, 
  Store, ArrowRight, Tag, Activity, ShieldCheck, Box, BadgeCheck
} from "lucide-react";
import Link from "next/link";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2
  }).format(amount);
};

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export default async function RetailerShopPage(props: ShopPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const sortBy = searchParams?.sort || "";

  // 1. Build Search Condition
  const whereCondition: any = {
    batches: {
      some: {
        inventory: {
          some: {
            currentStock: { gt: 0 },
            user: { role: "DISTRIBUTOR" }
          }
        }
      }
    }
  };

  if (query) {
    whereCondition.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { genericName: { contains: query, mode: "insensitive" } },
      { manufacturer: { name: { contains: query, mode: "insensitive" } } }
    ];
  }

  // 2. Fetch Products
  let products = await prisma.product.findMany({
    where: whereCondition,
    include: {
      manufacturer: true, 
      batches: {
        where: {
          inventory: {
            some: { currentStock: { gt: 0 }, user: { role: "DISTRIBUTOR" } }
          }
        },
        include: {
          inventory: {
            where: { currentStock: { gt: 0 }, user: { role: "DISTRIBUTOR" } },
            include: { user: true }
          }
        }
      }
    }
  });

  // 3. ✅ Advanced Sorting Logic (Price Calculation)
  // এখানে আমরা বের করছি প্রতিটি প্রোডাক্টের জন্য সবচেয়ে কম দাম কত আছে (Lowest Price Available)
  const productsWithPrice = products.map(product => {
    // সব ব্যাচ এবং ইনভেন্টরি থেকে দামগুলো বের করা হচ্ছে
    const allPrices = product.batches.flatMap(batch => 
      batch.inventory.map(inv => inv.sellingPrice && inv.sellingPrice > 0 ? inv.sellingPrice : batch.mrp)
    );

    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
    const mrp = product.batches[0]?.mrp || 0;

    // মোট কতজন ডিস্ট্রিবিউটর আছে
    const supplierCount = new Set(
        product.batches.flatMap(b => b.inventory.map(i => i.user.id))
    ).size;

    return { ...product, minPrice, maxPrice, mrp, supplierCount };
  });

  // ব্যবহারকারীর ফিল্টার অনুযায়ী সর্টিং
  if (sortBy === "price_asc") {
    // কম দাম আগে
    productsWithPrice.sort((a, b) => a.minPrice - b.minPrice);
  } else if (sortBy === "price_desc") {
    // বেশি দাম আগে
    productsWithPrice.sort((a, b) => b.minPrice - a.minPrice);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
      
        {/* Header Section */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-5">
              <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                 <Store size={32} />
              </div>
              <div>
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight">Medicine Marketplace</h1>
                 <p className="text-slate-500 text-sm font-medium">Verified B2B Procurement Portal</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Inventory</p>
                 <p className="text-2xl font-black text-blue-600">{productsWithPrice.length} Products</p>
              </div>
              <button className="bg-slate-900 text-white p-3.5 rounded-2xl hover:bg-slate-800 transition shadow-lg relative">
                 <ShoppingCart size={22}/>
              </button>
           </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4">
           <form className="relative group flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22}/>
              <input 
                 name="q"
                 defaultValue={query}
                 type="text" 
                 placeholder="Search by brand name, generic composition..." 
                 className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[24px] text-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all placeholder:text-slate-400"
              />
              {sortBy && <input type="hidden" name="sort" value={sortBy} />}
           </form>

           <div className="flex gap-2">
              <Link href={`?q=${query}&sort=price_asc`} className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-bold border transition ${sortBy === 'price_asc' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                 <Filter size={18}/> Lowest Price
              </Link>
              <Link href={`?q=${query}&sort=price_desc`} className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-bold border transition ${sortBy === 'price_desc' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                 <Filter size={18}/> Highest Price
              </Link>
              {(query || sortBy) && (
                 <Link href="/dashboard/retailer/shop" className="flex items-center justify-center px-4 py-4 bg-red-50 text-red-500 rounded-[24px] font-bold hover:bg-red-100 transition border border-red-100">✕</Link>
              )}
           </div>
        </div>

        {/* Product List */}
        <div className="space-y-6">
           {productsWithPrice.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-dashed border-slate-200">
                 <PackageCheck size={56} className="text-slate-200 mb-4"/>
                 <h3 className="text-lg font-bold text-slate-400">No matching products found</h3>
                 <Link href="/dashboard/retailer/shop" className="mt-4 text-blue-600 font-bold hover:underline">Clear Search</Link>
              </div>
           ) : (
              productsWithPrice.map((product) => (
                <div key={product.id} className="bg-white border border-slate-200 rounded-[35px] overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 group">
                   <div className="p-6 md:p-8">
                      {/* Header */}
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                         <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                               {product.name.charAt(0)}
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{product.name}</h3>
                                  <BadgeCheck size={18} className="text-blue-500 fill-blue-50"/>
                               </div>
                               <p className="text-slate-500 text-sm font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                                  <Activity size={14} className="text-blue-500"/> {product.genericName || "Standard Grade"}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3.5 py-2 rounded-full uppercase tracking-wider border border-emerald-100 flex items-center gap-1.5">
                               <ShieldCheck size={14}/> Quality Verified
                            </span>
                            <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-3.5 py-2 rounded-full uppercase tracking-wider border border-slate-100">
                               {product.type}
                            </span>
                         </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 rounded-[28px] p-6 border border-slate-100">
                         <div className="space-y-2 border-r border-slate-200/60 pr-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manufacturer</p>
                            <div className="flex items-center gap-3">
                               <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-blue-500 shadow-sm">
                                  <Box size={18}/>
                               </div>
                               <p className="text-sm font-black text-slate-700">{product.manufacturer.name}</p>
                            </div>
                         </div>

                         {/* ✅ Dynamic Price Display */}
                         <div className="space-y-2 border-r border-slate-200/60 pr-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Best Market Price</p>
                            <div className="flex items-center gap-3">
                               <span className="text-2xl font-black text-slate-900">{formatCurrency(product.minPrice)}</span>
                               {product.minPrice < product.mrp && (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                     Save {Math.round(((product.mrp - product.minPrice)/product.mrp)*100)}%
                                  </span>
                               )}
                            </div>
                         </div>

                         <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability</p>
                            <div className="flex items-center gap-3">
                               <div className="flex -space-x-3">
                                  {[...Array(Math.min(product.supplierCount, 3))].map((_, i) => (
                                     <div key={i} className="h-9 w-9 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm">
                                        <Users size={14}/>
                                     </div>
                                  ))}
                               </div>
                               <p className="text-sm font-black text-slate-600">{product.supplierCount} Distributors</p>
                            </div>
                         </div>
                      </div>

                      {/* ✅ Action: Pass sort param to details page */}
                      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                         <div className="flex items-center gap-2.5 text-xs text-slate-400 font-bold bg-slate-100/50 px-4 py-2 rounded-xl">
                            <Info size={15} className="text-blue-400"/>
                            Prices vary by distributor. Compare before buying.
                         </div>
                         <Link 
                            href={`/dashboard/retailer/shop/${product.id}?sort=${sortBy}`} 
                            className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4.5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-600 transition-all duration-300 shadow-xl group/btn active:scale-95"
                         >
                            {product.supplierCount > 1 ? `Compare ${product.supplierCount} Sellers` : "Check Stock & Buy"}
                            <ArrowRight size={20} className="group-hover/btn:translate-x-1.5 transition-transform duration-300"/>
                         </Link>
                      </div>
                   </div>
                </div>
              ))
           )}
        </div>
      </div>
    </div>
  );
}