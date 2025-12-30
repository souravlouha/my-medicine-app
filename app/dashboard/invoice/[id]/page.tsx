import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Printer, Download, Pill, ShieldCheck } from "lucide-react";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  // ১. ইনভয়েস নম্বর (ID) দিয়ে ট্রান্সফার ডিটেইলস খুঁজে বের করা
  const transfer = await prisma.transfer.findUnique({
    where: { invoiceNo: params.id },
    include: {
      batch: true,
      fromUser: true,
      toUser: true,
    },
  });

  if (!transfer) return notFound();

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-10 font-sans print:bg-white print:p-0">
      {/* অ্যাকশন বাটন - প্রিন্ট করার জন্য (প্রিন্ট করার সময় এগুলো হাইড থাকবে) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Digital Invoice</h1>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* মূল ইনভয়েস কার্ড */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[40px] overflow-hidden border border-gray-100 print:shadow-none print:border-none print:rounded-none">
        
        {/* হেডার সেকশন */}
        <div className="bg-[#0D1B3E] p-10 text-white flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-blue-400" size={32} />
              <span className="text-2xl font-black tracking-tighter uppercase">MediChain <span className="text-blue-400">Secure</span></span>
            </div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Digital Traceability Receipt</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black tracking-tighter italic">INVOICE</h2>
            <p className="text-blue-200 font-mono text-sm mt-1">{transfer.invoiceNo}</p>
            <p className="text-xs font-bold opacity-60 mt-1 uppercase">Date: {new Date(transfer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="p-10">
          {/* প্রেরক ও প্রাপকের তথ্য */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 border-b border-gray-100 pb-12">
            {/* Sender (From) */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Issued By (Sender)</p>
              <div>
                <h3 className="text-xl font-black text-gray-800">{transfer.fromUser.name}</h3>
                <p className="text-blue-600 font-mono text-xs font-bold">ID: {transfer.fromUser.customId}</p>
              </div>
              <div className="text-sm text-gray-500 font-medium leading-relaxed">
                <p>{transfer.fromUser.fullAddress || "Address not provided"}</p>
                <p className="mt-2">📞 {transfer.fromUser.phone}</p>
                <p>📧 {transfer.fromUser.email}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase">License & Tax</p>
                <p className="text-xs font-bold text-gray-700">GST: {transfer.fromUser.gstNo || "N/A"}</p>
                <p className="text-xs font-bold text-gray-700">DL: {transfer.fromUser.licenseNo || "N/A"}</p>
              </div>
            </div>

            {/* Receiver (To) */}
            <div className="space-y-4 md:text-right md:flex md:flex-col md:items-end">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Billed To (Receiver)</p>
              <div>
                <h3 className="text-xl font-black text-gray-800">{transfer.toUser.name}</h3>
                <p className="text-green-600 font-mono text-xs font-bold">ID: {transfer.toUser.customId}</p>
              </div>
              <div className="text-sm text-gray-500 font-medium leading-relaxed">
                <p>{transfer.toUser.fullAddress || "Address not provided"}</p>
                <p className="mt-2">📞 {transfer.toUser.phone}</p>
                <p>📧 {transfer.toUser.email}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-full md:w-64">
                <p className="text-[9px] font-black text-gray-400 uppercase">Receiver Credentials</p>
                <p className="text-xs font-bold text-gray-700">GST: {transfer.toUser.gstNo || "N/A"}</p>
                <p className="text-xs font-bold text-gray-700">DL: {transfer.toUser.licenseNo || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* ওষুধের টেবিল */}
          <div className="mb-12">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-4 text-left">Medicine Details</th>
                  <th className="p-4 text-center">Batch ID</th>
                  <th className="p-4 text-center">Quantity</th>
                  <th className="p-4 text-right">Unit Price</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="text-gray-700">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Pill size={20} />
                      </div>
                      <div>
                        <p className="font-black text-gray-800 uppercase">{transfer.batch.medicineName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Exp: {new Date(transfer.batch.expDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-xs text-blue-500">{transfer.batchId}</td>
                  <td className="p-4 text-center font-black">{transfer.quantity} Strips</td>
                  <td className="p-4 text-right font-bold text-gray-500">₹{transfer.batch.pricePerStrip}</td>
                  <td className="p-4 text-right font-black text-gray-800 text-lg">₹{transfer.quantity * transfer.batch.pricePerStrip}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ফুটার ও কিউআর কোড এরিয়া */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-8 rounded-[32px] border border-gray-100 gap-8">
            <div className="flex-1 space-y-2">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Digital Authentication</h4>
              <p className="text-[10px] text-gray-400 font-bold leading-relaxed max-w-sm">
                This invoice is cryptographically generated and stored on the MediChain blockchain. Scan the QR code to verify the supply chain history of these units.
              </p>
            </div>
            
            {/* মাস্টার কিউআর কোড প্লেসহোল্ডার */}
            <div className="w-32 h-32 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-300 uppercase italic">
                 Master QR
               </div>
               <p className="text-[8px] font-black mt-2 text-blue-600 uppercase">Scan to Track</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[1em]">Authorized Digital Receipt</p>
          </div>
        </div>
      </div>
    </div>
  );
}