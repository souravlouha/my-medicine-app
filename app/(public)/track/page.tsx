"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  ScanLine,
  QrCode,
  ArrowRight,
  Lock,
  Zap,
  Globe,
  X,
} from "lucide-react";

// Dynamically import the QR scanner to avoid SSR issues
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-900 animate-pulse rounded-2xl" /> }
);

export default function PublicTrackPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [shake, setShake] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      inputRef.current?.focus();
      return;
    }
    navigate(query);
  };

  const handleScan = (results: { rawValue: string }[]) => {
    if (!results || results.length === 0) return;
    const rawValue = results[0].rawValue;
    let finalId = rawValue;
    // Extract ID from a full URL if scanned from a QR code link
    if (rawValue.includes("/verify/")) finalId = rawValue.split("/verify/")[1];
    else if (rawValue.includes("/track/")) finalId = rawValue.split("/track/").pop() ?? rawValue;
    setShowScanner(false);
    navigate(finalId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} className="text-blue-400" />
          <span className="font-bold text-white text-lg tracking-tight">MedTrace</span>
        </div>
        <a
          href="/login"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition"
        >
          <Lock size={14} />
          Dashboard
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
          <Globe size={12} />
          Official Medicine Verification Portal
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-black text-white text-center leading-tight mb-4 max-w-3xl">
          Is Your Medicine{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Genuine?
          </span>
        </h1>
        <p className="text-slate-400 text-center max-w-xl mb-12 text-base md:text-lg">
          Scan the QR code or enter the Batch ID printed on your medicine pack to
          instantly verify authenticity, expiry date, and supply chain history.
        </p>

        {/* Search Box */}
        <div className={`w-full max-w-xl ${shake ? "animate-[wiggle_0.4s_ease-in-out]" : ""}`}>
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl focus-within:border-blue-400/60 transition-all"
          >
            <div className="pl-3 text-slate-400">
              <Search size={20} />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter Batch ID or Unique ID…"
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-slate-500 outline-none text-sm md:text-base font-medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
            >
              Verify
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* QR Scanner toggle */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-slate-600 text-xs font-medium">— or —</p>
          <button
            onClick={() => { setShowScanner(!showScanner); setScanError(""); }}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white px-5 py-3 rounded-xl text-sm font-bold transition-all"
          >
            <ScanLine size={18} className="text-blue-400" />
            {showScanner ? "Close Scanner" : "Scan QR Code with Camera"}
          </button>
        </div>

        {/* QR Scanner Panel */}
        {showScanner && (
          <div className="mt-6 w-full max-w-sm">
            <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl aspect-square bg-slate-900">
              <Scanner
                onScan={handleScan}
                onError={(err) => setScanError(String(err))}
                components={{ finder: false }}
                styles={{ container: { width: "100%", height: "100%" } }}
              />
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]" />
              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />
              <button
                onClick={() => setShowScanner(false)}
                className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1 z-10"
              >
                <X size={16} />
              </button>
            </div>
            {scanError && (
              <p className="mt-2 text-red-400 text-xs text-center">{scanError}</p>
            )}
            <p className="mt-3 text-slate-500 text-xs text-center">
              Point camera at the QR code on the medicine pack
            </p>
          </div>
        )}

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-emerald-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Verify Authenticity</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Instantly confirm your medicine is genuine, not counterfeit.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={24} className="text-blue-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Track Supply Chain</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              See the full journey from manufacturer to your pharmacy.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="bg-red-500/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h3 className="font-bold text-white mb-1">Recall Alerts</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Get instant warnings if a batch has been recalled for safety.
            </p>
          </div>
        </div>

        <div className="mt-12 inline-flex items-center gap-2 text-slate-600 text-xs font-medium">
          <Zap size={12} className="text-yellow-500" />
          Verified directly from manufacturer database · No third-party data
        </div>
      </main>

      <footer className="text-center py-6 text-slate-700 text-xs">
        © 2024 MedTrace · Medicine Traceability Platform
      </footer>
    </div>
  );
}
