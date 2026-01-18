import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoicePrintButton from "./InvoicePrintButton";

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { 
            sender: true, // Distributor (Buyer)
            receiver: true, // Manufacturer (Seller)
            items: { include: { product: true } } 
        }
    });

    if (!order) return notFound();

    // Invoice Date & ID Calculation
    const invoiceDate = new Date().toLocaleDateString();
    const invoiceId = `INV-${order.orderId.slice(-6)}`;

    return (
        <div className="max-w-4xl mx-auto p-10 bg-white min-h-screen text-slate-800">
            
            {/* 1. Print Button (Hidden while printing) */}
            <InvoicePrintButton />

            {/* 2. INVOICE CONTENT (This will be printed) */}
            <div className="border border-gray-200 p-8 rounded-none print:border-0 print:p-0">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                        <p className="text-sm text-gray-500 mt-1 font-mono">#{invoiceId}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-xl text-slate-700">MedTrace Logistics</h2>
                        <p className="text-sm text-gray-500">Automated Supply Chain System</p>
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-10 mb-8">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Bill To (Buyer):</p>
                        <h3 className="font-bold text-lg">{order.sender.name}</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{order.sender.address}</p>
                        <p className="text-sm text-gray-500 mt-1">Lic: {order.sender.licenseNo || "N/A"}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ship From (Seller):</p>
                        <h3 className="font-bold text-lg">{order.receiver.name}</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{order.receiver.address}</p>
                        <p className="text-sm text-gray-500 mt-1">Date: {invoiceDate}</p>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-sm mb-8">
                    <thead className="bg-gray-50 border-y border-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-left font-bold text-gray-600">Product / Description</th>
                            <th className="py-3 px-4 text-center font-bold text-gray-600">Qty</th>
                            <th className="py-3 px-4 text-right font-bold text-gray-600">Unit Price</th>
                            <th className="py-3 px-4 text-right font-bold text-gray-600">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.items.map((item, index) => (
                            <tr key={item.id}>
                                <td className="py-3 px-4">
                                    <p className="font-bold text-slate-800">{item.product.name}</p>
                                    <p className="text-xs text-gray-500">{item.product.genericName}</p>
                                </td>
                                <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                                <td className="py-3 px-4 text-right">₹{item.price.toFixed(2)}</td>
                                <td className="py-3 px-4 text-right font-bold">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total Calculation */}
                <div className="flex justify-end border-t border-gray-300 pt-4">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (0%):</span>
                            <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between font-black text-xl text-slate-900 border-t border-gray-200 pt-2 mt-2">
                            <span>Total Due:</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                    <p>This is a computer-generated invoice and requires no signature.</p>
                    <p className="mt-1">Thank you for your business.</p>
                </div>
            </div>
        </div>
    );
}