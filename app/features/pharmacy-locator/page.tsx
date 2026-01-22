"use client";

import Link from "next/link";
import { MapPin, Navigation, ArrowLeft, Sparkles } from "lucide-react";

export default function PharmacyLocator() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- Background Animation (সাজসজ্জা) --- */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/50 text-center">
        
        {/* --- Animated Icon --- */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          {/* Ping Effect */}
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          
          {/* Main Circle */}
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-500 w-28 h-28 rounded-full flex items-center justify-center shadow-blue-300 shadow-xl text-white">
             <MapPin size={48} />
          </div>

          {/* Floating Icon */}
          <div className="absolute -bottom-2 -right-2 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 text-emerald-500 animate-bounce">
             <Navigation size={20} fill="currentColor"/>
          </div>
        </div>

        {/* --- Text Content --- */}
        <div className="mb-2 flex items-center justify-center gap-2">
           <Sparkles size={16} className="text-amber-400"/>
           <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Under Construction</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4">
          Coming <span className="text-blue-600">Soon!</span>
        </h1>
        
        <p className="text-slate-500 mb-8 leading-relaxed font-medium">
           আমরা একটি শক্তিশালী <b>স্মার্ট ম্যাপ</b> তৈরি করছি। খুব শীঘ্রই আপনি জিপিএস-এর মাধ্যমে আপনার কাছের সব ফার্মেসি এবং ওষুধের স্টক দেখতে পাবেন।
        </p>

        {/* --- Upcoming Features List --- */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
           <span className="px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold text-blue-600">Live GPS</span>
           <span className="px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-600">Stock Check</span>
           <span className="px-4 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-[10px] font-bold text-purple-600">Route Map</span>
        </div>

        {/* --- Home Button --- */}
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-slate-200"
        >
          <ArrowLeft size={20} />
          হোম পেজে ফিরে যান
        </Link>
      </div>

      {/* Footer Text */}
      <p className="absolute bottom-6 text-slate-400 text-xs font-medium">
        My Medicine App &copy; 2026
      </p>
    </div>
  );
}