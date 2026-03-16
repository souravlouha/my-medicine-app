"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { 
  ShieldCheck, QrCode, Search, Smartphone, Play, 
  MapPin, Bell, AlertTriangle, Mic as MicIcon, Activity, X, User, 
  CheckCircle2, ScanLine, ArrowRight, ChevronDown, 
  Zap, ArrowUpRight, Building2, Quote, ChevronRight,
  Truck, Box, BarChart3, Globe, Lock, FileText, Database, Menu,
  MoreHorizontal, Phone, History, Home, TrendingUp, TrendingDown,
  Loader2, Server, Layers, Award, Star, HeartPulse, Stethoscope, 
  ShieldAlert, Fingerprint, Globe2, Leaf, Factory, Lightbulb, Siren,
  Sparkles, Shield, Heart, Clock, Eye, Pill, BadgeCheck, CircleDot
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
  const [totalScans, setTotalScans] = useState(14203);
  const [showScanner, setShowScanner] = useState(false);

  // --- 🔴 LIVE STATS STATE ---
  const [liveStats, setLiveStats] = useState({
    genuine: 14203,
    fake: 127
  });

  // --- 💡 HEALTH TIPS ROTATION STATE ---
  const [currentTip, setCurrentTip] = useState(0);
  const healthTips = [
    "Always check the seal integrity before purchase.",
    "Verify the expiry date on every medicine strip.",
    "Store medicines in a cool, dry place away from sunlight.",
    "If the packaging looks faded, do not buy it.",
    "Scan the QR code to ensure the medicine is genuine."
  ];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // 🔄 Health Tip Rotator (Every 4 seconds)
    const tipInterval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % healthTips.length);
    }, 4000);

    const scanInterval = setInterval(() => {
        setTotalScans((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 2500);

    return () => {
        window.removeEventListener("scroll", handleScroll);
        clearInterval(tipInterval);
        clearInterval(scanInterval);
    };
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

  // ✅ TESTIMONIALS (Realistic & Detailed)
  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Logistics Lead, Cipla",
      quote: "Before integrating MedTrace, we struggled with significant blind spots in our supply chain, especially during last-mile delivery. Now, we have granular visibility that allows us to track every single strip with 100% accuracy. It has completely transformed our operations efficiency."
    },
    {
      id: 2,
      name: "Dr. Elena R.",
      role: "Quality Head, Novartis",
      quote: "The threat of counterfeit drugs entering our supply chain was keeping me up at night. Since deploying MedTrace's blockchain ledger, we have an immutable record of every product journey. We have seen a complete elimination of verification disputes in just six months."
    },
    {
      id: 3,
      name: "Vikram M.",
      role: "S. Chain, Dr. Reddy's",
      quote: "What impressed me most was the speed of integration. We connected MedTrace with our complex SAP ERP environment in less than two weeks without any downtime. The real-time analytics dashboard gives us predictive insights that we never had before."
    },
    {
      id: 4,
      name: "Sarah Johnson",
      role: "CTO, Global Health",
      quote: "Scalability was our biggest concern, but MedTrace proved its robustness immediately. We expanded our tracking to over 50 countries in a single quarter. The API is incredibly well-documented, and the support team is proactive and knowledgeable."
    },
    {
      id: 5,
      name: "Ahmed Khan",
      role: "CEO, Beximco",
      quote: "For cross-border pharmaceutical shipments, compliance is everything. MedTrace automated our entire regulatory reporting process for FDA and EU FMD standards. It saves us thousands of man-hours every year and ensures we are always audit-ready."
    },
    {
      id: 6,
      name: "Wei Zhang",
      role: "Compliance, Sinopharm",
      quote: "The combination of IoT monitoring and blockchain verification is powerful. We can now guarantee not just the authenticity but also the quality of our temperature-sensitive vaccines from the factory floor to the patient's hand."
    }
  ];

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* CSS for Scrolling & Animations */}
      <style jsx>{`
        @keyframes scroll { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(-50%); } 
        }
        @keyframes scroll-reverse { 
          0% { transform: translateX(-50%); } 
          100% { transform: translateX(0); } 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 98%; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll { display: flex; width: max-content; animation: scroll 80s linear infinite; }
        .animate-scroll-reverse { display: flex; width: max-content; animation: scroll-reverse 30s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.5s ease-out both; }
        .anim-d1 { animation: slide-up 0.5s ease-out 0.08s both; }
        .anim-d2 { animation: slide-up 0.5s ease-out 0.16s both; }
        .anim-d3 { animation: slide-up 0.5s ease-out 0.24s both; }
        .anim-d4 { animation: slide-up 0.5s ease-out 0.32s both; }
        .anim-d5 { animation: slide-up 0.5s ease-out 0.4s both; }
        .animate-slide-in-right { animation: slide-in-right 0.4s ease-out both; }
        .animate-pulse-soft { animation: pulse-soft 2.5s ease-in-out infinite; }
        .animate-ripple { animation: ripple 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        .animate-fade-text { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animate-ticker { display: flex; width: max-content; animation: ticker 25s linear infinite; }
        .animate-progress { animation: progress-fill 2s ease-out forwards; }
        
        .hover\:pause:hover { animation-play-state: paused; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ─── 📱 MOBILE ─── */}
      <div className="md:hidden min-h-screen bg-white pb-20">

        {/* ▸ Header */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]' : 'bg-white'}`}>
          <div className="flex justify-between items-center px-5 h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Image src="/medtrace-logo.png" alt="MedTrace" width={22} height={22} className="h-[22px] w-[22px] object-contain"/>
              </div>
              <div>
                <span className="font-bold text-[15px] text-slate-900 leading-none block">MedTrace</span>
                <span className="text-[10px] text-emerald-600 font-medium">Verified Platform</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Bell size={16} className="text-slate-400"/>
                <span className="absolute top-2 right-2 w-[5px] h-[5px] bg-red-500 rounded-full"></span>
              </div>
              <Link href="/login">
                <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center">
                  <User size={15} className="text-white"/>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ▸ Greeting + Hero Banner */}
        <div className="pt-[68px] px-5 animate-slide-up">
          <p className="text-slate-400 text-[14px] mb-1">Welcome to MedTrace 👋</p>
          <h1 className="text-[26px] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
            Verify Medicine,<br/>Stay <span className="text-emerald-600">Safe</span>
          </h1>
        </div>

        {/* ▸ Promo Banner Card */}
        <div className="px-5 mt-5 anim-d1">
          <Link href="/track">
            <div className="bg-emerald-50 rounded-3xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-100 rounded-full opacity-60"></div>
              <div className="absolute right-5 bottom-4 opacity-20">
                <ShieldCheck size={56} className="text-emerald-600"/>
              </div>
              <div className="relative z-10">
                <span className="inline-block bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg mb-3 uppercase tracking-wider">AI-Powered</span>
                <h2 className="text-slate-900 font-bold text-[18px] leading-snug mb-1">Scan & Verify<br/>Any Medicine</h2>
                <p className="text-emerald-700/60 text-[12px]">Instant blockchain verification</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold">
                  <ScanLine size={16}/> Start Scanning
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ▸ Search */}
        <div className="px-5 mt-5 anim-d1">
          <div className="flex items-center gap-2.5 bg-slate-50 rounded-2xl px-4 py-1">
            <Search size={17} className="text-slate-300 shrink-0"/>
            <input 
              type="text" 
              placeholder="Search here..." 
              className="flex-1 py-3 bg-transparent outline-none text-[14px] text-slate-800 placeholder:text-slate-300"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            <button onClick={handleSearch} className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center active:scale-90 transition shrink-0">
              {searching ? <Loader2 size={15} className="animate-spin"/> : <ArrowRight size={15}/>}
            </button>
          </div>
          {aiResult && (
            <div className="mt-3 flex items-center gap-3 bg-white border border-emerald-100 px-4 py-3.5 rounded-2xl animate-slide-up">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-emerald-500"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-[13px]">{aiResult.name}</p>
                <p className="text-[11px] text-emerald-600">{aiResult.status} · {aiResult.desc}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 shrink-0"/>
            </div>
          )}
        </div>

        {/* ▸ Popular Services */}
        <div className="px-5 mt-7 anim-d2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-bold text-slate-900">Popular Services</h2>
            <span className="text-[12px] text-emerald-600 font-medium">Explore all</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { href: "/track", icon: QrCode, label: "Verify Medicine" },
              { href: "/features/pharmacy-locator", icon: MapPin, label: "Pharmacy" },
              { href: "/features/report", icon: AlertTriangle, label: "Report Fake" },
              { href: "/track", icon: Shield, label: "Track Batch" },
            ].map((s, i) => (
              <Link href={s.href} key={i}>
                <div className="flex flex-col items-center gap-2 min-w-[76px] active:scale-95 transition">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                    <s.icon size={22} className="text-slate-600" strokeWidth={1.5}/>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 text-center leading-tight">{s.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ▸ Stats Card */}
        <div className="px-5 mt-7 anim-d2">
          <div className="bg-slate-900 rounded-3xl p-5 flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-white font-bold text-[18px] leading-none">{liveStats.genuine.toLocaleString()}</p>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Verified</p>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center flex-1">
              <p className="text-white font-bold text-[18px] leading-none">{liveStats.fake.toLocaleString()}</p>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Blocked</p>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="text-center flex-1">
              <p className="text-white font-bold text-[18px] leading-none">99.9%</p>
              <p className="text-slate-400 text-[10px] mt-1 font-medium">Accuracy</p>
            </div>
          </div>
        </div>

        {/* ▸ Live Activity */}
        <div className="px-5 mt-7 anim-d3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[16px] font-bold text-slate-900">Live Activity</h2>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">Live</span>
            </div>
          </div>
          <div className="space-y-2">
            {mobileActivities.slice(0, 3).map((item, idx) => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300
                  ${item.status === 'Fake Alert' ? 'bg-red-50' : 'bg-slate-50'}
                  ${idx === 0 ? 'animate-slide-in-right' : ''}
                `}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  item.status === 'Verified' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {item.status === 'Verified' 
                    ? <CheckCircle2 size={18} className="text-emerald-600"/> 
                    : <AlertTriangle size={18} className="text-red-500"/>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] text-slate-800 truncate">{item.drug}</p>
                  <p className="text-[11px] text-slate-400">{item.location} · {item.time}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                  item.status === 'Verified' ? 'text-emerald-700 bg-emerald-100' : 'text-red-600 bg-red-100'
                }`}>
                  {item.status === 'Verified' ? 'Safe' : 'Fake'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ▸ How It Works */}
        <div className="px-5 mt-8 anim-d3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-bold text-slate-900">How It Works</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { step: "01", title: "Scan Code", desc: "Point camera at QR code on medicine", icon: QrCode, bg: "bg-blue-50", color: "text-blue-600" },
              { step: "02", title: "AI Verifies", desc: "Blockchain verification in real time", icon: Shield, bg: "bg-indigo-50", color: "text-indigo-600" },
              { step: "03", title: "Get Result", desc: "Instant report with batch details", icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
            ].map((s, i) => (
              <div key={i} className="min-w-[160px] bg-white border border-slate-100 rounded-3xl p-4 flex-shrink-0">
                <div className={`w-11 h-11 ${s.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <s.icon size={20} className={s.color}/>
                </div>
                <p className="font-bold text-[13px] text-slate-900 mb-1">{s.title}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ▸ Health Tip Card */}
        <div className="px-5 mt-7 anim-d4">
          <div className="bg-amber-50 rounded-3xl px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb size={16} className="text-amber-600"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Health Tip</p>
                <p key={currentTip} className="text-[13px] text-amber-900/70 leading-relaxed font-medium animate-fade-text">
                  {healthTips[currentTip]}
                </p>
              </div>
            </div>
            <div className="flex gap-1 mt-3 ml-12">
              {healthTips.map((_, i) => (
                <div key={i} className={`h-[3px] rounded-full transition-all duration-300 ${i === currentTip ? 'w-5 bg-amber-500' : 'w-1.5 bg-amber-200'}`}/>
              ))}
            </div>
          </div>
        </div>

        {/* ▸ Trust Features */}
        <div className="px-5 mt-7 anim-d4">
          <h2 className="text-[16px] font-bold text-slate-900 mb-3">Why MedTrace?</h2>
          <div className="space-y-2.5">
            {[
              { icon: Fingerprint, title: "Blockchain Verified", desc: "Tamper-proof record for every medicine", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Zap, title: "Under 2 Seconds", desc: "Lightning-fast verification results", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: Globe2, title: "50M+ Products", desc: "Global verification network", color: "text-indigo-600", bg: "bg-indigo-50" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50">
                <div className={`${f.bg} w-11 h-11 rounded-2xl flex items-center justify-center shrink-0`}>
                  <f.icon size={18} className={f.color}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-semibold text-[13px]">{f.title}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{f.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0"/>
              </div>
            ))}
          </div>
        </div>

        {/* ▸ Testimonial Card */}
        <div className="px-5 mt-7 anim-d5">
          <div className="bg-white border border-slate-100 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-[14px]">
                {testimonials[0].name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-slate-900 font-bold text-[14px]">{testimonials[0].name}</p>
                <p className="text-slate-400 text-[11px]">{testimonials[0].role}</p>
              </div>
              <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg">
                <Star size={11} className="text-amber-400 fill-amber-400"/>
                <span className="text-[11px] font-bold text-amber-700">4.9</span>
              </div>
            </div>
            <p className="text-slate-500 text-[13px] leading-relaxed">
              "{testimonials[0].quote.slice(0, 140)}..."
            </p>
          </div>
        </div>

        {/* ▸ Partners */}
        <div className="px-5 mt-7 anim-d5">
          <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider mb-3">Trusted Partners</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {partners.slice(0, 6).map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-2 rounded-xl whitespace-nowrap shrink-0">
                <Building2 size={13} className="text-slate-300"/>
                <span className="text-[11px] font-medium text-slate-500">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ▸ CTA */}
        <div className="px-5 mt-10 mb-6 anim-d5">
          <div className="text-center">
            <h2 className="text-[20px] font-extrabold text-slate-900 mb-2">Get Started Today</h2>
            <p className="text-slate-400 text-[13px] mb-5 leading-relaxed">
              It only takes one scan to protect yourself<br/>and your family.
            </p>
            <Link href="/track">
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold text-[15px] active:scale-[0.98] transition inline-flex items-center justify-center gap-2.5">
                Get Started <ArrowRight size={16}/>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 px-6">
          <p className="text-slate-300 text-[11px]">© 2026 MedTrace Inc. All rights reserved.</p>
          <p className="text-slate-300 text-[10px] mt-1">Part of the SafeHealth Network</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="text-slate-300 text-[10px] hover:text-slate-500 transition">Privacy Policy</a>
            <a href="#" className="text-slate-300 text-[10px] hover:text-slate-500 transition">Terms of Service</a>
            <a href="#" className="text-slate-300 text-[10px] hover:text-slate-500 transition">Support</a>
          </div>
          <p className="text-slate-400 text-[10px] mt-3">
            Developed by <a href="https://github.com/souravlouha" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold hover:underline">souravlouha</a>
          </p>
        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[12px] font-medium shadow-lg z-[60] animate-slide-up">
            {toastMessage}
          </div>
        )}

        {/* ▸ Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white">
          <div className="flex justify-around items-end pt-2 pb-3 px-4 border-t border-slate-50">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-10 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Home size={18} className="text-emerald-600"/>
              </div>
              <span className="text-[9px] font-semibold text-emerald-600">Home</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-10 h-7 flex items-center justify-center">
                <Search size={18} className="text-slate-300"/>
              </div>
              <span className="text-[9px] text-slate-300">Search</span>
            </div>
            <Link href="/track" className="-mt-5">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-95 transition">
                <ScanLine size={22} strokeWidth={2.5}/>
              </div>
            </Link>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-10 h-7 flex items-center justify-center">
                <Clock size={18} className="text-slate-300"/>
              </div>
              <span className="text-[9px] text-slate-300">History</span>
            </div>
            <Link href="/login">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-7 flex items-center justify-center">
                  <User size={18} className="text-slate-300"/>
                </div>
                <span className="text-[9px] text-slate-300">Profile</span>
              </div>
            </Link>
          </div>
        </div>
      </div>


      {/* --------------------------------------------------------------------------------
          💻 DESKTOP VIEW: ENTERPRISE DASHBOARD (B2B)
          -------------------------------------------------------------------------------- */}
      <div className="hidden md:block bg-white min-h-screen">
          
          {/* --- Desktop Floating Header --- */}
          <div className="fixed top-6 left-0 right-0 flex justify-center z-50">
             <div className={`transition-all duration-500 ease-in-out ${scrolled ? 'w-[60%] py-3 shadow-2xl bg-white/80 border-white/40' : 'w-[80%] py-4 bg-white/60 border-transparent'} backdrop-blur-xl border rounded-full px-8 flex justify-between items-center shadow-lg ring-1 ring-slate-900/5`}>
                <div className="flex items-center gap-4 cursor-pointer group">
                   {/* ✅ DESKTOP LOGO: Bigger & Circular */}
                   <div className="bg-white p-1 rounded-full shadow-lg border-2 border-white/50 group-hover:scale-105 transition-transform duration-300">
                      <Image 
                         src="/medtrace-logo.png" 
                         alt="Logo" 
                         width={56} 
                         height={56} 
                         className="h-14 w-14 object-contain rounded-full" 
                      />
                   </div>
                   <span className="text-xl font-black tracking-tight text-slate-900">MedTrace</span>
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
             </div>
          </div>

          {/* --- B2B Hero Section --- */}
          <div className="relative pt-48 pb-24 bg-slate-50 overflow-hidden">
             <div className="absolute inset-0 z-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
             <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 gap-20 items-center relative z-10">
                {/* Hero Text */}
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
                   {/* Partners */}
                   <div className="mt-16 border-t border-slate-200 pt-8">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Trusted by Industry Leaders</p>
                      <div className="flex gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
                         {partners.slice(0, 4).map((p, i) => (
                            <span key={i} className="font-bold text-lg flex items-center gap-2"><Building2 size={18}/> {p}</span>
                         ))}
                      </div>
                   </div>
                </div>
                {/* Hero Image */}
                <div className="relative group perspective-1000 animate-float">
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

          {/* --- Process Flow --- */}
          <div className="py-24 bg-white relative">
             <div className="max-w-7xl mx-auto px-6">
                 <div className="text-center mb-20">
                     <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Process</span>
                     <h2 className="text-4xl font-black text-slate-900 mt-2">End-to-End Traceability</h2>
                 </div>
                 <div className="grid grid-cols-4 gap-8 relative">
                     <div className="absolute top-12 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
                     {[
                         { icon: Factory, title: "Manufacturing", desc: "Unique QR generation at the source." },
                         { icon: Truck, title: "Distribution", desc: "IoT monitoring during transit." },
                         { icon: Building2, title: "Pharmacy", desc: "Verification upon receipt." },
                         { icon: Smartphone, title: "Consumer", desc: "Instant scan verification via app." }
                     ].map((step, idx) => (
                         <div key={idx} className="text-center group">
                             <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:border-blue-500 group-hover:shadow-blue-200 transition duration-300 relative z-10">
                                 <step.icon className="text-slate-400 group-hover:text-blue-600 transition duration-300" size={32}/>
                                 <span className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">
                                     {idx + 1}
                                 </span>
                             </div>
                             <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                             <p className="text-slate-500 text-sm leading-relaxed px-4">{step.desc}</p>
                         </div>
                     ))}
                 </div>
             </div>
          </div>

          {/* --- B2B Features --- */}
          <div className="py-24 max-w-7xl mx-auto px-6">
             <div className="text-center mb-20">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Enterprise Solutions</h2>
                <p className="text-slate-500 mt-3 text-lg">Scalable tools for the modern pharma ecosystem.</p>
             </div>
             
             <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden mb-12 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/50 via-slate-900 to-slate-900"></div>
                <div className="relative z-10">
                   <Globe2 size={48} className="text-blue-500 mx-auto mb-4 animate-pulse"/>
                   <h3 className="text-3xl font-bold text-white mb-2">Connected Global Network</h3>
                   <p className="text-slate-400 max-w-xl mx-auto">Real-time data synchronization across borders ensuring medicine safety everywhere.</p>
                </div>
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

          {/* --- B2B Stats --- */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-24">
             <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-12 text-center divide-x divide-white/10">
                <div><h3 className="text-5xl font-black tracking-tight">99.9%</h3><p className="text-blue-200 mt-2 text-sm uppercase tracking-widest font-bold">Uptime</p></div>
                <div><h3 className="text-5xl font-black tracking-tight">50M+</h3><p className="text-blue-200 mt-2 text-sm uppercase tracking-widest font-bold">Units Tracked</p></div>
                <div><h3 className="text-5xl font-black tracking-tight">20+</h3><p className="text-blue-200 mt-2 text-sm uppercase tracking-widest font-bold">Countries</p></div>
                <div><h3 className="text-5xl font-black text-emerald-400 tracking-tight">0%</h3><p className="text-blue-200 mt-2 text-sm uppercase tracking-widest font-bold">Counterfeit Rate</p></div>
             </div>
          </div>

          {/* --- Compliance & Integrations --- */}
          <div className="py-24 bg-slate-50 border-y border-slate-200">
             <div className="max-w-7xl mx-auto px-6">
                 <div className="grid grid-cols-2 gap-16">
                     <div>
                         <div className="flex items-center gap-2 mb-6">
                             <Award className="text-blue-600"/>
                             <h3 className="text-xl font-bold text-slate-900">Global Compliance</h3>
                         </div>
                         <p className="text-slate-500 mb-6 font-medium">Built to meet the rigorous standards of global health authorities.</p>
                         <div className="flex gap-4 flex-wrap">
                             <span className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-600 shadow-sm">FDA 21 CFR</span>
                             <span className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-600 shadow-sm">EU FMD</span>
                             <span className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-600 shadow-sm">DSCSA</span>
                         </div>
                     </div>
                     <div>
                         <div className="flex items-center gap-2 mb-6">
                             <Layers className="text-blue-600"/>
                             <h3 className="text-xl font-bold text-slate-900">Seamless Integrations</h3>
                         </div>
                         <p className="text-slate-500 mb-6 font-medium">Works with your existing ERP and warehouse management systems.</p>
                         <div className="flex gap-6 opacity-70 grayscale hover:grayscale-0 transition items-center">
                             <span className="font-black text-2xl text-slate-800">SAP</span>
                             <span className="font-black text-2xl text-slate-800">Oracle</span>
                             <span className="font-black text-2xl text-slate-800">Microsoft</span>
                         </div>
                     </div>
                 </div>
             </div>
          </div>

          {/* --- Testimonials --- */}
          <div className="py-24 bg-white overflow-hidden">
             <div className="max-w-7xl mx-auto px-6">
                 <h2 className="text-3xl font-black text-center text-slate-900 mb-16">Trusted by Pharma Executives</h2>
                 <div className="relative">
                     <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
                     <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
                     <div className="flex gap-6 animate-scroll hover:pause">
                         {[...testimonials, ...testimonials].map((item, i) => (
                             <div key={i} className="w-[260px] min-w-[260px] max-w-[260px] bg-slate-50 p-6 rounded-xl border border-slate-100 relative shadow-sm hover:shadow-md transition flex flex-col hover:-translate-y-1">
                                 <Quote className="text-blue-200 absolute top-4 left-4" size={20}/>
                                 <p className="text-slate-600 relative z-10 mb-6 mt-6 italic text-xs leading-relaxed font-medium whitespace-normal">"{item.quote}"</p>
                                 <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-200/50">
                                     <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                                         {item.name.charAt(0)}
                                     </div>
                                     <div className="min-w-0">
                                         <p className="font-bold text-slate-900 text-xs truncate">{item.name}</p>
                                         <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wide truncate">{item.role}</p>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
          </div>

          {/* --- Footer --- */}
          <footer className="bg-white py-16 border-t border-slate-200">
             <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600 text-white p-2 rounded-lg"><ShieldCheck size={20}/></div>
                   <div>
                      <span className="font-bold text-xl text-slate-900 block leading-none">MedTrace Enterprise</span>
                      <span className="text-[10px] text-slate-400 font-medium">Part of the SafeHealth Network</span>
                   </div>
                </div>
                <p className="text-slate-400 text-sm font-medium">© 2026 MedTrace Inc. All rights reserved.</p>
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