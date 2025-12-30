"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, signupAction } from "./actions";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ফর্ম সাবমিট হ্যান্ডলার (onSubmit ব্যবহার করছি ভালো কন্ট্রোলের জন্য)
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // পেজ রিফ্রেশ বন্ধ করবে
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      // মোড অনুযায়ী আলাদা অ্যাকশন কল করা হবে
      const res = isLogin 
        ? await loginAction(formData) 
        : await signupAction(formData);

      if (res.success) {
        // সফল হলে সরাসরি ড্যাশবোর্ডে রিডাইরেক্ট
        // window.location.href ব্যবহার করা নিরাপদ কারণ এটি কুকি সিঙ্ক নিশ্চিত করে
        window.location.href = `/dashboard/${res.role?.toLowerCase()}`;
      } else {
        setError(res.message || "❌ Something went wrong");
        setLoading(false);
      }
    } catch (err) {
      setError("❌ সংযোগ বিচ্ছিন্ন হয়েছে। আবার চেষ্টা করুন।");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        
        {/* হেডার */}
        <h1 className="text-3xl font-black text-center text-[#0D1B3E] mb-2 tracking-tighter uppercase">
          {isLogin ? "MedTrace Login" : "Join Network"}
        </h1>
        <p className="text-center text-gray-400 mb-8 text-xs font-bold uppercase tracking-widest">
          {isLogin ? "Secure Access Control" : "Traceability Ecosystem"}
        </p>
        
        {/* এখানে onSubmit ব্যবহার করা হয়েছে */}
        <form onSubmit={onSubmit} className="space-y-5">
          
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Full Name</label>
                <input name="name" type="text" required className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Enter Full Name" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Business Role</label>
                <select name="role" className="w-full border-gray-200 border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="MANUFACTURER">Manufacturer</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                  <option value="RETAILER">Retailer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Location / City</label>
                <input name="location" type="text" required className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Kolkata, WB" />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Email ID</label>
            <input name="email" type="email" required className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="name@company.com" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Secret Password</label>
            <input name="password" type="password" required className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 disabled:bg-gray-300 ${isLogin ? "bg-[#0D1B3E] hover:bg-blue-900" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Verifying..." : (isLogin ? "Authorize & Login" : "Confirm Registration")}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 text-[10px] font-black text-center rounded-xl border border-red-100 uppercase tracking-widest animate-pulse">
            {error}
          </div>
        )}

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isLogin ? "New to the system?" : "Already verified?"}
          </p>
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }} 
            className="text-blue-600 font-black hover:text-blue-800 text-xs mt-2 uppercase tracking-tighter"
          >
            {isLogin ? "Register a new entity" : "Return to Login"}
          </button>
        </div>

      </div>
    </div>
  );
}