"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getJobDetails, updatePrintProgress, completePrintJob, getOperatorHistory } from "@/lib/actions/production-actions"; 
import { QRCodeSVG } from "qrcode.react"; 
import { 
  Loader2, Printer, StopCircle, Play, Box, QrCode, 
  Wifi, Activity, CheckCircle2, Factory, Database, Clock, Eye, User, FlaskConical, Pause, History, Send
} from "lucide-react";

export default function OperatorPanel() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const code = params.code as string;
  const operatorName = searchParams.get("name") || "Operator";

  const [job, setJob] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"IDLE" | "PRINTING" | "PAUSED" | "COMPLETED">("IDLE");
  const [printedCount, setPrintedCount] = useState(0);
  const [currentQRData, setCurrentQRData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ১. ডাটা লোড করা (FIXED: Added res.job check for TypeScript)
  const loadJobData = async () => {
    const res = await getJobDetails(code);
    
    // ✅ এখানে res.job চেকটি যোগ করা হয়েছে যাতে undefined এরর না আসে
    if (res.success && res.job) { 
      setJob(res.job);
      setPrintedCount(res.job.printedQuantity);
      
      if (res.job.status === "PAUSED") setStatus("PAUSED");
      else if (res.job.status === "COMPLETED") setStatus("COMPLETED");

      if (res.job.operatorId) {
          const histRes = await getOperatorHistory(res.job.operatorId);
          if (histRes.success) setHistory(histRes.data);
      }
    } else {
      router.push("/operator");
    }
    setLoading(false);
  };

  useEffect(() => { loadJobData(); }, [code]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const incrementProgress = async (nextCount: number) => {
    setPrintedCount(nextCount);
    if (job && (nextCount % 5 === 0 || nextCount === job.targetQuantity)) {
        await updatePrintProgress(job.id, nextCount); 
    }
  };

  const handleStart = () => {
    if (status === "COMPLETED" || !job) return;
    setStatus("PRINTING");
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ▶️ STARTING SEQUENCE...`]);

    intervalRef.current = setInterval(async () => {
        const check = await getJobDetails(code);
        if (check.success && check.job && check.job.status === "PAUSED") {
            handlePause();
            setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ⚠️ REMOTE PAUSE DETECTED`]);
            return;
        }

        setPrintedCount((prev) => {
            const nextCount = prev + 1;
            const target = job.targetQuantity;

            if (nextCount > target) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                return prev;
            }

            const unitUid = job.batch.units[nextCount - 1]?.uid || `STRIP-${job.batch.batchNumber}-${nextCount}`;
            setCurrentQRData({ uid: unitUid, batch: job.batch.batchNumber });
            setLogs(l => [...l.slice(-10), `[${new Date().toLocaleTimeString()}] PRINTED: ${unitUid}`]);

            incrementProgress(nextCount);

            return nextCount;
        });
    }, 1200);
  };

  const handlePause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus("PAUSED");
  };

  const handleSubmitBatch = async () => {
    if (!job) return;
    setIsSubmitting(true);
    const res = await completePrintJob(job.id);
    if (res.success) {
      setStatus("COMPLETED");
      setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ✅ BATCH SUCCESSFULLY SUBMITTED`]);
      alert("Batch Completed and Manufacturer Notified!");
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-r border-slate-200 pr-6 uppercase">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Factory size={24} /></div>
                <div>
                    <p className="text-[9px] text-slate-400 font-black">Manufacturer</p>
                    <h1 className="text-slate-900 text-lg font-black tracking-tight">MedTrace Pvt Ltd</h1>
                </div>
            </div>
            <div className="flex items-center gap-3 uppercase">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><User size={24} /></div>
                <div>
                    <p className="text-[9px] text-slate-400 font-black">Active Operator</p>
                    <h1 className="text-slate-800 text-lg font-bold">{operatorName}</h1>
                </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl font-mono">
             <span className="text-[9px] text-blue-400 block font-black uppercase">Batch</span>
             <span className="text-blue-700 font-bold">{job?.batch?.batchNumber}</span>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
             <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><FlaskConical size={14}/> Current Job</h2>
             <div className="space-y-4">
               <div className="text-xl font-black text-slate-900 leading-tight">{job?.batch?.product?.name}</div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between text-[10px] font-bold">
                 <span className="text-slate-400 uppercase">Target Qty</span>
                 <span className="text-blue-600 uppercase">{job?.targetQuantity} Units</span>
               </div>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-hidden h-60 flex flex-col">
             <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><History size={14} className="text-blue-500"/> History</h2>
             <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide">
               {history.map((h, i) => (
                 <div key={i} className="p-2.5 rounded-xl border border-slate-50 bg-slate-50/30">
                    <div className="flex justify-between font-bold text-[10px] text-slate-700">
                        <span>{h.batch.product.name}</span>
                        <CheckCircle2 size={12} className="text-emerald-500" />
                    </div>
                    <div className="text-[8px] font-mono text-slate-400 uppercase">{h.batch.batchNumber} • {h.targetQuantity} Units</div>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 h-40 flex flex-col font-mono text-[10px] shadow-xl">
            <div className="text-slate-500 border-b border-slate-800 pb-2 mb-2 flex justify-between uppercase">
              <span>System Logs</span>
              <div className={`w-2 h-2 rounded-full ${status === "PRINTING" ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
            </div>
            <div ref={scrollRef} className="overflow-y-auto space-y-1 flex-1 text-blue-200/60 scrollbar-hide">
              {logs.map((log, i) => <div key={i} className="border-l border-blue-500/20 pl-2">{log}</div>)}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-8 relative overflow-hidden h-[380px] flex flex-col items-center justify-center shadow-sm">
            <div className="absolute inset-0 bg-grid-slate-100/[0.5] bg-[length:25px_25px]"></div>
            
            {status === "PRINTING" ? (
              <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-40 h-40 relative mb-6">
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-[2rem] opacity-20 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_blue] animate-scan z-20"></div>
                  <QrCode size={100} className="m-auto text-blue-600/10 h-full w-full p-8" />
                </div>
                <h3 className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase animate-pulse">System Printing...</h3>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-30">
                 <Printer size={80} className="text-slate-300 mb-4" />
                 <h3 className="text-slate-400 font-black text-sm tracking-widest uppercase">Status: {status}</h3>
              </div>
            )}

            <div className="absolute bottom-0 left-0 w-full bg-slate-50 h-3">
              <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${(printedCount / (job?.targetQuantity || 1)) * 100}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Batch Progress</p>
                  <div className="text-5xl font-black text-slate-900">{printedCount}<span className="text-lg text-slate-300 ml-1">/{job?.targetQuantity}</span></div>
                </div>
                <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg">
                  {Math.round((printedCount / (job?.targetQuantity || 1)) * 100)}%
                </div>
             </div>

             <div className="flex items-center">
                {printedCount >= job?.targetQuantity && status !== "COMPLETED" ? (
                  <button 
                    onClick={handleSubmitBatch}
                    disabled={isSubmitting}
                    className="w-full h-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 animate-bounce"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={24} /> Confirm & Finish</>}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3 w-full h-full">
                    <button 
                        onClick={handleStart} 
                        disabled={status === "PRINTING" || status === "COMPLETED"} 
                        className="bg-blue-600 text-white rounded-3xl flex flex-col items-center justify-center gap-1 shadow-lg disabled:opacity-30 border-b-4 border-blue-800 active:translate-y-1 transition"
                    >
                      <Play size={24} fill="currentColor"/><span className="text-[10px] font-black uppercase">Start</span>
                    </button>
                    <button 
                        onClick={handlePause} 
                        disabled={status !== "PRINTING"} 
                        className="bg-amber-500 text-white rounded-3xl flex flex-col items-center justify-center gap-1 shadow-lg disabled:opacity-30 border-b-4 border-amber-700 active:translate-y-1 transition"
                    >
                      <Pause size={24} fill="currentColor"/><span className="text-[10px] font-black uppercase">Pause</span>
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-blue-100 rounded-[3rem] overflow-hidden shadow-xl h-full flex flex-col">
            <div className="bg-slate-900 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Eye size={18} className="text-blue-400" />
                    <h2 className="text-white text-[10px] font-black uppercase tracking-widest">Live Preview</h2>
                </div>
                {status === "PRINTING" && <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>}
            </div>
            
            <div className="flex-1 p-6 flex flex-col items-center bg-slate-50 relative">
              {currentQRData ? (
                <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center w-full">
                  <div className="w-full aspect-square bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-8 flex items-center justify-center relative">
                    <QRCodeSVG value={currentQRData.uid} size={150} level="H" />
                  </div>
                  
                  <div className="w-full bg-white rounded-3xl p-5 border border-blue-50 shadow-inner space-y-3 font-mono text-[10px]">
                      <p className="text-blue-500 font-black uppercase flex items-center gap-2 tracking-tighter"><Database size={12}/> Encoded Data</p>
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-400">UID:</span>
                          <span className="text-slate-800 font-bold break-all ml-4 text-right">{currentQRData.uid}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-slate-400">BATCH:</span>
                          <span className="text-slate-800 font-bold">{currentQRData.batch}</span>
                      </div>
                      <div className="mt-4 bg-emerald-50 text-emerald-600 py-2 rounded-xl text-[9px] font-black text-center uppercase border border-emerald-100">Verification: Passed</div>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-20 flex flex-col items-center justify-center h-full">
                  <QrCode size={100} className="text-slate-300 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">Scanner Standby<br/>Waiting for sequence</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes scan { 0% { top: 0%; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { animation: scan 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}