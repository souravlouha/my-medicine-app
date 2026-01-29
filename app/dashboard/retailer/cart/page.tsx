import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Trash2, ShoppingCart, CreditCard, Package, Store, Minus, Plus } from "lucide-react"; 
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <ShoppingCart size={32} className="text-blue-600"/> My Cart
           </h1>
           <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
              {cartItems.length} Items
           </span>
        </div>

        {cartItems.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
              <Package size={64} className="mx-auto text-slate-200 mb-4"/>
              <h3 className="text-xl font-bold text-slate-400">Your cart is empty</h3>
              <Link href="/dashboard/retailer/shop" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
                 Browse Marketplace
              </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                 {cartItems.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                       
                       {/* Product Icon */}
                       <div className="h-20 w-20 bg-slate-50 rounded-xl flex items-center justify-center text-3xl font-bold text-slate-600 shrink-0">
                          {item.inventory.batch.product.name.charAt(0)}
                       </div>

                       {/* Details */}
                       <div className="flex-1 text-center sm:text-left space-y-1">
                          <h3 className="font-bold text-slate-900 text-lg">{item.inventory.batch.product.name}</h3>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-slate-500">
                             <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                <Store size={12}/> {item.inventory.user.name}
                             </span>
                             <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                MRP: ₹{item.inventory.batch.mrp}
                             </span>
                          </div>
                          <p className="text-xs font-bold text-blue-600">
                             Deal Price: ₹{item.price} / unit
                          </p>
                       </div>

                       {/* Quantity Controller */}
                       <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-200">
                             <form action={updateCartItemQuantityAction}>
                                <input type="hidden" name="itemId" value={item.id} />
                                <input type="hidden" name="type" value="minus" />
                                <button className="p-2 bg-white rounded-lg text-slate-600 shadow-sm hover:bg-slate-100 active:scale-95 disabled:opacity-50" disabled={item.quantity <= 1}>
                                   <Minus size={14} />
                                </button>
                             </form>

                             <span className="font-bold text-slate-900 w-6 text-center">{item.quantity}</span>

                             <form action={updateCartItemQuantityAction}>
                                <input type="hidden" name="itemId" value={item.id} />
                                <input type="hidden" name="type" value="plus" />
                                <button className="p-2 bg-slate-900 rounded-lg text-white shadow-sm hover:bg-slate-700 active:scale-95">
                                   <Plus size={14} />
                                </button>
                             </form>
                          </div>
                       </div>

                       {/* Total & Remove */}
                       <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-xl font-black text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                          
                          <form action={removeFromCartAction}>
                             <input type="hidden" name="itemId" value={item.id} />
                             <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={18}/>
                             </button>
                          </form>
                       </div>

                    </div>
                 ))}
              </div>

              {/* Checkout Panel */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 h-fit shadow-xl sticky top-6">
                 <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>
                 
                 <div className="space-y-3 mb-6 border-b border-slate-100 pb-6">
                    <div className="flex justify-between text-slate-500 text-sm">
                       <span>Subtotal</span>
                       <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    {/* ✅ GST Shown as 0% for now */}
                    <div className="flex justify-between text-slate-500 text-sm">
                       <span>Tax (GST 0%)</span>
                       <span>₹0.00</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center mb-8">
                    <span className="font-bold text-slate-800">Total Payable</span>
                    <span className="text-3xl font-black text-blue-600">
                       ₹{totalAmount.toFixed(2)}
                    </span>
                 </div>

                 <form action={placeOrderAction} className="space-y-4">
                    <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 active:scale-95">
                       <CreditCard size={20}/> Place Order
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                       Separate orders will be created for each distributor.
                    </p>
                 </form>
              </div>

           </div>
        )}
      </div>
    </div>
  );
}