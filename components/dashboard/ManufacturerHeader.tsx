import EditProfileModal from "./EditProfileModal";

export default function ManufacturerHeader({ user }: { user: any }) {
  return (
    <div className="bg-white rounded-[2rem] p-8 mb-8 border border-gray-100 shadow-sm relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* LEFT: Logo & Name */}
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-[#0D1B3E] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">
              {user.name ? user.name.substring(0, 1).toUpperCase() : "M"}
           </div>
           
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <h1 className="text-3xl font-black text-[#0D1B3E] uppercase tracking-tight">{user.name}</h1>
                 <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">VERIFIED MANUFACTURER</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user.address || "Location Not Updated"}</p>
           </div>
        </div>

        {/* RIGHT: Edit Button */}
        <EditProfileModal user={user} />
      </div>

      {/* BOTTOM: Details Grid */}
      <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8">
         
         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Drug License</p>
            <p className="font-bold text-[#0D1B3E]">{user.licenseNo || "N/A"}</p>
         </div>

         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">GST Number</p>
            <p className="font-bold text-[#0D1B3E]">{user.publicId || "GST-PENDING"}</p> 
         </div>

         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p>
            <p className="font-bold text-[#0D1B3E]">{user.phone || user.email}</p>
         </div>

         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
            <p className="font-bold text-[#0D1B3E] lowercase">{user.email}</p>
         </div>

      </div>
    </div>
  );
}