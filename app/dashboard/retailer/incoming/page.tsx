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

  let shipments = [];
  let errorMsg = "";

  try {
    // ২. শিপমেন্ট খোঁজা (রিলেশন নামগুলো এখানে গুরুত্বপূর্ণ)
    shipments = await prisma.shipment.findMany({
      where: {
        distributorId: user.id, // আপনার আইডি
        status: "IN_TRANSIT"
      },
      include: {
        // রিলেশন নামগুলো ঠিক করার চেষ্টা:
        // আপনার স্কিমাতে যদি 'manufacturer' নামে রিলেশন না থাকে, তবে এটি 'User' বা 'sender' হতে পারে।
        // সেফটির জন্য আমরা এখন শুধু 'shipmentItems' বা 'ShipmentItem' ট্রাই করব।
        
        manufacturer: true, // যদি এরর দেয়, বুঝবেন এই নামটা ভুল
        
        // কমন ভুল: স্কিমাতে নাম 'ShipmentItem' (বড় হাতের) হতে পারে
        // আমরা এখানে 'ShipmentItem' ব্যবহার করছি কারণ টেবিলে নাম সেটাই ছিল
        ShipmentItem: { 
          include: {
            batch: { include: { product: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    // যদি উপরের কোড ফেইল করে, আমরা রিলেশন ছাড়াই ডেটা আনার চেষ্টা করব (ফলব্যাক)
    try {
        shipments = await prisma.shipment.findMany({
            where: { distributorId: user.id, status: "IN_TRANSIT" }
        });
        errorMsg = "Note: Item details could not be loaded due to a system error, but shipments are listed.";
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
             // রিলেশন নাম হ্যান্ডেল করা (ShipmentItem নাকি shipmentItems)
             const items = shipment.ShipmentItem || shipment.shipmentItems || [];
             const senderName = shipment.manufacturer?.name || "Distributor";

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