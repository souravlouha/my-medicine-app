import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ConfirmButton from "./ConfirmButton"; 

// ✅ FIX: Next.js 15 এ params একটি Promise, তাই টাইপ আপডেট করা হলো
export default async function ShipmentReviewPage({ params }: { params: Promise<{ orderId: string }> }) {
    
    // ✅ FIX: params কে আগে await করতে হবে
    const { orderId } = await params; 

    // এখন orderId সঠিক স্ট্রিং পাবে, তাই Prisma কাজ করবে
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { sender: true, items: { include: { product: true } } }
    });

    if (!order) return notFound();

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">📦 Review Shipment Details</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                
                {/* Distributor Info */}
                <div className="flex justify-between border-b pb-4">
                    <div>
                        <p className="text-sm text-gray-500">Ship To:</p>
                        <h2 className="font-bold text-lg">{order.sender.name}</h2>
                        <p className="text-sm text-gray-400">{order.sender.address}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Order ID:</p>
                        <p className="font-mono font-bold">#{order.orderId}</p>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">APPROVED</span>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-400 border-b">
                        <tr>
                            <th className="py-2">Product</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Price</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td className="py-3 font-medium">{item.product.name}</td>
                                <td className="py-3 text-center">{item.quantity}</td>
                                <td className="py-3 text-right">₹{item.price}</td>
                                <td className="py-3 text-right font-bold">₹{item.price * item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Invoice Amount</p>
                        <p className="text-3xl font-black text-green-600">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                </div>

                {/* Confirm Button */}
                <div className="pt-4">
                    <ConfirmButton orderId={orderId} />
                </div>
            </div>
        </div>
    );
}