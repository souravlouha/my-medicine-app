"use client";
import { useState } from "react";
import { registerAction } from "../actions/auth"; 
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await registerAction(formData);

      if (res.success) {
        alert(`Registration Successful! Your ID is: ${res.customId}`);
        // ইউজারকে সরাসরি ড্যাশবোর্ডে বা প্রোফাইল পেজে পাঠিয়ে দিচ্ছি
        router.push("/dashboard/profile"); 
      } else {
        setError(res.message || "Something went wrong");
      }
    } catch (err) {
      setError("Server connection failed. Please check your internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[32px] shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Join MedTrace</h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-2">Secure Medicine Supply Chain</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black mb-6 border border-red-100 text-center uppercase tracking-tighter">
             ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="YOUR NAME"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all uppercase text-sm"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="EMAIL@EXAMPLE.COM"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all text-sm"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password (6+ characters)</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
            <div className="relative">
              <select 
                name="role" 
                required 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all appearance-none uppercase text-xs"
              >
                <option value="MANUFACTURER">Manufacturer (Factory)</option>
                <option value="DISTRIBUTOR">Distributor (Wholesale)</option>
                <option value="RETAILER">Retailer (Pharmacy)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0D1B3E] hover:bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:bg-gray-300 mt-4"
          >
            {loading ? "Verifying..." : "Register Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
            Already registered? <a href="/login" className="text-blue-600 hover:underline">Login to existing account</a>
          </p>
        </div>
      </div>
    </div>
  );
}