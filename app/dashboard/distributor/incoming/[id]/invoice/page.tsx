import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoicePrintButton from "./InvoicePrintButton";

// 👇 Next.js 15 এ params একটি Promise
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  
  // ✅ ১. এই লাইনটি এরর ঠিক করবে (params কে await করা হলো)
  const { id } = await params;

  // ২. ডাটাবেস থেকে শিপমেন্ট আনা
  const shipment = await prisma.shipment.findUnique({
    where: { id: id },
    include: {
      sender: true,    // Manufacturer (Bose in example)
      receiver: true,  // Distributor (Shreshtha in example)
      items: {
        include: {
          batch: { include: { product: true } }
        }
      }
    }
  });

  if (!shipment) return notFound();

  // ৩. ক্যালকুলেশন (Tax & Totals)
  // আমরা ধরে নিচ্ছি DB তে item.price হলো Base Price
  let subTotal = 0;
  let totalTax = 0;

  const invoiceItems = shipment.items.map(item => {
    const amount = item.price * item.quantity;
    const tax = amount * 0.18; // 18% Tax Demo
    const total = amount + tax;
    
    subTotal += amount;
    totalTax += tax;

    return {
      ...item,
      taxAmount: tax,
      totalAmount: total
    };
  });

  const grandTotal = subTotal + totalTax;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start print:p-0 print:bg-white">
      
      {/* 📄 A4 Invoice Container */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-10 shadow-xl print:shadow-none print:w-full text-gray-800 relative">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start mb-6">
           {/* Company Info (Left) */}
           <div>
              <h1 className="text-4xl font-black text-gray-900 mb-1">{shipment.sender.name}</h1>
              <p className="text-sm text-gray-500 max-w-xs">{shipment.sender.address || "Industrial Estate, India"}</p>
              <p className="text-sm text-gray-500 mt-1">
                 GSTIN: <span className="uppercase">{shipment.sender.licenseNo || "GST-PENDING"}</span> | DL: DL-M-5678/2023
              </p>
              <p className="text-sm text-gray-500">Email: {shipment.sender.email}</p>
           </div>

           {/* Invoice Meta (Right) */}
           <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900 uppercase">INVOICE</h2>
              <p className="text-sm font-bold text-gray-800 mt-1">NO: {shipment.shipmentId || "INV-735093"}</p>
              <p className="text-sm text-gray-600">Date: {new Date(shipment.createdAt).toLocaleDateString('en-GB')}</p>
              <p className="text-sm text-gray-600">Status: <span className="capitalize">{shipment.status.replace("_", " ").toLowerCase()}</span></p>
           </div>
        </div>

        {/* Separator Line */}
        <div className="border-t-2 border-gray-200 my-6"></div>

        {/* --- BILL TO --- */}
        <div className="mb-8">
           <h3 className="text-xs font-bold text-gray-900 uppercase mb-2">BILLED TO:</h3>
           <h4 className="text-lg font-bold text-gray-800">{shipment.receiver.name}</h4>
           <p className="text-sm text-gray-600 max-w-xs">{shipment.receiver.address || "Address not provided"}</p>
           <p className="text-sm text-gray-600">GSTIN: N/A</p>
        </div>

        {/* --- TABLE --- */}
        <table className="w-full border-collapse border border-gray-200 mb-8">
           <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs uppercase">
                 <th className="border border-gray-200 py-2 px-3 text-left w-12">#</th>
                 <th className="border border-gray-200 py-2 px-3 text-left">Medicine</th>
                 <th className="border border-gray-200 py-2 px-3 text-left">Batch</th>
                 <th className="border border-gray-200 py-2 px-3 text-center w-16">Qty</th>
                 <th className="border border-gray-200 py-2 px-3 text-right">Price</th>
                 <th className="border border-gray-200 py-2 px-3 text-right w-16">Tax %</th>
                 <th className="border border-gray-200 py-2 px-3 text-right">Tax Amt</th>
                 <th className="border border-gray-200 py-2 px-3 text-right">Total</th>
              </tr>
           </thead>
           <tbody className="text-sm text-gray-700">
              {invoiceItems.map((item, index) => (
                 <tr key={item.id}>
                    <td className="border border-gray-200 py-3 px-3 text-center">{index + 1}</td>
                    <td className="border border-gray-200 py-3 px-3">
                       <span className="font-bold block">{item.batch.product.name}</span>
                       <span className="text-xs text-gray-500">(Batch: {item.batch.batchNumber})</span>
                    </td>
                    <td className="border border-gray-200 py-3 px-3 uppercase">{item.batch.batchNumber.split("-")[1] || "BATCH"}</td>
                    <td className="border border-gray-200 py-3 px-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-200 py-3 px-3 text-right">INR {item.price.toFixed(2)}</td>
                    <td className="border border-gray-200 py-3 px-3 text-right text-gray-500">18%</td>
                    <td className="border border-gray-200 py-3 px-3 text-right">INR {item.taxAmount.toFixed(2)}</td>
                    <td className="border border-gray-200 py-3 px-3 text-right font-bold">INR {item.totalAmount.toFixed(2)}</td>
                 </tr>
              ))}
           </tbody>
        </table>

        {/* --- FOOTER SECTION --- */}
        <div className="flex justify-between items-start mt-4">
           
           {/* Left: Bank Details */}
           <div className="w-1/2">
              <h3 className="font-bold text-sm text-gray-800 mb-2">Bank Details:</h3>
              <p className="text-sm text-gray-600"><span className="font-medium">Bank:</span> HDFC Bank</p>
              <p className="text-sm text-gray-600"><span className="font-medium">A/C No:</span> XXXXXXXXX5678</p>
              <p className="text-sm text-gray-600"><span className="font-medium">IFSC:</span> HDFC0001234</p>

              {/* Terms */}
              <div className="mt-8">
                 <h3 className="font-bold text-sm text-gray-800 mb-1">Terms & Conditions:</h3>
                 <ul className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
                    <li>Goods once sold will not be taken back.</li>
                    <li>Interest @18% p.a. will be charged if not paid within due date.</li>
                 </ul>
              </div>
           </div>

           {/* Right: Totals & Sign */}
           <div className="w-1/2 pl-10">
              <div className="space-y-2 border-b border-gray-200 pb-4">
                 <div className="flex justify-between text-sm text-gray-600">
                    <span>Sub Total:</span>
                    <span>INR {subTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (18%):</span>
                    <span>INR {totalTax.toFixed(2)}</span>
                 </div>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 mt-3">
                 <span>Grand Total:</span>
                 <span>INR {grandTotal.toFixed(2)}</span>
              </div>

              {/* Signature */}
              <div className="mt-16 text-right">
                 <p className="text-xs font-bold text-gray-600 mb-10">For {shipment.sender.name}</p>
                 <p className="text-sm font-bold text-gray-900">Authorized Signatory</p>
              </div>
           </div>

        </div>

        {/* Print Button Overlay */}
        <div className="absolute top-10 right-10 no-print">
            <InvoicePrintButton />
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
          .min-h-screen { padding: 0; }
          .bg-white { box-shadow: none; width: 100%; }
        }
      `}</style>
    </div>
  );
}