import { Truck, Package, AlertCircle } from "lucide-react";
import ReceiveButton from "./ReceiveButton";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function IncomingPage() {
  
  // সরাসরি কানেকশন স্ট্রিং ব্যবহার করা হচ্ছে (ফিক্সড)
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_0eZNGdXHm8gt@ep-damp-snow-adg1il0p.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&connect_timeout=30",
      },
    },
  });

  try {
    const shipments = await prisma.shipment.findMany({
      where: {
        status: "IN_TRANSIT"
      },
      orderBy: { createdAt: "desc" },
      include: { 
        // ❌ ভুল ছিল: manufacturer: true
        // ✅ সঠিক (তোমার স্কিমা অনুযায়ী): sender
        sender: true, 
        
        // ❌ ভুল ছিল: shipmentItems
        // ✅ সঠিক (তোমার স্কিমা অনুযায়ী): items
        items: { 
          include: { 
            batch: { include: { product: true } } 
          } 
        } 
      }
    });

    return (
      <div className="p-6">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Incoming Shipments</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              Total: {shipments.length}
            </span>
         </div>
         
         {shipments.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
             <Package className="mx-auto h-16 w-16 text-slate-300 mb-4" />
             <h3 className="text-lg font-medium text-slate-600">No shipments found</h3>
             <p className="text-slate-400 mt-1">There are no shipments currently in transit.</p>
           </div>
         ) : (
           <div className="grid gap-6">
              {shipments.map(shipment => (
                  <div key={shipment.id} className="bg-white border p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200">
                      <div className="flex justify-between mb-4 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                              <div className="bg-blue-50 p-2.5 rounded-lg">
                                <Truck className="text-blue-600 h-6 w-6"/>
                              </div>
                              <div>
                                  {/* ✅ manufacturer.name এর বদলে sender.name ব্যবহার করা হলো */}
                                  {/* @ts-ignore */}
                                  <h3 className="font-bold text-lg text-slate-800">{shipment.sender?.name || "Unknown Sender"}</h3>
                                  <p className="text-xs text-slate-400 font-mono">ID: {shipment.id.slice(0, 8)}...</p>
                              </div>
                          </div>
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 h-fit rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                              In Transit
                          </span>
                      </div>
                      
                      {/* Items List */}
                      <div className="bg-slate-50 p-4 rounded-lg text-sm mb-5 space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Package Contents</p>
                          {/* ✅ shipmentItems এর বদলে items ব্যবহার করা হলো */}
                          {/* @ts-ignore */}
                          {shipment.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                                  <div>
                                    <span className="font-medium text-slate-700 block">{item.batch.product.name}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Batch: {item.batch.batchNumber}</span>
                                  </div>
                                  <span className="font-bold bg-slate-100 px-2 py-1 rounded text-slate-700 text-xs">
                                    Qty: {item.quantity}
                                  </span>
                              </div>
                          ))}
                      </div>

                      <div>
                          <ReceiveButton shipmentId={shipment.id} />
                      </div>
                  </div>
              ))}
           </div>
         )}
      </div>
    );

  } catch (error) {
    console.error("Database Connection Error:", error);
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4"/>
        <h3 className="font-bold text-xl text-red-700 mb-2">Error Loading Data</h3>
        <p className="text-red-600 mb-4">Schema mismatch or connection issue.</p>
        <div className="text-left bg-white p-4 rounded border border-red-100 text-xs text-slate-500 font-mono overflow-auto max-h-40">
            {String(error)}
        </div>
      </div>
    );
  } finally {
    await prisma.$disconnect();
  }
}