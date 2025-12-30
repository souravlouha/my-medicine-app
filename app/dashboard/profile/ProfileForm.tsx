"use client";
import { useState } from "react";
// তোমার actions ফাইল যেখানে আছে সেখান থেকে ইমপোর্ট করো (পাথ ঠিক রেখো)
import { updateFullProfileAction } from "../actions"; 

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Server Action Call (তোমার পুরনো লজিক)
    const res = await updateFullProfileAction(user.id, data);
    alert(res.message); // বা আরও সুন্দর টোস্ট মেসেজ দিতে পারো
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* License Number Input */}
      <div className="space-y-3 group">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest group-hover:text-blue-500 transition-colors">Drug License Number</label>
        <div className="relative">
          <span className="absolute left-6 top-5 text-xl opacity-30">📜</span>
          <input 
            name="licenseNo" 
            defaultValue={user.licenseNo || ""} 
            required 
            className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-transparent rounded-[20px] font-mono font-bold text-[#0D1B3E] uppercase focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-inner" 
            placeholder="DL-XXX-XXX" 
          />
        </div>
      </div>

      {/* GST Number Input */}
      <div className="space-y-3 group">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest group-hover:text-blue-500 transition-colors">GST Number</label>
        <div className="relative">
          <span className="absolute left-6 top-5 text-xl opacity-30">🏢</span>
          <input 
            name="gstNo" 
            defaultValue={user.gstNo || ""} 
            required 
            className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-transparent rounded-[20px] font-mono font-bold text-[#0D1B3E] uppercase focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-inner" 
            placeholder="19AAAAA0000A1Z5" 
          />
        </div>
      </div>

      {/* Phone Input */}
      <div className="space-y-3 group">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest group-hover:text-blue-500 transition-colors">Phone / WhatsApp</label>
        <div className="relative">
          <span className="absolute left-6 top-5 text-xl opacity-30">📞</span>
          <input 
            name="phone" 
            defaultValue={user.phone || ""} 
            required 
            className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-transparent rounded-[20px] font-bold text-[#0D1B3E] focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-inner" 
            placeholder="+91 99999 99999" 
          />
        </div>
      </div>

      {/* City Input */}
      <div className="space-y-3 group">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest group-hover:text-blue-500 transition-colors">City / Location</label>
        <div className="relative">
          <span className="absolute left-6 top-5 text-xl opacity-30">📍</span>
          <input 
            name="location" 
            defaultValue={user.location || ""} 
            required 
            className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-transparent rounded-[20px] font-bold text-[#0D1B3E] focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-inner" 
            placeholder="Kolkata, West Bengal" 
          />
        </div>
      </div>

      {/* Full Address Input (Full Width) */}
      <div className="md:col-span-2 space-y-3 group">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest group-hover:text-blue-500 transition-colors">Registered Office Address</label>
        <textarea 
          name="fullAddress" 
          defaultValue={user.fullAddress || ""} 
          required 
          rows={3} 
          className="w-full p-6 bg-gray-50 border border-transparent rounded-[20px] font-bold text-[#0D1B3E] focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-inner resize-none" 
          placeholder="Enter complete billing address here..."
        ></textarea>
      </div>

      {/* Submit Button */}
      <div className="md:col-span-2 pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#0D1B3E] hover:bg-blue-900 text-white p-6 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl hover:shadow-blue-900/30 active:scale-95 transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none flex items-center justify-center gap-3"
        >
          {loading ? (
             <>
               <span className="animate-spin text-xl">⏳</span> Updating Profile...
             </>
          ) : (
             <>
               Confirm & Save Changes <span className="text-xl">✅</span>
             </>
          )}
        </button>
      </div>
    </form>
  );
}