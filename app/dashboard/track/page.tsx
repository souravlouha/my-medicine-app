import { Hammer, HardHat, Rocket } from "lucide-react";

export default function DashboardTrackingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-300 m-4">
      
      {/* অ্যানিমেশন আইকন */}
      <div className="relative mb-6">
        <div className="bg-blue-100 p-6 rounded-full animate-pulse">
            <Rocket size={48} className="text-blue-600" />
        </div>
        <div className="absolute -right-2 -bottom-2 bg-amber-100 p-2 rounded-full border-2 border-white">
            <HardHat size={24} className="text-amber-600" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
        Pro Tracking Suite
      </h1>
      
      <div className="bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block">
        Under Development
      </div>

      <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
        We are building an advanced <b>Real-time Supply Chain Visualization</b> tool for retailers. 
        Soon you will be able to see the entire history of every strip on a live map.
      </p>

      <div className="mt-8 flex gap-3 text-sm text-slate-400 bg-white px-6 py-3 rounded-xl border shadow-sm">
        <Hammer size={16} />
        <span>Estimated Launch: <b>Next Update</b></span>
      </div>
    </div>
  );
}