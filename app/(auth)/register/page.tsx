"use client";

import { useState } from "react";
import { registerAction } from "@/lib/actions/auth-actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ ইমেজ ইম্পোর্ট

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const result = await registerAction(formData);

    if (result.success) {
      alert("✅ " + result.message);
      router.push("/login"); // সফল হলে লগইনে পাঠাবে
    } else {
      alert("❌ " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* 🖼️ Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>
        <div className="relative z-10 text-white p-12 max-w-lg">
           
           {/* ✅ লোগো এবং টাইটেল সেকশন (Fixed Round Shape) */}
           <div className="flex items-center gap-4 mb-6">
              {/* overflow-hidden এবং p-1 ব্যবহার করা হয়েছে যাতে চারকোনা ভাব না থাকে */}
              <div className="bg-white p-1 rounded-full shadow-xl shadow-blue-900/20 overflow-hidden border-2 border-white/20">
                 <Image 
                   src="/medtrace-logo.png" 
                   alt="MedTrace Logo" 
                   width={64} 
                   height={64} 
                   // rounded-full যোগ করা হয়েছে ইমেজে
                   className="h-16 w-16 object-contain rounded-full"
                 />
              </div>
              <h1 className="text-5xl font-bold tracking-tight">MedTrace</h1>
           </div>

           <p className="text-xl text-blue-100 leading-relaxed mb-6">
             The most secure pharmaceutical supply chain network.
           </p>
           <ul className="space-y-4 text-blue-200">
             <li className="flex items-center gap-3">✅ End-to-End Tracking</li>
             <li className="flex items-center gap-3">✅ Anti-Counterfeit QR Codes</li>
             <li className="flex items-center gap-3">✅ Real-time Inventory Alerts</li>
           </ul>
        </div>
      </div>

      {/* 📝 Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2">Join the network as a partner</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company / Full Name</label>
              <input name="name" type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Acme Pharma Ltd." />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="contact@company.com" />
            </div>

            {/* Role & License Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <select name="role" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="MANUFACTURER">🏭 Manufacturer</option>
                    <option value="DISTRIBUTOR">🚚 Distributor</option>
                    <option value="RETAILER">🏥 Retailer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">License No.</label>
                  <input name="licenseNo" type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="DL-12345" />
                </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input name="password" type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="••••••••" />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-70 flex justify-center"
            >
              {loading ? (
                <span className="animate-pulse">Creating Account...</span>
              ) : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}