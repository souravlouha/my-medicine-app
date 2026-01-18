import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function InvoicePage({ params }: { params: { orderId: string } }) {
  const { orderId } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  // অর্ডার ডিটেইলস ফেচ করা
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      sender: true,   // Retailer (Buyer)
      receiver: true, // Distributor (Seller)
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) return <div>Invoice not found</div>;

  // ক্যালকুলেশন
  const subTotal = order.totalAmount;
  const tax = subTotal * 0.18; // 18% GST (Example)
  const grandTotal = subTotal + tax;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen text-gray-800">
      
      {/* Print & Back Controls (Not printed) */}
      <div className="flex justify-between mb-8 print:hidden">
         <Link href="/dashboard/retailer/incoming" className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
            <ArrowLeft size={16}/> Back
         </Link>
         <button 
            // Client side print logic would go here, for now basic browser print
            // onClick={() => window.print()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700"
         >
            <Printer size={18}/> Print Invoice
         </button>
      </div>

      {/* INVOICE CONTENT */}
      <div className="border border-gray-200 p-8 rounded-xl shadow-sm print:shadow-none print:border-0">
         
         {/* Header */}
         <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
            <div>
               <h1 className="text-4xl font-black text-blue-600 tracking-tight">INVOICE</h1>
               <p className="text-gray-500 mt-2 font-mono">#{order.orderId}</p>
            </div>
            <div className="text-right">
               <h2 className="font-bold text-xl text-gray-800">MedTrace Supply Chain</h2>
               <p className="text-sm text-gray-500">Authorized Distribution Network</p>
               <p className="text-sm text-gray-500 mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
         </div>

         {/* Parties */}
         <div className="grid grid-cols-2 gap-12 mb-10">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase mb-2">Billed From (Seller)</p>
               <h3 className="font-bold text-lg">{order.receiver.name}</h3>
               <p className="text-sm text-gray-600">{order.receiver.address || "Address not updated"}</p>
               <p className="text-sm text-gray-600">Lic: {order.receiver.licenseNo || "N/A"}</p>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold text-gray-400 uppercase mb-2">Billed To (Buyer)</p>
               <h3 className="font-bold text-lg">{order.sender.name}</h3>
               <p className="text-sm text-gray-600">{order.sender.address || "Address not updated"}</p>
               <p className="text-sm text-gray-600">Phone: {order.sender.phone || "N/A"}</p>
            </div>
         </div>

         {/* Items Table */}
         <table className="w-full text-left mb-8">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
               <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
               {order.items.map((item, idx) => (
                  <tr key={idx}>
                     <td className="py-4 px-4">
                        <p className="font-bold text-gray-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.product.genericName}</p>
                     </td>
                     <td className="py-4 px-4 text-center">{item.quantity}</td>
                     <td className="py-4 px-4 text-right">₹{item.price}</td>
                     <td className="py-4 px-4 text-right font-bold">₹{item.quantity * item.price}</td>
                  </tr>
               ))}
            </tbody>
         </table>

         {/* Totals */}
         <div className="flex justify-end border-t border-gray-100 pt-6">
            <div className="w-64 space-y-3">
               <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-lg font-black text-gray-800 border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
               </div>
            </div>
         </div>

         {/* Footer */}
         <div className="mt-12 text-center text-xs text-gray-400">
            <p>This is a system generated invoice.</p>
            <p>MedTrace Network • Verify authenticity by scanning product QR codes.</p>
         </div>

      </div>
    </div>
  );
}