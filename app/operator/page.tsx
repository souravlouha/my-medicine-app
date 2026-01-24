"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOperatorCode } from "@/lib/actions/production-actions";
import { Loader2, ShieldCheck, User, Key } from "lucide-react";

export default function OperatorLoginPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await verifyOperatorCode(code);

    if (res.success) {
      // সেশন কোড সঠিক হলে প্যানেলে নিয়ে যাবে
      router.push(`/operator/panel/${code}?name=${name}`);
    } else {
      alert("Invalid Access Code!");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Operator Access</h1>
          <p className="text-slate-500 text-sm">Enter details to start printing line</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Operator Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-300" size={20} />
              <input 
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100" 
                placeholder="Enter your name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Access Passkey</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-slate-300" size={20} />
              <input 
                required
                type="password"
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 font-mono tracking-widest text-lg text-center" 
                placeholder="••••••"
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-slate-800 transition flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Verify & Initialize"}
          </button>
        </form>
      </div>
    </div>
  );
}