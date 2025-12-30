// app/verify/[id]/page.tsx
import { prisma } from "@/lib/prisma";

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  // ১. Next.js 15 অনুযায়ী params থেকে ID বের করা
  const { id } = await params;

  // ২. আসল ডেটাবেস থেকে তথ্য খোঁজা
  const unit = await prisma.unit.findUnique({
    where: { uid: id },
    include: {
  batch: true,
  owner: true, // ✅ স্কিমায় নাম আছে 'owner'
},
  });

  // ৩. যদি ভুয়া QR কোড হয় (ডেটাবেসে না থাকে)
  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-sm w-full border border-red-200">
           <div className="text-5xl mb-4">❌</div>
           <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid QR Code</h2>
           <p className="text-gray-500 text-sm">
             This ID <strong>{id}</strong> was not found in our secure blockchain database.
           </p>
        </div>
      </div>
    );
  }

  // ৪. রিয়েল স্ট্যাটাস চেক করা
  const isRecalled = unit.batch.isRecalled;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-md border border-gray-200">
        
        {/* Status Header */}
        <div className={`text-center p-6 ${isRecalled ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          <div className="text-5xl mb-2">{isRecalled ? "⚠️" : "✅"}</div>
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            {isRecalled ? "WARNING: RECALLED" : "GENUINE MEDICINE"}
          </h2>
          <p className="text-sm font-medium mt-1 opacity-90">
            {isRecalled ? "Do not consume this medicine." : "Verified Safe by MedTrace"}
          </p>
        </div>

        {/* Medicine Details */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-500 text-sm">Medicine Name</span>
            <span className="font-bold text-gray-800 text-lg">{unit.batch.medicineName}</span>
          </div>
          
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-500 text-sm">Batch No</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{unit.batchId}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-500 text-sm">Type</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">
                {unit.type}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-3">
             <div className="text-left">
                <span className="text-gray-500 text-xs block uppercase">Mfg Date</span>
                <span className="text-gray-800 font-medium">{unit.batch.mfgDate}</span>
             </div>
             <div className="text-right">
                <span className="text-gray-500 text-xs block uppercase">Exp Date</span>
                <span className={`font-bold ${isRecalled ? 'text-red-600' : 'text-gray-800'}`}>
                  {unit.batch.expDate}
                </span>
             </div>
          </div>

          {/* লোকেশন ট্র্যাকিং (রিয়েল ডেটা) */}
          <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-bold uppercase mb-1 flex items-center gap-1">
              <span>📍</span> Current Status
            </p>
            <p className="text-blue-900 font-medium text-sm">
                {unit.currentHolder 
                    ? `With: ${unit.currentHolder.name} (${unit.currentHolder.role})` 
                    : "Stored at Manufacturing Plant"}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
          Security ID: {id}
        </div>
      </div>
    </div>
  );
}