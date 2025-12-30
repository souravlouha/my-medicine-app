import { prisma } from "@/lib/prisma";
import { Search, MapPin, Clock, ArrowRight } from "lucide-react";

export default async function TrackPage({ searchParams }: { searchParams: { uid?: string } }) {
  const uid = searchParams.uid;
  let unit = null;

  if (uid) {
    unit = await prisma.unit.findUnique({
      where: { uid: uid },
      include: { 
        batch: { include: { manufacturer: true } },
        owner: true 
      }
    });
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Bar */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h1 className="text-2xl font-black text-gray-800 uppercase mb-4 tracking-tighter">🔍 Trace Medicine Journey</h1>
          <form className="flex gap-4">
            <input 
              name="uid" 
              defaultValue={uid}
              placeholder="Enter Strip UID (e.g. STRIP-123...)" 
              className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Track</button>
          </form>
        </div>

        {unit ? (
          <div className="space-y-6">
            {/* Unit Info Card */}
            <div className="bg-[#0D1B3E] p-8 rounded-[40px] text-white shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Authentic Medicine</p>
                  <h2 className="text-3xl font-black mt-1">{unit.batch.medicineName}</h2>
                  <p className="opacity-60 font-mono text-sm uppercase">Batch: {unit.batchId}</p>
                </div>
                <div className="text-right">
                  <span className="bg-blue-500/20 text-blue-300 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                    {unit.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
              <h3 className="text-lg font-black text-gray-800 uppercase mb-8 flex items-center gap-2">
                <MapPin className="text-blue-600" /> Ownership History
              </h3>
              
              <div className="space-y-8 relative">
                {/* Dynamic History from JSON */}
                {(unit.history as any[]).map((h, index) => (
                  <div key={index} className="flex gap-6 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded-full z-10"></div>
                      {index !== (unit.history as any[]).length - 1 && <div className="w-0.5 h-full bg-blue-100 absolute top-4"></div>}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12}/> {new Date(h.date).toLocaleString()}
                      </p>
                      <h4 className="text-lg font-bold text-gray-800">
                        {h.from} <ArrowRight className="inline mx-2 text-gray-300" size={16}/> {h.to}
                      </h4>
                      <p className="text-sm text-gray-500 font-medium italic">Handed over to {h.toId}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : uid && (
          <div className="text-center p-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest italic text-sm">❌ No records found for this UID. Possible counterfeit or data error.</p>
          </div>
        )}
      </div>
    </div>
  );
}