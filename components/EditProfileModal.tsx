"use client";

import { useState } from "react";
import { updateFullProfileAction } from "@/app/dashboard/actions"; // সঠিক পাথ চেক করো

export default function EditProfileModal({ user, onClose }: { user: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      phone: formData.get("phone"),
      licenseNo: formData.get("licenseNo"),
      gstNo: formData.get("gstNo"),
      fullAddress: formData.get("fullAddress"),
    };

    const res = await updateFullProfileAction(user.id, data);
    
    if (res.success) {
      alert("✅ প্রোফাইল সফলভাবে আপডেট হয়েছে!");
      onClose();
      window.location.reload(); // নতুন ডেটা দেখানোর জন্য পেজ রিফ্রেশ হবে
    } else {
      alert("❌ সমস্যা হয়েছে: " + res.message);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300 relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 text-2xl">✕</button>

        <h2 className="text-2xl font-black text-[#0D1B3E] uppercase tracking-tighter mb-8 text-center">
          Edit Entity Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
            <input name="phone" defaultValue={user.phone} type="text" className="w-full border-gray-100 border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="+91..." />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Drug License No</label>
            <input name="licenseNo" defaultValue={user.licenseNo} type="text" className="w-full border-gray-100 border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="DL-12345" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">GST Identification No</label>
            <input name="gstNo" defaultValue={user.gstNo} type="text" className="w-full border-gray-100 border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="22AAAAA0000A1Z5" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Factory Address</label>
            <textarea name="fullAddress" defaultValue={user.fullAddress || user.location} className="w-full border-gray-100 border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none h-24 font-bold" placeholder="Street, City, State..."></textarea>
          </div>

          {/* 🔥 এটা হলো তোমার সেভ বাটন */}
          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-[#0D1B3E] text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 transition shadow-xl active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Saving Changes..." : "Save & Verify Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}