export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 p-4">
      
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-black text-slate-900">User Documentation</h1>
      </div>

      {/* PDF Viewer Container (BIGGER WINDOW) */}
      {/* পরিবর্তন ১: max-w-5xl সরিয়ে দেওয়া হয়েছে যাতে পুরো প্রস্থ জুড়ে থাকে */}
      {/* পরিবর্তন ২: h-[80vh] কে বাড়িয়ে h-[90vh] করা হয়েছে */}
      <div className="w-full h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        
        <iframe
          src="/manual.pdf" 
          className="w-full h-full"
          title="Documentation PDF"
        />

        {/* Fallback for Mobile */}
        <div className="absolute bottom-0 w-full bg-white/90 p-2 text-center text-sm text-slate-500 md:hidden">
           PDF not visible? <a href="/manual.pdf" target="_blank" className="text-blue-600 font-bold underline">Download Here</a>
        </div>
      </div>

      {/* Download Button */}
      <a 
        href="/manual.pdf" 
        download
        className="mt-4 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition flex items-center gap-2"
      >
        Download PDF File
      </a>

    </div>
  );
}