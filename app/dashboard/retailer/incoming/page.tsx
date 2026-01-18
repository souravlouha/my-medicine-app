import { prisma } from "@/lib/prisma";
import { Truck, PackageCheck, Clock, AlertCircle } from "lucide-react";

export default async function IncomingStockPage() {
  // ১. ইউজার খুঁজে বের করা
  const user = await prisma.user.findFirst({
    where: { role: "RETAILER" }
  });

  if (!user) {
    return (
      <div className="p-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
        <AlertCircle className="mx-auto mb-2" />
        <p>User profile not found. Please log in again.</p>
      </div>
    );
  }

  // ✅ FIX: টাইপ সেফটির জন্য explicit type
  let shipments: any[] = [];
  let errorMsg = "";

  try {
    // ২. শিপমেন্ট খোঁজা
    shipments = await prisma.shipment.findMany({
      where: {
        distributorId: user.id,
        status: "IN_TRANSIT"
      },
      include: {
        // ✅ FIX: রিলেশন নামগুলো আপনার স্কিমা অনুযায়ী ঠিক করা হলো
        sender: true,   // আগে ছিল manufacturer (ভুল)
        items: {        // আগে ছিল ShipmentItem (ভুল)
          include: {
            batch: { include: { product: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    // ফলব্যাক: যদি রিলেশনে সমস্যা হয়, শুধু বেসিক ডাটা আনবে
    try {
        shipments = await prisma.shipment.findMany({
            where: { distributorId: user.id, status: "IN_TRANSIT" },
            include: { sender: true } // অন্তত সেন্ডারের নামটা আনার চেষ্টা
        });
        errorMsg = "Note: Some item details could not be loaded, but shipments are listed.";
    } catch (e) {
        errorMsg = "Failed to load shipments. Please contact support.";
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Truck className="text-blue-600" /> Incoming Shipments
      </h1>

      {errorMsg && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={16}/> {errorMsg}
        </div>
      )}

      {shipments.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-dashed text-center">
            <p className="text-slate-400">No incoming shipments found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {shipments.map((shipment: any) => {
             // ✅ FIX: সঠিক রিলেশন নাম ব্যবহার করা হচ্ছে
             const items = shipment.items || [];
             const senderName = shipment.sender?.name || "Distributor";

             return (
                <div key={shipment.id} className="bg-white border p-6 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                       <p className="text-xs text-slate-400 font-bold uppercase">Shipped By</p>
                       <h3 className="font-bold text-lg text-slate-800">{senderName}</h3>
                       <p className="text-xs text-slate-500">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                        <Clock size={12} /> In Transit
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="bg-slate-50 rounded-lg overflow-hidden mb-4">
                      <table className="w-full text-sm text-left">
                         <thead className="bg-slate-100 text-slate-500">
                             <tr>
                                 <th className="p-3">Medicine</th>
                                 <th className="p-3">Batch</th>
                                 <th className="p-3 text-right">Qty</th>
                             </tr>
                         </thead>
                         <tbody>
                             {items.length > 0 ? items.map((item: any) => (
                                 <tr key={item.id} className="border-t border-slate-200">
                                     <td className="p-3 font-medium">{item.batch?.product?.name || "Unknown"}</td>
                                     <td className="p-3 font-mono text-xs">{item.batch?.batchNumber || "N/A"}</td>
                                     <td className="p-3 text-right font-bold">{item.quantity}</td>
                                 </tr>
                             )) : (
                                 <tr><td colSpan={3} className="p-3 text-center text-slate-400">Items details unavailable</td></tr>
                             )}
                         </tbody>
                      </table>
                  </div>

                  <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 flex justify-center items-center gap-2">
                    <PackageCheck size={18} /> Receive & Add to Inventory
                  </button>
                </div>
             );
          })}
        </div>
      )}
    </div>
  );
}