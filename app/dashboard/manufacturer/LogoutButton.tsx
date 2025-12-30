"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // ১. কুকি মুছে ফেলা
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // ২. লগইন পেজে পাঠিয়ে দেওয়া
    router.push("/login");
    router.refresh(); // ক্যাশ ক্লিয়ার করার জন্য
  };

  return (
    <button 
      onClick={handleLogout}
      className="w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20 group"
    >
      SIGN OUT SYSTEM
      <span className="group-hover:translate-x-1 transition-transform">🚪</span>
    </button>
  );
}