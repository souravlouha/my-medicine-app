"use client";

import { useState } from "react";
import { updateProfileAction } from "@/lib/actions/manufacturer-actions";

export default function EditProfileModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    const res = await updateProfileAction(formData);
    
    if (res.success) {
      alert(res.message);
      setIsOpen(false);
      window.location.reload(); 
    } else {
      alert("❌ " + res.error);
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#0D1B3E] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black transition shadow-lg"
      >
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#0D1B3E] p-6 text-white flex justify-between items-center">
               <h3 className="text-lg font-bold uppercase">Update Company Profile</h3>
               <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Company Name</label>
                 <input name="name" defaultValue={user.name} required className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 ring-blue-900 outline-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Drug License No</label>
                    <input name="licenseNo" defaultValue={user.licenseNo || ""} className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 ring-blue-900 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Contact Phone</label>
                    <input name="phone" defaultValue={user.phone || ""} placeholder="+91..." className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 ring-blue-900 outline-none" />
                  </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Location / Address</label>
                 <textarea name="address" defaultValue={user.address || ""} rows={3} className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 ring-blue-900 outline-none"></textarea>
               </div>
               <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
                 {loading ? "Saving..." : "Save Changes"}
               </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}