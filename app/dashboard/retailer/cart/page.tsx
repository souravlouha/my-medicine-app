import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Trash2, ShoppingCart, CreditCard, Package, Store, Minus, Plus, ArrowRight, ShieldCheck, Info } from "lucide-react"; 
import { placeOrderAction, removeFromCartAction, updateCartItemQuantityAction } from "@/lib/actions/retailer-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          inventory: {
            include: {
              batch: { include: { product: true } },
              user: true 
            }
          }
        },
        orderBy: { inventory: { batch: { product: { name: 'asc' } } } }
      }
    }
  });

  const cartItems = cart?.items || [];
  
  // টোটাল হিসাব
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <ShoppingCart size={32} className="text-blue-600"/> My Cart
              </h1>
              <p className="text-slate-500 font-medium mt-1">Review and place orders for your pharmacy.</p>
           </div>
           <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-blue-100">
              {cartItems.length} Items
           </div>
        </div>

        {cartItems.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-dashed border-slate-300">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                 <Package size={64} className="text-slate-300"/>
              </div>
              <h3 className="text-2xl font-bold text-slate-700">Your cart is empty</h3>
              <p className="text-slate-400 mt-1 max-w-xs text-center">Looks like you haven't added any medicine stock yet.</p>
              <Link href="/dashboard/retailer/shop" className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95">
                 Browse Marketplace
              </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left: Cart Items List (Span 8) */}
              <div className="lg:col-span-8 space-y-4">
                 {cartItems.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 group">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                          
                          {/* Product Icon */}
                          <div className="h-24 w-24 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 border border-blue-100">
                             <Package size={32} />
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-2">
                             <div className="flex justify-between items-start">
                                <div>
                                   <h3 className="font-bold text-slate-900 text-xl">{item.inventory.batch.product.name}</h3>
                                   <p className="text-sm text-slate-500">{item.inventory.batch.product.genericName}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-lg font-black text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                                   <p className="text-xs text-slate-400">₹{item.price} / unit</p>
                                </div>
                             </div>

                             <div className="flex flex-wrap gap-2 text-xs font-bold pt-1">
                                <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
                                   <Store size={12}/> {item.inventory.user.name}
                                </span>
                                <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-lg">
                                   Batch: {item.inventory.batch.batchNumber}
                                </span>
                             </div>
                          </div>
                       </div>

                       {/* Action Row (Quantity & Delete) */}
                       <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                          <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-1 border border-slate-200">
                             <form action={updateCartItemQuantityAction}>
                                <input type="hidden" name="itemId" value={item.id} />
                                <input type="hidden" name="type" value="minus" />
                                <button className="w-9 h-9 flex items-center justify-center bg-white rounded-lg text-slate-600 shadow-sm hover:bg-slate-100 active:scale-90 disabled:opacity-50 transition" disabled={item.quantity <= 1}>
                                   <Minus size={16} />
                                </button>
                             </form>

                             <span className="font-bold text-slate-900 w-8 text-center text-lg">{item.quantity}</span>

                             <form action={updateCartItemQuantityAction}>
                                <input type="hidden" name="itemId" value={item.id} />
                                <input type="hidden" name="type" value="plus" />
                                <button className="w-9 h-9 flex items-center justify-center bg-slate-900 rounded-lg text-white shadow-sm hover:bg-black active:scale-90 transition">
                                   <Plus size={16} />
                                </button>
                             </form>
                          </div>

                          <form action={removeFromCartAction}>
                             <input type="hidden" name="itemId" value={item.id} />
                             <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition text-sm font-bold">
                                <Trash2 size={18}/> Remove
                             </button>
                          </form>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Right: Checkout Panel (Span 4) */}
              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-xl sticky top-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        Checkout Summary
                    </h2>
                    
                    <div className="space-y-4 mb-6 border-b border-dashed border-slate-200 pb-6">
                       <div className="flex justify-between text-slate-500 text-sm font-medium">
                          <span>Subtotal</span>
                          <span className="text-slate-800">₹{totalAmount.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-slate-500 text-sm font-medium">
                          <span>Tax (GST 0%)</span>
                          <span className="text-slate-800">₹0.00</span>
                       </div>
                       <div className="flex justify-between text-slate-500 text-sm font-medium">
                          <span>Delivery</span>
                          <span className="text-green-600 font-bold">Free</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                       <span className="font-bold text-slate-800 text-lg">Total Payable</span>
                       <span className="text-3xl font-black text-blue-600">
                          ₹{totalAmount.toFixed(2)}
                       </span>
                    </div>

                    <form action={placeOrderAction} className="space-y-4">
                       <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-300 hover:bg-black transition flex items-center justify-center gap-2 active:scale-95 group">
                          <CreditCard size={20}/> Place Order <ArrowRight size={20} className="group-hover:translate-x-1 transition"/>
                       </button>
                       <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-3 border border-blue-100">
                          <Info size={16} className="text-blue-500 shrink-0 mt-0.5"/>
                          <p className="text-[11px] text-blue-700 leading-tight">
                             Separate orders will be automatically created for each distributor based on their items.
                          </p>
                       </div>
                    </form>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-bold mt-4">
                        <ShieldCheck size={14}/> Secure B2B Checkout
                    </div>
                 </div>
              </div>

           </div>
        )}
      </div>
    </div>
  );
}