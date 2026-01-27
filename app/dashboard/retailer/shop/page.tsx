import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Search, ShoppingCart, Filter, Info, PackageCheck, Users, Store, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RetailerShopPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  // ✅ LOGIC: Fetch Products AND their Stock Holders (Distributors)
  const availableProducts = await prisma.product.findMany({
    where: {
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
    },
    include: {
      manufacturer: true, 
      batches: {
        where: {
          inventory: {
            some: {
              currentStock: { gt: 0 },
              user: { role: "DISTRIBUTOR" }
            }
          }
        },
        include: {
          inventory: {
            where: {
              currentStock: { gt: 0 },
              user: { role: "DISTRIBUTOR" }
            },
            include: {
              user: true 
            }
          }
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-[1400px] mx-auto space-y-10">
      
        {/* 1. Modern Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[30px] p-10 md:p-14 overflow-hidden shadow-2xl shadow-blue-900/20 text-white flex flex-col md:flex-row items-center justify-between gap-8">
           
           {/* Abstract Shapes */}
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-400/20 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none"></div>

           <div className="relative z-10 space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-blue-100 w-fit">
                 <Store size={12} /> Retailer Procurement Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                 Premium Medicine <br/> Marketplace
              </h1>
              <p className="text-blue-100 text-lg md:text-xl font-medium leading-relaxed opacity-90">
                 Connect directly with verified distributors. access real-time stock, compare wholesale rates, and restock your pharmacy effortlessly.
              </p>
           </div>

           {/* Live Stat Box */}
           <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl min-w-[200px] text-center shadow-lg transform hover:scale-105 transition duration-300">
              <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                 <Tag size={20} className="fill-current"/>
              </div>
              <p className="text-5xl font-black text-white">{availableProducts.length}</p>
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mt-1">Products Live</p>
           </div>
        </div>

        {/* 2. Floating Action Bar (Search & Filter) */}
        <div className="sticky top-6 z-40 bg-white/80 backdrop-blur-xl border border-slate-200/60 p-3 rounded-2xl shadow-lg shadow-slate-200/50 flex flex-col md:flex-row gap-3 items-center">
           <div className="relative flex-1 w-full group">
              <Search className="absolute left-5 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" size={22}/>
              <input 
                 type="text" 
                 placeholder="Search by brand name, generic name, or manufacturer..." 
                 className="w-full pl-14 pr-6 py-3.5 bg-transparent rounded-xl text-lg text-slate-700 placeholder:text-slate-400 font-medium focus:outline-none focus:bg-slate-50 transition-all"
              />
           </div>
           <div className="flex gap-3 w-full md:w-auto p-1">
              <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm shadow-sm flex-1 md:flex-none">
                 <Filter size={18}/> Filters
              </button>
              <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-sm shadow-lg shadow-slate-900/20 hover:shadow-xl transform active:scale-95 flex-1 md:flex-none">
                 <ShoppingCart size={18}/> View Cart
              </button>
           </div>
        </div>

        {/* 3. Product Grid */}
        {availableProducts.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] border border-dashed border-slate-200 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                 <PackageCheck size={40} className="text-slate-300"/>
              </div>
              <h3 className="text-2xl font-bold text-slate-700">No Inventory Found</h3>
              <p className="text-slate-400 font-medium mt-2">Currently, no distributors have listed stock matching your criteria.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {availableProducts.map((product) => {
                 const firstBatch = product.batches[0];
                 const mrp = firstBatch ? firstBatch.mrp : "N/A";
                 const suppliers = new Set();
                 product.batches.forEach(b => b.inventory.forEach(i => suppliers.add(i.user.name)));
                 const supplierCount = suppliers.size;

                 return (
                    <div key={product.id} className="group relative bg-white rounded-[28px] border border-slate-100 p-6 flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-1">
                       
                       {/* Floating Badge */}
                       <div className="absolute top-6 right-6">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full uppercase tracking-wide border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                             {product.type}
                          </span>
                       </div>

                       <div>
                          {/* Icon */}
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-3xl shadow-sm border border-blue-100/50 mb-6 group-hover:scale-110 transition-transform duration-500">
                             {product.name.charAt(0)}
                          </div>

                          {/* Info */}
                          <div className="space-y-1 mb-6">
                             <h3 className="text-2xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors cursor-pointer">{product.name}</h3>
                             <p className="text-sm text-slate-500 font-medium line-clamp-1">{product.genericName || "Generic Composition"}</p>
                          </div>

                          {/* Meta Pill */}
                          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl mb-8 w-full">
                             <Info size={14} className="text-blue-400 shrink-0"/>
                             <span className="text-xs font-semibold text-slate-600 truncate">Mfg: {product.manufacturer.name}</span>
                          </div>
                       </div>

                       {/* Action Footer */}
                       <div className="space-y-4">
                          <div className="flex items-end justify-between border-t border-slate-50 pt-4">
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Retail Price</p>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-2xl font-black text-slate-900">₹{mrp}</span>
                                   <span className="text-xs font-medium text-slate-400 line-through decoration-slate-300">₹{Number(mrp) + (Number(mrp)*0.12)}</span>
                                </div>
                             </div>
                          </div>

                          <Link 
                             href={`/dashboard/retailer/shop/${product.id}`} 
                             className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors duration-300 shadow-lg shadow-slate-900/10 group-hover:shadow-blue-600/20"
                          >
                             {supplierCount > 1 ? `Compare ${supplierCount} Sellers` : "Check Availability"}
                             <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                          </Link>
                       </div>

                    </div>
                 );
              })}
           </div>
        )}

      </div>
    </div>
  );
}