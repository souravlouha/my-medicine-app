"use client";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal"; // এই ফাইলটি তৈরি করেছো কি না নিশ্চিত করো

interface HeaderProps {
  user: {
    id: string; // id যোগ করা হয়েছে যাতে এডিট করার সময় কাজে লাগে
    name: string;
    fullAddress: string | null;
    licenseNo: string | null;
    gstNo: string | null;
    phone: string | null;
    email: string;
  };
}

export default function ManufacturerHeader({ user }: HeaderProps) {
  // Modal ওপেন বা ক্লোজ করার জন্য স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-100 p-8 rounded-[2.5rem] shadow-sm mb-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-[#0D1B3E] uppercase tracking-tighter">
                {user.name}
              </h1>
              <span className="bg-green-100 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-tighter">
                Verified Manufacturer
              </span>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              {user.fullAddress || "Address not updated"}
            </p>
          </div>

          {/* Edit Profile বাটনে ক্লিক করলে Modal খুলবে */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0D1B3E] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8 border-t border-gray-50 pt-8">
          <InfoBox label="Drug License" value={user.licenseNo} />
          <InfoBox label="GST Number" value={user.gstNo} />
          <InfoBox label="Contact" value={user.phone} />
          <InfoBox label="Email" value={user.email} />
        </div>
      </div>

      {/* Modal কম্পোনেন্টটি এখানে কল করা হচ্ছে */}
      {isModalOpen && (
        <EditProfileModal user={user} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

function InfoBox({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1.5">{label}</p>
      <p className="text-xs font-black text-[#0D1B3E]">{value || "NOT SET"}</p>
    </div>
  );
}