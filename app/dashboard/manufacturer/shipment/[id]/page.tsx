import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import InvoiceView from "./InvoiceView"; // Client component for print button

export default async function ShipmentDetailsPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  
  // শিপমেন্ট ডাটা আনা
  const shipment = await prisma.shipment.findUnique({
    where: { id: params.id },
    include: {
      sender: true,
      receiver: true,
      items: { include: { batch: { include: { product: true } } } }
    }
  });

  if (!shipment) return notFound();

  return (
    <div className="max-w-4xl mx-auto my-10 space-y-6">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold text-gray-800">📄 Invoice View</h1>
        <InvoiceView />
      </div>

      {/* Paper Design */}
      <div id="invoice-area" className="bg-white p-10 shadow-xl rounded-none md:rounded-lg border border-gray-200 text-gray-800">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
           <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 uppercase">Invoice</h1>
              <p className="text-gray-500 mt-2 font-mono">#{shipment.shipmentId}</p>
           </div>
           <div className="text-right">
              <h3 className="text-xl font-bold text-blue-600">{shipment.sender.name}</h3>
              <p className="text-sm text-gray-500 max-w-[200px] mt-1">{shipment.sender.address || "Head Office, Industrial Area"}</p>
              <p className="text-sm text-gray-500">Lic: {shipment.sender.licenseNo}</p>
           </div>
        </div>

        {/* Bill To & Info */}
        <div className="flex justify-between mb-10">
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Bill To</p>
              <h3 className="text-lg font-bold">{shipment.receiver.name}</h3>
              <p className="text-sm text-gray-600">{shipment.receiver.address || "Distributor Point"}</p>
              <p className="text-sm text-gray-600">{shipment.receiver.email}</p>
           </div>
           <div className="text-right">
              <div className="mb-2">
                 <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                 <p className="font-bold">{new Date(shipment.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                 <p className="font-bold uppercase text-green-600">{shipment.status}</p>
              </div>
           </div>
        </div>

        {/* Table */}
        <table className="w-full mb-10">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
               <th className="text-left py-3 px-4 font-bold text-sm uppercase">Item Description</th>
               <th className="text-right py-3 px-4 font-bold text-sm uppercase">Qty</th>
               <th className="text-right py-3 px-4 font-bold text-sm uppercase">Rate</th>
               <th className="text-right py-3 px-4 font-bold text-sm uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shipment.items.map((item, idx) => (
               <tr key={idx}>
                  <td className="py-4 px-4">
                     <p className="font-bold text-sm">{item.batch.product.name}</p>
                     <p className="text-xs text-gray-500">Batch: {item.batch.batchNumber} | Exp: {new Date(item.batch.expDate).toLocaleDateString()}</p>
                  </td>
                  <td className="text-right py-4 px-4 font-mono">{item.quantity}</td>
                  <td className="text-right py-4 px-4 font-mono">₹{item.price}</td>
                  <td className="text-right py-4 px-4 font-bold font-mono">₹{(item.quantity * item.price).toFixed(2)}</td>
               </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end border-t-2 border-gray-800 pt-6">
           <div className="w-64">
              <div className="flex justify-between mb-2">
                 <span className="text-gray-500">Subtotal</span>
                 <span className="font-mono">₹{shipment.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                 <span className="text-gray-500">Tax (0%)</span>
                 <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-4">
                 <span>Total Due</span>
                 <span className="text-blue-600">₹{shipment.totalAmount.toFixed(2)}</span>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-400">
           <p>Thank you for your business. This is a computer-generated invoice.</p>
           <p>MedTrace Supply Chain Management System</p>
        </div>

      </div>
    </div>
  );
}