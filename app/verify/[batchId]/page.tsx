import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, Box, Calendar, MapPin, AlertTriangle, Package } from "lucide-react";

export default async function PublicTrackingPage({ params }: { params: Promise<{ batchId: string }> }) {
  
  const resolvedParams = await params;
  let { batchId } = resolvedParams;

  // ১. URL ডিকোড করা (যাতে %20 বা অন্য চিহ্ন সমস্যা না করে)
  batchId = decodeURIComponent(batchId);

  console.log("🔍 Searching for ID:", batchId);

  // ২. প্রথমে ব্যাচ টেবিলে খোঁজা (যদি মেইন ব্যাচ QR হয়)
  let batch = await prisma.batch.findFirst({
    where: {
        OR: [
            { batchNumber: batchId }, 
            { id: batchId }
        ]
    }, 
    include: {
      product: true,
      manufacturer: { select: { name: true, address: true } },
    },
  });

  let scannedUnitType = "BATCH"; // ডিফল্ট

  // ৩. যদি ব্যাচ না পাওয়া যায়, তাহলে ইউনিট (Strip/Box/Carton) টেবিলে খোঁজা
  if (!batch) {
    const unit = await prisma.unit.findUnique({
        where: { uid: batchId },
        include: {
            batch: {
                include: {
                    product: true,
                    manufacturer: { select: { name: true, address: true } }
                }
            }
        }
    });

    if (unit) {
        batch = unit.batch; // ইউনিটের প্যারেন্ট ব্যাচটি আমরা পেলাম
        scannedUnitType = unit.type; // এটি কি STRIP, BOX না CARTON তা জানলাম
    }
  }

  // ৪. যদি তবুও কিছু না পাওয়া যায় - Error UI
  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-red-50">
        <div className="bg-white p-4 rounded-full shadow-md mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-red-700">Invalid Medicine!</h1>
        <p className="text-gray-600 mt-2">
            The ID <span className="font-mono font-bold bg-gray-200 px-1 rounded break-all">{batchId}</span> was not found.
        </p>
        <p className="text-xs text-gray-400 mt-6">Possible fake product.</p>
      </div>
    );
  }

  const isExpired = new Date() > new Date(batch.expDate);

  // ৫. সফল UI
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      
      {/* Header */}
      <div className="bg-blue-600 p-8 rounded-b-[40px] shadow-xl text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <h1 className="text-2xl font-bold relative z-10">MedTrace Verified</h1>
        
        <div className="mt-4 flex justify-center gap-2">
            <div className="bg-white/20 border border-white/30 p-2 rounded-full inline-flex items-center gap-2 px-4 backdrop-blur-md relative z-10 shadow-sm">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span className="font-bold text-xs tracking-wide">Authentic Product</span>
            </div>
            
            {/* Scanned Unit Badge */}
            {scannedUnitType !== "BATCH" && (
                <div className="bg-purple-500/30 border border-white/30 p-2 rounded-full inline-flex items-center gap-2 px-4 backdrop-blur-md relative z-10 shadow-sm">
                    <Package className="w-4 h-4 text-purple-200" />
                    <span className="font-bold text-xs tracking-wide">{scannedUnitType} Verified</span>
                </div>
            )}
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-6 relative z-20">
        
        {/* Product Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-black text-gray-800 leading-tight">{batch.product.name}</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">{batch.product.genericName}</p>
          
          <div className="mt-6 flex gap-3 text-sm">
            <div className="bg-blue-50 p-4 rounded-2xl flex-1 text-center border border-blue-100">
               <p className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">Batch No</p>
               <p className="font-mono font-bold text-gray-800 text-lg mt-1">{batch.batchNumber}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl flex-1 text-center border border-purple-100">
               <p className="text-purple-500 text-[10px] font-bold uppercase tracking-wider">Price (MRP)</p>
               <p className="font-mono font-bold text-gray-800 text-lg mt-1">₹{batch.mrp}</p>
            </div>
          </div>
        </div>

        {/* Status Card (Expired or Safe) */}
        {isExpired ? (
            <div className="bg-red-50 border border-red-200 p-5 rounded-3xl flex items-start gap-4 text-red-800 shadow-sm">
                <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600"/>
                </div>
                <div>
                    <p className="font-bold text-lg">EXPIRED PRODUCT</p>
                    <p className="text-sm opacity-90 mt-1">This medicine expired on {new Date(batch.expDate).toLocaleDateString()}. Do not use.</p>
                </div>
            </div>
        ) : (
            <div className="bg-green-50 border border-green-200 p-5 rounded-3xl flex items-start gap-4 text-green-800 shadow-sm">
                <div className="bg-green-100 p-2 rounded-full">
                    <Calendar className="w-6 h-6 text-green-600"/>
                </div>
                <div>
                    <p className="font-bold text-lg">Valid & Safe to Use</p>
                    <p className="text-sm opacity-90 mt-1">Expiry Date: <span className="font-bold">{new Date(batch.expDate).toLocaleDateString()}</span></p>
                </div>
            </div>
        )}

        {/* Manufacturer Details */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-400 text-xs uppercase mb-4 flex items-center gap-2 tracking-wider">
                Manufactured By
            </h3>
            <div className="flex gap-4 items-start">
                <div className="bg-gray-100 p-3 rounded-xl">
                    <Box className="w-6 h-6 text-gray-600"/>
                </div>
                <div>
                    <p className="font-bold text-gray-900 text-lg">{batch.manufacturer.name}</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-start gap-2 leading-relaxed">
                        <MapPin className="w-4 h-4 shrink-0 mt-1 text-gray-400"/> 
                        {batch.manufacturer.address}
                    </p>
                </div>
            </div>
        </div>

      </div>
      
      <p className="text-center text-[10px] text-gray-300 mt-6 uppercase tracking-widest">Secured by MedTrace</p>
    </div>
  );
}