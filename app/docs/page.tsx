"use client";

import { useState } from "react";
import { FileText, Download, ChevronRight, Menu } from "lucide-react";

// ১. আপনার সব PDF এর লিস্ট এখানে তৈরি করুন
const documents = [
  {
    id: 1,
    title: "User Manual",
    description: "General guide for using the application.",
    file: "/manual.pdf", // public ফোল্ডারের ফাইলের নাম
  },
  {
    id: 2,
    title: "Installation Guide",
    description: "Step-by-step installation process.",
    file: "/installation.pdf", // উদাহরণ (ফাইলটি public এ থাকতে হবে)
  },
  {
    id: 3,
    title: "API Documentation",
    description: "Technical details for developers.",
    file: "/api-docs.pdf", // উদাহরণ
  },
  {
    id: 4,
    title: "Privacy Policy",
    description: "Our terms and conditions.",
    file: "/policy.pdf", // উদাহরণ
  },
];

export default function DocsPage() {
  // ২. সিলেক্ট করা PDF এর স্টেট (ডিফল্ট হিসেবে প্রথমটি)
  const [activeDoc, setActiveDoc] = useState(documents[0]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* ------------------------------------------------ */}
      {/* বাম পাশ: সেগমেন্ট / ডকুমেন্ট লিস্ট (SIDEBAR)       */}
      {/* ------------------------------------------------ */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex-shrink-0 h-auto md:h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Menu size={20} className="text-blue-600"/> 
            Documents
          </h1>
          <p className="text-xs text-slate-500 mt-1">Select a segment to read</p>
        </div>

        <div className="p-4 space-y-2">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 border flex items-center justify-between group ${
                activeDoc.id === doc.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-100 hover:border-blue-200 hover:bg-blue-50"
              }`}
            >
              <div>
                <h3 className={`font-bold text-sm ${activeDoc.id === doc.id ? "text-white" : "text-slate-800"}`}>
                  {doc.title}
                </h3>
                <p className={`text-[10px] mt-0.5 ${activeDoc.id === doc.id ? "text-blue-100" : "text-slate-400"}`}>
                  {doc.description}
                </p>
              </div>
              {activeDoc.id === doc.id && <ChevronRight size={16} className="text-white"/>}
            </button>
          ))}
        </div>
      </aside>

      {/* ------------------------------------------------ */}
      {/* ডান পাশ: মেইন ভিউয়ার (PDF VIEWER)                */}
      {/* ------------------------------------------------ */}
      <main className="flex-1 p-4 md:p-8 flex flex-col h-screen overflow-hidden">
        
        {/* Active Document Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <FileText size={20}/>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{activeDoc.title}</h2>
              <p className="text-xs text-slate-500">Viewing: {activeDoc.file}</p>
            </div>
          </div>

          <a 
            href={activeDoc.file} 
            download
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition"
          >
            <Download size={14}/> Download
          </a>
        </div>

        {/* PDF Iframe */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
          <iframe
            key={activeDoc.id} // Key দিলে নতুন ফাইলে ফোর্স রিলোড হয়
            src={activeDoc.file} 
            className="w-full h-full"
            title={activeDoc.title}
          />
          
          {/* Fallback msg */}
          <div className="absolute bottom-0 w-full bg-white/90 p-2 text-center text-sm text-slate-500 md:hidden">
             PDF not showing? <a href={activeDoc.file} target="_blank" className="text-blue-600 font-bold underline">Open File</a>
          </div>
        </div>

      </main>

    </div>
  );
}