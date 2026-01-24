"use client";

import { useState, useEffect } from "react";
import { createPrintJob, getAvailableBatches, getActiveJobs, toggleJobStatus } from "@/lib/actions/production-actions"; 
import { getOperators } from "@/lib/actions/team-actions"; 
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, Package, Printer, Clock, Play, Pause, XCircle, RefreshCw, Activity, User, Plus, Minus } from "lucide-react";

export default function AssignJobPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // 🕒 Time Control State (Default 8 Hours)
  const [validity, setValidity] = useState(8);

  // ১. ডাটা লোড করা
  async function loadData() {
    const batchData = await getAvailableBatches();
    if(batchData?.batches) setBatches(batchData.batches);

    const jobData = await getActiveJobs();
    if(jobData.success) setActiveJobs(jobData.data);

    const opData = await getOperators();
    if(opData.success) setOperators(opData.data);
  }

  useEffect(() => {
    loadData();
  }, []);

  // ২. রিফ্রেশ বাটন হ্যান্ডলার
  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // ৩. নতুন জব তৈরি হ্যান্ডলার
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const res = await createPrintJob(formData);
    
    if (res.success) {
      setGeneratedCode(res.code);
      await loadData(); // লিস্ট আপডেট হবে
    } else {
      alert("Failed: " + res.error);
    }
    setLoading(false);
  }

  // ৪. স্ট্যাটাস কন্ট্রোল হ্যান্ডলার
  async function handleStatusChange(jobId: string, action: 'PAUSE' | 'RESUME' | 'CANCEL') {
    if(!confirm(`Are you sure you want to ${action} this job?`)) return;
    await toggleJobStatus(jobId, action);
    handleRefresh();
  }

  // 🕒 সময় বাড়ানোর ফাংশন
  const increaseTime = () => {
    if (validity < 24) setValidity(validity + 1);
  };

  // 🕒 সময় কমানোর ফাংশন
  const decreaseTime = () => {
    if (validity > 1) setValidity(validity - 1);
  };

  // ✅ সফল হলে পপআপ দেখাবে (Updated with Time Info)
  if (generatedCode) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300 border border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Access Granted!</h2>
          <p className="text-slate-500 mb-6">Share this temporary code with the operator.</p>
          
          <div className="bg-slate-900 text-emerald-400 text-5xl font-mono font-bold py-6 rounded-2xl mb-4 tracking-[0.2em] border-4 border-slate-800 shadow-xl select-all">
            {generatedCode}
          </div>
          
          <div className="flex justify-center gap-2 mb-8 text-xs font-bold text-slate-400 uppercase tracking-wide">
            <span className="flex items-center gap-1"><Clock size={12}/> Valid for {validity} Hours</span>
            <span>•</span>
            <span>One-time Use</span>
          </div>

          <button 
            onClick={() => setGeneratedCode(null)} 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Close & Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/dashboard/manufacturer/production" className="flex items-center gap-2 text-slate-500 font-medium hover:text-slate-800 transition">
          <ArrowLeft size={20}/> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 hidden md:block">Production Control</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📝 LEFT COLUMN: ASSIGN FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-10">
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Printer className="text-blue-600" size={20}/> Assign New Job
            </h2>
            <p className="text-slate-400 text-xs mb-6">Create a task for the production floor.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* ১. অপারেটর সিলেক্ট */}
              <div>
                <label className="font-bold block mb-2 text-xs text-slate-500 uppercase">Assign To (Operator)</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                  <select name="operatorId" className="w-full pl-11 p-3 border rounded-xl bg-slate-50 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition" required>
                    <option value="">-- Select Operator --</option>
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ২. ব্যাচ সিলেকশন */}
              <div>
                <label className="font-bold block mb-2 text-xs text-slate-500 uppercase">Select Batch</label>
                <div className="relative">
                  <Package className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                  <select name="batchId" className="w-full pl-11 p-3 border rounded-xl bg-slate-50 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition" required>
                    <option value="">-- Choose Batch --</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} - {b.product?.name} ({b.totalQuantity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ৩. Quantity */}
              <div>
                <label className="font-bold block mb-2 text-xs text-slate-500 uppercase">Target Qty</label>
                <input name="targetQty" type="number" className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-medium outline-none" required placeholder="e.g. 5000" />
              </div>

              {/* ৪. Machine */}
              <div>
                <label className="font-bold block mb-2 text-xs text-slate-500 uppercase">Machine / Line</label>
                <select name="machineName" className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-medium outline-none">
                  <option value="Line-1">Line 1 (High Speed)</option>
                  <option value="Line-2">Line 2 (Standard)</option>
                  <option value="Manual">Manual Station</option>
                </select>
              </div>

              {/* ✅ ৫. টাইম কন্ট্রোল (NEW FEATURE) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div className="flex justify-between items-center mb-3">
                    <label className="font-bold text-xs text-slate-500 uppercase flex items-center gap-1">
                        <Clock size={14}/> Access Validity
                    </label>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Expires in {validity} Hours
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <button type="button" onClick={decreaseTime} className="p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-sm active:scale-95">
                        <Minus size={18} className="text-slate-600"/>
                    </button>
                    
                    <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-slate-800">{validity}</span>
                        <span className="text-xs text-slate-400 block font-bold uppercase">Hours</span>
                    </div>
                    
                    <button type="button" onClick={increaseTime} className="p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-sm active:scale-95">
                        <Plus size={18} className="text-slate-600"/>
                    </button>
                 </div>
                 
                 {/* Hidden input to send value to server */}
                 <input type="hidden" name="validity" value={validity} />
              </div>

              <button 
                disabled={loading} 
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Generate Job Code"}
              </button>
            </form>
          </div>
        </div>

        {/* 📺 RIGHT COLUMN: LIVE MONITOR */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-emerald-500" size={20}/> Live Operators
            </h2>
            <button 
              onClick={handleRefresh} 
              className={`p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18}/>
            </button>
          </div>

          {activeJobs.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
              <p className="text-slate-400">No active jobs. Assign a job to see it here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-4">
                  
                  {/* Job Info */}
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {job.accessCode}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        job.status === 'PENDING' || job.status === 'PRINTING' ? 'bg-green-100 text-green-700' :
                        job.status === 'PAUSED' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800">{job.batch.product.name}</h3>
                    <p className="text-sm text-slate-500">Batch: {job.batch.batchNumber} • Machine: {job.machineName}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 w-full max-w-xs">
                       <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                          <span>{job.printedQuantity} Printed</span>
                          <span>Target: {job.targetQuantity}</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${job.status === 'PAUSED' ? 'bg-amber-400' : 'bg-blue-600'}`} 
                            style={{width: `${(job.printedQuantity / job.targetQuantity) * 100}%`}}
                          ></div>
                       </div>
                    </div>
                  </div>

                  {/* 🎮 Controls */}
                  <div className="flex gap-2">
                    {job.status === 'PAUSED' ? (
                      <button 
                        onClick={() => handleStatusChange(job.id, 'RESUME')}
                        title="Resume Job"
                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition border border-green-200"
                      >
                        <Play size={20} fill="currentColor"/>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusChange(job.id, 'PAUSE')}
                        title="Pause Job"
                        className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition border border-amber-200"
                      >
                        <Pause size={20} fill="currentColor"/>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleStatusChange(job.id, 'CANCEL')}
                      title="Reject/Cancel Job"
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition border border-red-200"
                    >
                      <XCircle size={20}/>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}