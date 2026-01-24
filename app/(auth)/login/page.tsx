"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions/auth-actions"; 
import Link from "next/link";
import { Printer } from "lucide-react"; 

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    
    // সার্ভার অ্যাকশন কল
    const result = await loginAction(formData);

    // সফল হলে সার্ভার অটোমেটিক রিডাইরেক্ট করবে, কোড নিচে নামবে না।
    // যদি নিচে নামে, তার মানে এরর হয়েছে।
    if (result?.error) {
      alert("❌ " + result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side */}
        <div className="w-full md:w-1/2 bg-blue-600 p-10 flex flex-col justify-center text-white relative">
           <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
           <div className="relative z-10">
             <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
             <p className="text-blue-100 mb-6">Login to access your dashboard.</p>
           </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-10">
           <h3 className="text-2xl font-bold text-gray-800 mb-1">Sign In</h3>
           <p className="text-gray-500 text-sm mb-8">Enter your credentials</p>

           <form onSubmit={handleSubmit} className="space-y-5">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none" placeholder="Enter your email" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input name="password" type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none" placeholder="••••••••" />
             </div>
             <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-70">
                {loading ? "Signing In..." : "Login"}
             </button>
           </form>

           <div className="mt-6 text-center text-sm">
              <Link href="/register" className="text-blue-600 font-bold hover:underline">Create Account</Link>
           </div>
           
           <div className="mt-4 text-center">
             <Link href="/operator">
               <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto font-bold uppercase tracking-wide">
                 <Printer size={14} /> Operator Mode
               </button>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}