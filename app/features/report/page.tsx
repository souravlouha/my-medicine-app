"use client";

import { useState } from "react";
import { ArrowLeft, AlertTriangle, Camera, MapPin, FileText, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { submitReportAction } from "@/lib/actions/report-actions"; // ✅ সার্ভার অ্যাকশন ইম্পোর্ট

export default function ReportFakePage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  // ✅ আপডেট করা হ্যান্ডলার
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Server Action কল করা হচ্ছে
    const result = await submitReportAction(formData);
    
    if (result.success) {
      setSubmitted(true);
    } else {
      alert("Failed to submit report. Please try again.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col items-center animate-in zoom-in duration-300 border border-slate-100">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-6 shadow-sm">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Report Received</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Thank you for helping us keep the community safe. Our team will investigate this issue immediately.
          </p>
          <Link href="/" className="w-full">
            <button className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg active:scale-95">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm border-b border-slate-200 sticky top-0 z-10 flex items-center gap-4">
        <Link href="/">
          <div className="bg-slate-100 p-2 rounded-full text-slate-600 active:scale-95 transition hover:bg-slate-200">
            <ArrowLeft size={20} />
          </div>
        </Link>
        <h1 className="text-lg font-bold text-slate-800">Report Counterfeit</h1>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 flex items-start gap-3">
          <div className="bg-white p-2 rounded-full text-red-500 shadow-sm shrink-0">
             <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-red-700 text-sm">Suspicious Medicine?</h3>
            <p className="text-red-600/80 text-xs mt-1 leading-relaxed">
              Please provide as much detail as possible. Your report is completely anonymous.
            </p>
          </div>
        </div>

        {/* ✅ ফর্ম ট্যাগ যোগ করা হয়েছে */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Medicine Name</label>
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 focus-within:ring-2 ring-red-500/20 transition shadow-sm">
              <FileText size={18} className="text-slate-400" />
              <input 
                name="medicineName" // ✅ Name attribute added
                required 
                type="text" 
                placeholder="e.g. Napa Extra" 
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-800" 
              />
            </div>
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Batch Number (Optional)</label>
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 focus-within:ring-2 ring-red-500/20 transition shadow-sm">
              <span className="text-slate-400 font-mono text-xs font-bold px-1">#</span>
              <input 
                name="batchNo" // ✅ Name attribute added
                type="text" 
                placeholder="e.g. B-2026-X" 
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-800" 
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Pharmacy / Location</label>
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 focus-within:ring-2 ring-red-500/20 transition shadow-sm">
              <MapPin size={18} className="text-slate-400" />
              <input 
                name="location" // ✅ Name attribute added
                required 
                type="text" 
                placeholder="Shop Name or Address" 
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-800" 
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Upload Evidence</label>
            <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 transition active:scale-95 group">
              <input type="file" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" />
              {image ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg">
                  <CheckCircle size={20} />
                  <span className="text-xs">{image.name.slice(0, 20)}...</span>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 p-3 rounded-full mb-3 group-hover:bg-slate-100 transition">
                    <Camera size={24} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-500">Tap to upload photo</span>
                </>
              )}
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Problem Description</label>
            <textarea 
                name="description" // ✅ Name attribute added
                className="w-full bg-white p-4 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-2 ring-red-500/20 transition h-28 resize-none shadow-sm text-slate-800" 
                placeholder="Why do you suspect this is fake? (e.g. bad packaging, weird smell, wrong color)"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button 
            disabled={submitting} 
            type="submit" 
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-red-500/20 active:scale-95 transition flex justify-center items-center gap-2 disabled:opacity-70 hover:bg-red-700"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <AlertTriangle size={20} />}
            {submitting ? "Submitting Report..." : "Report Fake Medicine"}
          </button>
        </form>
      </div>
    </div>
  );
}