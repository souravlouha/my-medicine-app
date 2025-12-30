"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./distributor-actions"; 

// --- ICONS ---
const Icons = {
  TrendingUp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Package: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Truck: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h12a1 1 0 001-1v-2.5M6 7H4v10h2V7z" /></svg>,
  Alert: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Verified: () => <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Wallet: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
};

type Props = {
  distributor: any;
  inventory: any[];
  shipments: any[];
  retailerCount?: number; // ✅ নতুন প্রপস
};

export default function DistributorDashboard({ distributor, inventory, shipments, retailerCount = 0 }: Props) {
  const router = useRouter();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [greeting, setGreeting] = useState("");

  const [formData, setFormData] = useState({
    name: distributor.name || "",
    location: distributor.location || "",
    phone: distributor.phone || "",
    licenseNo: distributor.licenseNo || "",
    gstNo: distributor.gstNo || "",
  });

  const safeInventory = inventory || [];
  const safeShipments = shipments || [];
  
  // ক্যালকুলেশন
  const totalStock = safeInventory.reduce((sum, item) => sum + item.currentStock, 0);
  const incomingCount = safeShipments.filter(s => s.status === "IN_TRANSIT" || s.status === "PENDING").length;
  const lowStockItems = safeInventory.filter(item => item.currentStock < 50);

  // Time based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const result = await updateProfile(distributor.id, formData);
    setIsSaving(false);
    if (result.success) {
      setIsEditOpen(false);
      router.refresh();
    } else {
      alert("Failed to update.");
    }
  };

  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const count = safeShipments.filter(s => new Date(s.createdAt).toDateString() === d.toDateString()).length;
      const height = count > 0 ? `${Math.min(count * 30, 100)}%` : '5%';
      data.push({ day: dayName, count, height });
    }
    return data;
  }, [safeShipments]);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-24">
       
       {/* 1. HEADER */}
       <div className="relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-white/50 overflow-hidden bg-opacity-80 backdrop-blur-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
           
           <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
               <div className="flex-1">
                  <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
                     <Icons.Clock /> {greeting}, Welcome back
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                     <h1 className="text-4xl md:text-5xl font-black text-[#0B1120] tracking-tighter">{distributor.name}</h1>
                     <span className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-blue-200">
                        <Icons.Verified /> Verified
                     </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 md:gap-12">
                      <DetailItem label="License ID" value={distributor.licenseNo} />
                      <DetailItem label="Location" value={distributor.location} />
                      <DetailItem label="GST Number" value={distributor.gstNo} />
                      <DetailItem label="Contact" value={distributor.phone} />
                  </div>
               </div>
               
               <button 
                  onClick={() => setIsEditOpen(true)} 
                  className="group relative px-6 py-3 bg-[#0B1120] text-white rounded-2xl font-bold uppercase text-xs tracking-widest overflow-hidden hover:scale-105 transition-transform"
               >
                  <span className="relative z-10 flex items-center gap-2"><Icons.Edit /> Edit Profile</span>
               </button>
           </div>
       </div>

       {/* 2. KPI CARDS */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Inventory */}
          <div className="bg-gradient-to-br from-[#0B1120] to-[#1a2333] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500"><Icons.Package /></div>
             <div className="relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4 backdrop-blur-md"><Icons.Package /></div>
                <h2 className="text-5xl font-black tracking-tight">{totalStock}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-widest">Your Stock</p>
             </div>
          </div>

          {/* Active Retailers (New) */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-8 opacity-5"><Icons.Users /></div>
             <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4"><Icons.Users /></div>
             <h2 className="text-5xl font-black tracking-tight text-[#0B1120]">{retailerCount}</h2>
             <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-widest">Active Retailers</p>
          </div>

          {/* Incoming */}
          <div 
            onClick={() => router.push('/dashboard/distributor/incoming')}
            className="bg-gradient-to-br from-blue-600 to-blue-500 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-200 relative overflow-hidden group cursor-pointer hover:shadow-blue-300 transition-all"
          >
             <div className="absolute right-0 top-0 p-8 opacity-20 group-hover:rotate-12 transition-transform"><Icons.Truck /></div>
             <div className="relative z-10">
                <div className="flex justify-between items-start">
                   <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4 backdrop-blur-md"><Icons.Truck /></div>
                   {incomingCount > 0 && <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">Action Needed</span>}
                </div>
                <h2 className="text-5xl font-black tracking-tight">{incomingCount}</h2>
                <p className="text-blue-100 text-xs font-bold uppercase mt-2 tracking-widest">Incoming Shipments</p>
             </div>
          </div>

          {/* Alerts */}
          <div className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${lowStockItems.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-white shadow-sm'}`}>
             <div className={`p-3 rounded-2xl w-fit mb-4 ${lowStockItems.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}><Icons.Alert /></div>
             <h2 className={`text-5xl font-black tracking-tight ${lowStockItems.length > 0 ? 'text-red-600' : 'text-[#0B1120]'}`}>{lowStockItems.length}</h2>
             <p className={`text-xs font-bold uppercase mt-2 tracking-widest ${lowStockItems.length > 0 ? 'text-red-400' : 'text-slate-400'}`}>Critical Alerts</p>
          </div>
       </div>

       {/* 3. CHARTS & TOP PRODUCTS */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Bar Chart */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-50">
             <div className="flex justify-between items-center mb-12">
                <div>
                    <h3 className="text-xl font-black text-[#0B1120]">Weekly Throughput</h3>
                    <p className="text-xs text-slate-400 mt-1">Movement of goods over last 7 days</p>
                </div>
                <span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Analytics</span>
             </div>
             
             <div className="flex items-end justify-between h-64 gap-2 md:gap-6 px-2">
                {weeklyData.map((d, i) => (
                   <div key={i} className="flex flex-col items-center gap-4 w-full group cursor-pointer">
                      <div className="w-full relative h-full flex items-end">
                         <div 
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-300 rounded-2xl transition-all duration-500 group-hover:to-blue-800 shadow-lg shadow-blue-100 opacity-80 group-hover:opacity-100"
                            style={{ height: d.height }}
                         ></div>
                         <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#0B1120] text-white text-[10px] font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2 shadow-xl whitespace-nowrap z-20">
                            {d.count} Shipments
                         </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{d.day}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Top Inventory List (New) */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-50 flex flex-col relative">
             <h3 className="text-xl font-black text-[#0B1120] mb-8">Top Inventory</h3>
             
             <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {safeInventory.length === 0 && <p className="text-sm text-slate-400">No inventory found.</p>}
                {safeInventory.slice(0, 5).map((item, i) => (
                   <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group">
                      <div className="flex items-center gap-4">
                         <span className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 font-bold rounded-full text-xs">{i+1}</span>
                         <div>
                            <p className="text-sm font-bold text-[#0B1120]">{item.medicineName}</p>
                            <p className="text-[10px] text-slate-400 uppercase">Batch: {item.id.substring(0,4)}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="block font-bold text-[#0B1120]">{item.currentStock}</span>
                         <span className="text-[9px] text-green-500 font-bold uppercase">Units</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>

       {/* --- EDIT MODAL --- */}
       {isEditOpen && (
         <div className="fixed inset-0 bg-[#0B1120]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-6">
                  <div>
                    <h2 className="text-3xl font-black text-[#0B1120] uppercase">Update Profile</h2>
                    <p className="text-slate-400 text-sm mt-1">Ensure all details are accurate for verification.</p>
                  </div>
                  <button onClick={() => setIsEditOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"><Icons.Close /></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Distributor Name" name="name" value={formData.name} onChange={handleEditChange} />
                  <InputGroup label="City / Location" name="location" value={formData.location} onChange={handleEditChange} />
                  <InputGroup label="Phone Number" name="phone" value={formData.phone} onChange={handleEditChange} />
                  <InputGroup label="Drug License No." name="licenseNo" value={formData.licenseNo} onChange={handleEditChange} />
                  <InputGroup label="GST Number" name="gstNo" value={formData.gstNo} onChange={handleEditChange} />
               </div>

               <div className="mt-10 flex justify-end gap-4">
                  <button onClick={() => setIsEditOpen(false)} className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-gray-50 uppercase text-xs tracking-widest transition-colors">Cancel</button>
                  <button onClick={handleSaveProfile} disabled={isSaving} className="px-10 py-4 bg-[#0B1120] text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
               </div>
            </div>
         </div>
       )}

    </div>
  );
}

// --- SUB-COMPONENTS ---
function DetailItem({ label, value }: any) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
            <span className="font-bold text-[#0B1120] text-sm md:text-base">{value || <span className="text-slate-300 italic">Not set</span>}</span>
        </div>
    );
}

function InputGroup({ label, name, value, onChange }: any) {
   return (
      <div className="space-y-3">
         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
         <input 
            type="text" name={name} value={value} onChange={onChange}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
         />
      </div>
   );
}

function LegendItem({ color, label, percent }: any) {
    return (
        <div className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${color} group-hover:scale-125 transition-transform`}></span>
                <span className="text-xs font-bold text-slate-600">{label}</span>
            </div>
            <span className="text-xs font-bold text-slate-400">{percent}</span>
        </div>
    );
}