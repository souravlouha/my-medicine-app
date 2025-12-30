"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  // --- Hydration Fix ---
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- AI সার্চ লজিক ---
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setAiResult(null);
    setTimeout(() => {
      const mockDB: any = {
        "napa": { name: "Napa (Paracetamol)", use: "Fever & Pain Relief", desc: "Used to treat mild to moderate pain and reduce fever.", verified: true },
        "paracetamol": { name: "Paracetamol", use: "Analgesic", desc: "Commonly used for headache, muscle ache, and fevers.", verified: true },
        "monas": { name: "Monas 10", use: "Asthma", desc: "Prevents wheezing and difficulty breathing.", verified: true },
      };
      const key = query.toLowerCase().split(" ")[0];
      const result = mockDB[key] || {
        name: query,
        use: "General Medicine",
        desc: "Registered in our database. Consult a doctor for dosage.",
        verified: true
      };
      setAiResult(result);
      setLoading(false);
    }, 1500);
  };

  // --- 🔥 Live Blockchain Feed Data (Innovative Data Viz) ---
  const [activities, setActivities] = useState([
    { id: 1, drug: "Napa Extra", location: "Mumbai, IN", status: "Verified", time: "Just now" },
    { id: 2, drug: "Monas 10", location: "Dhaka, BD", status: "Verified", time: "2s ago" },
    { id: 3, drug: "Unknown Batch", location: "Delhi, IN", status: "Fake Detected", time: "5s ago" },
    { id: 4, drug: "Seclo 20", location: "Kolkata, IN", status: "Verified", time: "8s ago" },
    { id: 5, drug: "Paracetamol", location: "Chennai, IN", status: "Verified", time: "12s ago" },
  ]);

  // অটোমেটিক ফিড আপডেট ইফেক্ট
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = { 
          id: Date.now(), 
          drug: ["Napa", "Seclo", "Monas", "Fix Card", "Azith"][Math.floor(Math.random() * 5)], 
          location: ["Mumbai", "Delhi", "Kolkata", "Chennai", "Bangalore"][Math.floor(Math.random() * 5)] + ", IN", 
          status: Math.random() > 0.1 ? "Verified" : "Suspicious", 
          time: "Just now" 
        };
        return [newActivity, ...prev.slice(0, 4)];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- 📰 নিউজ ডেটা (৬টি বক্স, মিডিয়াম সাইজ) ---
  const newsUpdates = [
    { source: "India Today", color: "bg-red-600", title: "Govt mandates QR codes for top 300 drug brands", date: "Oct 25, 2025", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400", snippet: "Health Ministry has mandated barcoding for top-selling drug brands to curb counterfeits." },
    { source: "BBC World", color: "bg-red-700", title: "Global crackdown seizes $14m in fake pharmaceuticals", date: "Oct 22, 2025", image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=400", snippet: "Interpol's Operation Pangea XVI has targeted illicit online pharmacies worldwide." },
    { source: "The Hindu", color: "bg-blue-800", title: "Blockchain: The new shield for Indian Pharma", date: "Oct 20, 2025", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=400", snippet: "Major manufacturers are adopting blockchain ledgers for end-to-end traceability." },
    { source: "Times of India", color: "bg-black", title: "Fake diabetes drugs flooding the market", date: "Oct 18, 2025", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=400", snippet: "A surge in falsified insulin pens has been detected in multiple metro cities." },
    { source: "NDTV Health", color: "bg-orange-600", title: "How to spot fake medicine packaging", date: "Oct 15, 2025", image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=400", snippet: "Experts suggest checking for spelling errors, poor print quality, and broken seals." },
    { source: "Reuters", color: "bg-orange-500", title: "Pharma supply chain market to hit $500B", date: "Oct 10, 2025", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=400", snippet: "Investment in secure supply chain technologies is skyrocketing globally." },
  ];

  // --- কোটস ---
  const quotes = [
    "“The first wealth is health.” — Ralph Waldo Emerson",
    "“Safety is not an expensive gadget, it is a state of mind.” — Eleanor Everet",
    "“Counterfeit medicine is a silent killer.” — WHO",
    "“Trust, but verify.” — Russian Proverb",
    "“Technology is best when it brings people together.” — Matt Mullenweg",
  ];

  const partners = ["Cipla", "Sun Pharma", "Apollo Pharmacy", "Square", "Beximco", "MedPlus", "1mg", "Pfizer", "Dr. Reddy's", "Lupin"];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* CSS Styles */}
      <style jsx>{`
        /* সাধারণ স্ক্রল (ডান থেকে বামে - কোটস এর জন্য) */
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { display: flex; width: max-content; animation: scroll 30s linear infinite; }
        
        /* 🔥 রিভার্স স্ক্রল (বাম থেকে ডানে - কোম্পানির জন্য) */
        @keyframes scroll-reverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .animate-scroll-reverse { display: flex; width: max-content; animation: scroll-reverse 40s linear infinite; }
      `}</style>

      {/* --- 1. Navbar --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span className="text-xl font-bold text-blue-900 tracking-tight">MedTrace</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-600 cursor-pointer hover:text-blue-600">
                 🌐 
                 <select className="bg-transparent outline-none cursor-pointer">
                    <option>English</option>
                    <option>हिन्दी</option>
                    <option>বাংলা</option>
                 </select>
              </div>
              <Link href="/login" className="hidden md:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition">
                Partner Login
              </Link>
              <Link href="/verify/demo" className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                Scan Medicine
              </Link>
           </div>
        </div>
      </nav>

      {/* --- 2. Hero Section --- */}
      <div className="relative pt-24 pb-12 lg:pt-40 lg:pb-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col-reverse lg:flex-row items-center gap-10">
           <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 mb-6">
                 <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                 <span className="text-blue-700 text-[10px] md:text-xs font-bold uppercase tracking-wider">Blockchain Secured Network</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
                 Genuine Medicine. <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500">
                   Guaranteed Safety.
                 </span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                 Stop counterfeit drugs. Verify authenticity instantly with MedTrace's government-compliant tracking system.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                 <Link href="/verify/demo" className="w-full sm:w-auto px-6 py-3 bg-blue-700 text-white rounded-xl font-bold text-sm md:text-base shadow-xl shadow-blue-200 hover:bg-blue-800 transition flex items-center justify-center gap-2">
                    <span>📷</span> Scan QR Code
                 </Link>
                 <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold text-sm md:text-base hover:bg-gray-50 transition">
                    Manufacturer Login
                 </Link>
              </div>
           </div>
           <div className="flex-1 relative w-full max-w-md lg:max-w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
                 <img 
                    src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=1000&auto=format&fit=crop" 
                    alt="Pharma Technology"
                    className="w-full h-auto object-cover hover:scale-105 transition duration-700"
                 />
              </div>
           </div>
        </div>
      </div>

      {/* --- 3. Live Stats Strip --- */}
      <div className="bg-slate-900 border-y border-slate-800 py-6">
         <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-around gap-8 text-center">
            <div>
               <h3 className="text-3xl font-bold text-white">10M+</h3>
               <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Medicines Verified</p>
            </div>
            <div>
               <h3 className="text-3xl font-bold text-blue-400">500+</h3>
               <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Trusted Brands</p>
            </div>
         </div>
      </div>

      {/* --- 🔥 4. NEW: Innovative Live Network Feed (No Boring Charts) --- */}
      <div className="bg-[#0f172a] py-16 text-white relative overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full blur-[150px] opacity-10"></div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                   <span className="text-cyan-400 font-bold uppercase text-xs tracking-widest">Network Activity</span>
                   <h2 className="text-3xl font-bold mt-2">Live Traceability Ledger</h2>
                   <p className="text-gray-400 text-sm mt-1">Real-time scan verification across the secure network.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Live Data Stream
                </div>
            </div>

            {/* Innovative Data Visual: Live List instead of Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Big Impact Numbers */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:border-blue-500/50 transition">
                        <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Scans Today</h3>
                        <p className="text-5xl font-mono font-bold text-white">14,203</p>
                        <div className="w-full bg-gray-700 h-1 mt-4 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[70%] animate-pulse"></div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:border-red-500/50 transition">
                        <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Threats Blocked</h3>
                        <p className="text-5xl font-mono font-bold text-red-500">127</p>
                        <p className="text-xs text-red-300 mt-2">⚠️ Potential counterfeit detected</p>
                    </div>
                </div>

                {/* Right: Scrolling Feed */}
                <div className="bg-black/20 border border-white/10 p-6 rounded-2xl backdrop-blur-sm h-[300px] overflow-hidden relative">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 sticky top-0 bg-transparent">Recent Verifications</h3>
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 animate-fade-in-up">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${activity.status === "Verified" ? "bg-green-500" : "bg-red-500"}`}></span>
                                    <div>
                                        <p className="text-sm font-bold text-white">{activity.drug}</p>
                                        <p className="text-[10px] text-gray-400">{activity.location}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-bold ${activity.status === "Verified" ? "text-green-400" : "text-red-400"}`}>{activity.status}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Gradient Fade at bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none"></div>
                </div>
            </div>
         </div>
      </div>

      {/* --- 5. Trusted Partners (Left to Right Marquee) --- */}
      <div className="bg-white py-10 border-b border-gray-200 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trusted by Leading Manufacturers</p>
         </div>
         <div className="animate-scroll-reverse flex gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {[...partners, ...partners].map((partner, idx) => (
                <h3 key={idx} className="text-2xl md:text-3xl font-bold text-gray-300 hover:text-blue-900 cursor-default whitespace-nowrap">
                   {partner}
                </h3>
             ))}
         </div>
      </div>

      {/* --- 6. Scrolling Quotes (Right to Left) --- */}
      <div className="bg-blue-900 py-3 overflow-hidden border-b border-blue-800">
         <div className="max-w-full">
            <div className="animate-scroll flex gap-12 items-center">
               {[...quotes, ...quotes].map((quote, idx) => (
                  <span key={idx} className="text-white/80 text-sm font-medium whitespace-nowrap italic tracking-wide">
                     {quote}
                  </span>
               ))}
            </div>
         </div>
      </div>

      {/* --- 7. AI Medicine Search --- */}
      <div className="bg-slate-50 py-16 relative border-b border-gray-200">
         <div className="max-w-2xl mx-auto px-4 relative z-10">
            <div className="text-center mb-8">
               <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">AI Assistant</span>
               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Know Your Medicine</h2>
            </div>
            <form onSubmit={handleSearch} className="relative shadow-lg rounded-2xl">
               <input 
                 type="text" placeholder="Search medicine (e.g. Napa, Monas)..." value={query} onChange={(e) => setQuery(e.target.value)}
                 className="w-full p-4 pl-6 pr-14 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 text-base"
               />
               <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 px-4 rounded-xl text-white hover:bg-blue-700 transition">🔍</button>
            </form>
            {aiResult && !loading && (
               <div className="mt-6 bg-white border border-gray-200 p-5 rounded-xl shadow-md animate-fade-in-up flex gap-4">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0">💊</div>
                  <div>
                     <h3 className="font-bold text-gray-900 text-lg">{aiResult.name}</h3>
                     <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{aiResult.use}</span>
                     <p className="text-sm text-gray-600 mt-2">{aiResult.desc}</p>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* --- 8. News Section (6 Boxes, Medium Size) --- */}
      <div className="py-16 bg-white">
         <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-4">
               <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  Health & Pharma Updates
               </h2>
               <span className="text-xs font-bold text-gray-400 uppercase">Live Feed</span>
            </div>
            {/* Medium Sized Grid (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {newsUpdates.map((news, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group cursor-pointer h-full flex flex-col">
                     {/* Image at Top */}
                     <div className="h-40 overflow-hidden relative">
                        <img src={news.image} alt="News" className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                        <span className={`absolute top-2 left-2 ${news.color} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm`}>
                           {news.source}
                        </span>
                     </div>
                     {/* Content */}
                     <div className="p-4 flex flex-col flex-grow">
                        <p className="text-xs text-gray-400 font-bold mb-2">🗓️ {news.date}</p>
                        <h3 className="text-base font-bold text-gray-800 leading-snug mb-2 group-hover:text-blue-700 transition">
                           {news.title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                           {news.snippet}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* --- 9. App Download Banner (Exact Match) --- */}
      <div className="bg-blue-600 text-white py-16 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
         
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Verify Medicine on the Go!</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">Download the MedTrace app for instant QR scanning, detailed drug info, and reporting fake medicines directly to authorities.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-900 transition shadow-lg border border-white/10">
                  <span className="text-2xl">🍎</span>
                  <div className="text-left">
                     <p className="text-[10px] uppercase text-gray-300">Download on the</p>
                     <p className="text-sm leading-none font-bold">App Store</p>
                  </div>
               </button>
               <button className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-900 transition shadow-lg border border-white/10">
                  <span className="text-2xl">▶️</span>
                  <div className="text-left">
                     <p className="text-[10px] uppercase text-gray-300">Get it on</p>
                     <p className="text-sm leading-none font-bold">Google Play</p>
                  </div>
               </button>
            </div>
         </div>
      </div>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-200 py-10">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
               <span className="text-2xl">🛡️</span>
               <span className="text-lg font-bold text-blue-900">MedTrace</span>
            </div>
            <p className="text-gray-400 text-xs">
               © 2025 MedTrace Inc. West Bengal, India. <br/>
               Ensuring safety in every dose.
            </p>
         </div>
      </footer>
    </div>
  );
}