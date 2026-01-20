"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, QrCode, Search, Smartphone, Play, 
  MapPin, Bell, AlertTriangle, Mic as MicIcon, Activity, X, User, 
  CheckCircle2, ScanLine, ArrowRight, ChevronDown, 
  Zap, ArrowUpRight, Building2, Quote, ChevronRight,
  Truck, Box, BarChart3, Globe, Lock, FileText, Database, Menu,
  MoreHorizontal, Phone, History, Home, TrendingUp, TrendingDown,
  Loader2, Server, Layers, Award, Star
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // --- States for Mobile ---
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // --- 🔴 LIVE STATS STATE ---
  const [liveStats, setLiveStats] = useState({
    genuine: 14203,
    fake: 127
  });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFeatureClick = (feature: string) => {
    setToastMessage(`${feature} feature coming soon!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearching(true);
    setTimeout(() => {
      setAiResult({ 
        name: query, 
        status: "Verified Safe", 
        desc: "Batch #4429 • Exp: Dec 2028", 
        verified: true 
      });
      setSearching(false);
    }, 1500);
  };

  // --- Live Feed Simulation ---
  const [mobileActivities, setActivities] = useState([
    { id: 1, drug: "Napa Extra", location: "Kolkata", status: "Verified", time: "1s ago" },
    { id: 2, drug: "Monas 10", location: "Dhaka", status: "Verified", time: "5s ago" },
    { id: 3, drug: "Unknown Batch", location: "Delhi", status: "Fake Alert", time: "10s ago" },
    { id: 4, drug: "Seclo 20", location: "Mumbai", status: "Verified", time: "15s ago" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const isFake = Math.random() > 0.85; 
        const newActivity = { 
          id: Date.now(), 
          drug: ["Napa", "Seclo", "Monas", "Fix Card", "Azith", "Tylace"][Math.floor(Math.random() * 6)], 
          location: ["Mumbai", "Delhi", "Kolkata", "Chennai", "Bangalore", "Dhaka"][Math.floor(Math.random() * 6)], 
          status: isFake ? "Fake Alert" : "Verified", 
          time: "Just now" 
        };
        
        setLiveStats(prevStats => ({
          genuine: isFake ? prevStats.genuine : prevStats.genuine + 1,
          fake: isFake ? prevStats.fake + 1 : prevStats.fake
        }));

        return [newActivity, ...prev.slice(0, 4)];
      });
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  const partners = ["Pfizer", "Novartis", "Cipla", "Sun Pharma", "GSK", "Apollo Pharmacy", "Square", "Beximco"];
  const quotes = [
    "“Counterfeit medicine is a silent killer.” — WHO",
    "“Trust, but verify.” — MedTrace",
    "“Safety first, always.” — HealthMin",
    "“Technology saves lives.” — Digital Health Alliance"
  ];

  // ✅ New Testimonials Data (আলাদা আলাদা নাম)
  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Director of Logistics, Cipla",
      quote: "MedTrace has completely revolutionized our supply chain visibility. We can now track every unit with 100% accuracy."
    },
    {
      id: 2,
      name: "Priya Desai",
      role: "Head of Quality, Sun Pharma",
      quote: "Counterfeit drugs were a massive headache for us. MedTrace's blockchain ledger eliminated that risk overnight."
    },
    {
      id: 3,
      name: "Vikram Malhotra",
      role: "Supply Chain Lead, Dr. Reddy's",
      quote: "Seamless integration with our existing SAP systems. The real-time analytics dashboard is a game-changer."
    }
  ];

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* CSS for Scrolling */}
      <style jsx>{`
        @keyframes scroll { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(-50%); } 
        }
        @keyframes scroll-reverse { 
          0% { transform: translateX(-50%); } 
          100% { transform: translateX(0); } 
        }
        .animate-scroll { display: flex; width: max-content; animation: scroll 25s linear infinite; }
        .animate-scroll-reverse { display: flex; width: max-content; animation: scroll-reverse 25s linear infinite; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --------------------------------------------------------------------------------
          📱 MOBILE VIEW: CONSUMER APP
         -------------------------------------------------------------------------------- */}
      <div className="md:hidden bg-[#F8FAFC] min-h-screen pb-32 relative overflow-hidden">
         
         {/* -- Background Gradient -- */}
         <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-blue-700 to-[#F8FAFC] rounded-b-[3rem] z-0"></div>

         {/* -- Top Floating Header -- */}
         <div className="fixed top-4 left-0 right-0 z-50 px-4">
            <div className="bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-white/50 p-2.5 flex justify-between items-center px-5">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-full text-white"><ShieldCheck size={16}/></div>
                    <span className="font-bold text-slate-800 text-sm tracking-tight">MedTrace</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full text-slate-600 relative cursor-pointer hover:bg-slate-200 transition">
                        <Bell size={18}/>
                        <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500">
                        <User size={18}/>
                    </div>
                </div>
            </div>
         </div>

         {/* -- Mobile Hero Content -- */}
         <div className="relative z-10 px-6 pt-28 pb-6 text-white">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Stay Safe</p>
                    <h1 className="text-3xl font-black leading-tight">
                    Verify Medicine <br/> Instantly
                    </h1>
                </div>
            </div>
            
            {/* Big Action Card */}
            <Link href="/track">
               <div className="bg-white text-slate-900 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group active:scale-[0.98] transition duration-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10 flex items-center justify-between">
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-600 text-white p-2 rounded-xl"><QrCode size={24}/></div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">AI Powered</span>
                        </div>
                        <p className="font-bold text-xl">Tap to Scan</p>
                        <p className="text-slate-400 text-xs mt-1">Check authenticity instantly</p>
                     </div>
                     <div className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg animate-pulse">
                        <ScanLine size={24}/>
                     </div>
                  </div>
               </div>
            </Link>
         </div>

         {/* -- AI Search -- */}
         <div className="px-6 mb-6 relative z-10 -mt-2">
            <div className="bg-white p-2 rounded-[1.5rem] shadow-lg border border-slate-100 flex items-center">
               <div className="pl-4 text-slate-400"><Search size={20}/></div>
               <input 
                  type="text" 
                  placeholder="Check medicine name..." 
                  className="w-full p-3 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
               />
               <button onClick={handleSearch} className="bg-slate-900 p-3 rounded-xl text-white shadow-lg active:scale-90 transition">
                  {searching ? <Activity size={20} className="animate-spin"/> : <ArrowRight size={20}/>}
               </button>
            </div>
            {aiResult && (
               <div className="mt-4 bg-white p-4 rounded-[1.5rem] border-l-4 border-emerald-500 shadow-sm flex items-center gap-4 animate-fade-in-up">
                  <div className="bg-emerald-100 p-2.5 rounded-full text-emerald-600"><CheckCircle2 size={20}/></div>
                  <div>
                     <h4 className="font-bold text-slate-900 text-sm">{aiResult.name}</h4>
                     <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{aiResult.status}</p>
                  </div>
               </div>
            )}
         </div>

         {/* -- ✅ Quick Actions Grid -- */}
         <div className="px-6 relative z-10">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-900 text-sm tracking-wide">Quick Services</h3>
               <MoreHorizontal size={20} className="text-slate-400"/>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-8">
               
               {/* 📍 PHARMACY LOCATOR CARD */}
               <Link href="/features/pharmacy-locator" className="col-span-2">
                  <div className="bg-blue-600 text-white p-4 rounded-[1.5rem] shadow-lg shadow-blue-500/20 active:scale-95 transition cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden">
                      <div className="relative z-10">
                          <MapPin size={24} className="opacity-80 mb-2"/>
                          <div>
                              <p className="font-bold text-sm">Pharmacy</p>
                              <p className="text-[10px] opacity-70">Locator</p>
                          </div>
                      </div>
                      {/* Decorative Circle */}
                      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                  </div>
               </Link>

               <div className="col-span-2 grid grid-rows-2 gap-3 h-32">
                   <div className="bg-white p-3 rounded-[1.2rem] shadow-sm border border-slate-100 flex items-center gap-3 active:scale-95 transition" onClick={() => handleFeatureClick('Report')}>
                      <div className="bg-red-100 text-red-500 p-2 rounded-full"><AlertTriangle size={16}/></div>
                      <span className="text-xs font-bold text-slate-700">Report Fake</span>
                   </div>
                   <div className="bg-white p-3 rounded-[1.2rem] shadow-sm border border-slate-100 flex items-center gap-3 active:scale-95 transition" onClick={() => handleFeatureClick('Reminder')}>
                      <div className="bg-orange-100 text-orange-500 p-2 rounded-full"><Bell size={16}/></div>
                      <span className="text-xs font-bold text-slate-700">Reminders</span>
                   </div>
               </div>
            </div>
         </div>

         {/* -- Scrolling Ticker -- */}
         <div className="mb-8 space-y-1">
            <div className="bg-slate-900 py-3 overflow-hidden shadow-inner">
                <div className="animate-scroll flex gap-8 items-center px-4">
                    {[...partners, ...partners].map((p, i) => (
                        <span key={`p-${i}`} className="text-white/90 font-bold text-xs whitespace-nowrap flex items-center gap-2">
                            <Building2 size={12} className="text-blue-400"/> {p}
                        </span>
                    ))}
                </div>
            </div>
            <div className="bg-blue-900 py-2 overflow-hidden border-t border-blue-800">
                <div className="animate-scroll-reverse flex gap-8 items-center px-4">
                    {[...quotes, ...quotes].map((q, i) => (
                        <span key={`q-${i}`} className="text-blue-100 text-[10px] italic whitespace-nowrap flex items-center gap-2">
                            <Quote size={10} className="fill-current"/> {q}
                        </span>
                    ))}
                </div>
            </div>
         </div>

         {/* -- Live Network Activity -- */}
         <div className="px-6 mb-24">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-900 text-sm">Live Network Activity</h3>
               <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   <span className="text-[10px] font-bold text-slate-500">Real-time</span>
               </div>
            </div>

            {/* Live Stats Counters */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Genuine Scans</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{liveStats.genuine.toLocaleString()}</p>
                    <TrendingUp size={14} className="text-emerald-500 mt-1"/>
                </div>
                <div className="bg-red-50 border border-red-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Fakes Blocked</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{liveStats.fake.toLocaleString()}</p>
                    <TrendingDown size={14} className="text-red-500 mt-1"/>
                </div>
            </div>
            
            <div className="space-y-3">
               {mobileActivities.map((item) => (
                  <div key={item.id} className={`bg-white p-3 rounded-[1.2rem] border shadow-sm flex justify-between items-center transition-all duration-300 ${item.status === 'Fake Alert' ? 'border-red-100 border-l-4 border-l-red-500' : 'border-slate-100 border-l-4 border-l-emerald-500'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {item.status === 'Verified' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-800 leading-tight">{item.drug}</p>
                           <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={8}/> {item.location}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.status === 'Verified' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                            {item.status === 'Verified' ? 'Authentic' : 'Fake'}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1 font-mono">{item.time}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* -- Toast -- */}
         {showToast && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-full text-xs font-bold shadow-xl z-[60] animate-fade-in-down flex items-center gap-2 border border-slate-700 w-max">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
               {toastMessage}
            </div>
         )}

         {/* -- Mobile Bottom Nav (Floating Dock) -- */}
         <div className="fixed bottom-6 left-6 right-6 z-50">
             <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-2 rounded-[2rem] shadow-2xl shadow-slate-200 flex justify-between items-center px-6">
                <div className="flex flex-col items-center text-blue-600 gap-1 cursor-pointer">
                   <Home size={22}/>
                </div>
                <div className="flex flex-col items-center text-slate-400 gap-1 cursor-pointer hover:text-slate-600 transition">
                   <Search size={22}/>
                </div>
                {/* Center Scan Button in Dock */}
                <div className="-mt-8">
                   <Link href="/track">
                      <div className="bg-slate-900 text-white p-4 rounded-full shadow-xl shadow-slate-900/30 active:scale-95 transition border-4 border-[#F8FAFC]">
                         <ScanLine size={24}/>
                      </div>
                   </Link>
                </div>
                <div className="flex flex-col items-center text-slate-400 gap-1 cursor-pointer hover:text-slate-600 transition">
                   <History size={22}/>
                </div>
                <div className="flex flex-col items-center text-slate-400 gap-1 cursor-pointer hover:text-slate-600 transition">
                   <User size={22}/>
                </div>
             </div>
         </div>
      </div>


      {/* --------------------------------------------------------------------------------
          💻 DESKTOP VIEW: ENTERPRISE DASHBOARD (B2B)
         -------------------------------------------------------------------------------- */}
      <div className="hidden md:block bg-white min-h-screen">
         
         {/* --- Desktop Floating Header --- */}
         <div className="fixed top-6 left-0 right-0 flex justify-center z-50">
            <nav className={`transition-all duration-500 ease-in-out ${scrolled ? 'w-[60%] py-3 shadow-2xl bg-white/80 border-white/40' : 'w-[80%] py-4 bg-white/60 border-transparent'} backdrop-blur-xl border rounded-full px-8 flex justify-between items-center shadow-lg ring-1 ring-slate-900/5`}>
               <div className="flex items-center gap-2 cursor-pointer">
                  <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 text-white p-1.5 rounded-full shadow-lg shadow-blue-500/30"><ShieldCheck size={18}/></div>
                  <span className="text-lg font-black tracking-tight text-slate-900">MedTrace</span>
               </div>
               <div className="flex gap-8 text-sm font-bold text-slate-500">
                  <a href="#" className="hover:text-blue-700 transition">Solutions</a>
                  <a href="#" className="hover:text-blue-700 transition">Network</a>
                  <a href="#" className="hover:text-blue-700 transition">Pricing</a>
               </div>
               <div className="flex gap-4">
                  <Link href="/login">
                     <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-black transition shadow-lg hover:shadow-slate-500/20 flex items-center gap-2 transform active:scale-95">
                        Partner Login <ArrowRight size={14}/>
                     </button>
                  </Link>
               </div>
            </nav>
         </div>

         {/* --- B2B Hero Section with HERO IMAGE --- */}
         <div className="relative pt-48 pb-24 bg-slate-50 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 gap-20 items-center relative z-10">
               <div>
                  <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-in-up">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Supply Chain Integrity Active</span>
                  </div>
                  <h1 className="text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                     Secure Your <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Pharma Supply Chain</span>
                  </h1>
                  <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
                     End-to-end blockchain traceability for Manufacturers, Distributors, and Retailers. Eliminate counterfeits and ensure compliance with FDA & WHO standards.
                  </p>
                  <div className="flex gap-4">
                     <Link href="/contact">
                        <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-700 transition shadow-xl shadow-blue-500/30 hover:-translate-y-1">
                            Request Demo <ArrowRight size={20}/>
                        </button>
                     </Link>
                     <Link href="/docs">
                        <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:border-slate-400 transition hover:-translate-y-1">
                            View Documentation
                        </button>
                     </Link>
                  </div>
                  <div className="mt-16 border-t border-slate-200 pt-8">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Trusted by Industry Leaders</p>
                     <div className="flex gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
                        {partners.slice(0, 4).map((p, i) => (
                           <span key={i} className="font-bold text-lg flex items-center gap-2"><Building2 size={18}/> {p}</span>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="relative group perspective-1000">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                  <div className="relative bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-white p-1 transform transition hover:rotate-1 duration-700 overflow-hidden">
                     <img 
                        src="/hero.png" 
                        className="rounded-[2rem] w-full h-auto object-cover scale-105" 
                        alt="MedTrace Hero"
                     />
                     <div className="absolute -left-8 bottom-12 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-bounce-slow">
                        <div className="bg-emerald-500/20 p-2.5 rounded-lg text-emerald-400 border border-emerald-500/30"><Box size={20}/></div>
                        <div>
                           <p className="text-[10px] text-slate-400 uppercase font-bold">Total Verified</p>
                           <p className="text-lg font-black">24.5M Units</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* --- B2B Features (Bento Grid) --- */}
         <div className="py-24 max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Enterprise Solutions</h2>
               <p className="text-slate-500 mt-3 text-lg">Scalable tools for the modern pharma ecosystem.</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
               <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 hover:shadow-2xl hover:border-blue-200 transition duration-300 group">
                  <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition"><Truck size={32}/></div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Logistics Tracking</h3>
                  <p className="text-slate-500 leading-relaxed">Real-time GPS and condition monitoring for cold-chain and sensitive pharmaceutical shipments globally.</p>
               </div>
               <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white hover:shadow-2xl transition duration-300 group shadow-lg">
                  <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/20 transition"><Database size={32}/></div>
                  <h3 className="text-2xl font-bold mb-3">Blockchain Ledger</h3>
                  <p className="text-slate-400 leading-relaxed">Immutable record keeping for every single unit from factory to pharmacy. Fraud-proof architecture.</p>
               </div>
               <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 hover:shadow-2xl hover:border-emerald-200 transition duration-300 group">
                  <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition"><BarChart3 size={32}/></div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Sales Analytics</h3>
                  <p className="text-slate-500 leading-relaxed">Deep AI-driven insights into consumption patterns and counterfeit attempt heatmaps by region.</p>
               </div>
            </div>
         </div>

         {/* --- B2B Stats Banner --- */}
         <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-24">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-12 text-center divide-x divide-white/10">
               <div><h3 className="text-5xl font-black tracking-tight">99.9%</h3><p className="text-blue-200 mt-2 text-sm uppercase tracking-widest font-bold">Uptime</p></div>
               <div><h3 className="text-5xl font-black tracking-tight">50M+</h3><p className="text-blue-200 mt-2 text-sm uppercase tracking-widest font-bold">Units Tracked</p></div>
               <div><h3 className="text-5xl font-black tracking-tight">20+</h3><p className="text-blue-200 mt-2 text-sm uppercase tracking-widest font-bold">Countries</p></div>
               <div><h3 className="text-5xl font-black text-emerald-400 tracking-tight">0%</h3><p className="text-blue-200 mt-2 text-sm uppercase tracking-widest font-bold">Counterfeit Rate</p></div>
            </div>
         </div>

         {/* --- ✅ NEW: Compliance & Integrations --- */}
         <div className="py-24 bg-slate-50 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 gap-16">
                    {/* Compliance */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="text-blue-600"/>
                            <h3 className="text-xl font-bold text-slate-900">Global Compliance</h3>
                        </div>
                        <p className="text-slate-500 mb-6">Built to meet the rigorous standards of global health authorities.</p>
                        <div className="flex gap-4">
                            <span className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-600 shadow-sm">FDA 21 CFR</span>
                            <span className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-600 shadow-sm">EU FMD</span>
                            <span className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-600 shadow-sm">DSCSA</span>
                        </div>
                    </div>
                    {/* Integrations */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="text-blue-600"/>
                            <h3 className="text-xl font-bold text-slate-900">Seamless Integrations</h3>
                        </div>
                        <p className="text-slate-500 mb-6">Works with your existing ERP and warehouse management systems.</p>
                        <div className="flex gap-4 opacity-70 grayscale hover:grayscale-0 transition">
                            <span className="font-bold text-xl text-slate-800">SAP</span>
                            <span className="font-bold text-xl text-slate-800">Oracle</span>
                            <span className="font-bold text-xl text-slate-800">Microsoft</span>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* --- ✅ NEW: Testimonials (UPDATED with Different Names) --- */}
         <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-black text-center text-slate-900 mb-16">Trusted by Pharma Executives</h2>
                <div className="grid grid-cols-3 gap-8">
                    {testimonials.map((item) => (
                        <div key={item.id} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative">
                            <Quote className="text-blue-200 absolute top-6 left-6" size={40}/>
                            <p className="text-slate-600 relative z-10 mb-6 mt-4 italic">"{item.quote}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-slate-300 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{item.name}</p>
                                    <p className="text-xs text-slate-500">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         {/* --- Footer (Desktop) --- */}
         <footer className="bg-white py-16 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg"><ShieldCheck size={20}/></div>
                  <div>
                     <span className="font-bold text-xl text-slate-900 block leading-none">MedTrace Enterprise</span>
                     <span className="text-[10px] text-slate-400 font-medium">Part of the SafeHealth Network</span>
                  </div>
               </div>
               <p className="text-slate-400 text-sm font-medium">© 2025 MedTrace Inc. All rights reserved.</p>
               <div className="flex gap-8 text-sm font-bold text-slate-600">
                  <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
                  <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
                  <a href="#" className="hover:text-blue-600 transition">Support</a>
               </div>
            </div>
         </footer>

      </div>
    </div>
  );
}