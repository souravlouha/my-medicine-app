"use client";
import { useState } from "react";
import { updateFullProfileAction } from "../actions";

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  return (
    <form 
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        const res = await updateFullProfileAction(user.id, data);
        alert(res.message);
        setLoading(false);
        if(res.success) window.location.href = "/dashboard/retailer";
      }} 
      className="space-y-8 bg-white p-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ড্রাগ লাইসেন্স ইনপুট */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Drug License Number</label>
          <input 
            name="licenseNo" 
            defaultValue={user.licenseNo || ""} 
            required 
            placeholder="e.g. LIC-AF9E40"
            className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[24px] font-mono font-bold text-blue-600 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" 
          />
        </div>

        {/* GST ইনপুট */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">GST Registration No</label>
          <input 
            name="gstNo" 
            defaultValue={user.gstNo || ""} 
            required 
            placeholder="e.g. 19AAAAA0000A1Z5"
            className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[24px] font-mono font-bold text-blue-600 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" 
          />
        </div>

        {/* ফোন ইনপুট */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
          <input 
            name="phone" 
            defaultValue={user.phone || ""} 
            required 
            className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[24px] font-bold text-gray-700 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" 
          />
        </div>

        {/* শহর/লোকেশন ইনপুট */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">City / Town</label>
          <input 
            name="location" 
            defaultValue={user.location || ""} 
            required 
            className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[24px] font-bold text-gray-700 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" 
          />
        </div>
      </div>

      {/* পূর্ণ ঠিকানা - এটি ইনভয়েসের জন্য খুব জরুরি */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Business Address (As per License)</label>
        <textarea 
          name="fullAddress" 
          defaultValue={user.fullAddress || ""} 
          required 
          rows={3} 
          className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[24px] font-bold text-gray-700 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" 
          placeholder="Enter complete building name, street, and pin code..."
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#0D1B3E] hover:bg-blue-700 text-white p-6 rounded-[28px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:bg-gray-300"
      >
        {loading ? "Processing Verification..." : "Verify & Save Business Profile ✅"}
      </button>
    </form>
  );
}