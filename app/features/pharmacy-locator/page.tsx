"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, MapPin, Navigation, Loader2, Crosshair } from "lucide-react";

// ⚠️ ম্যাপ কম্পোনেন্টটি ডাইনামিক ইম্পোর্ট করা হচ্ছে (SSR বন্ধ রাখার জন্য)
const PharmacyMap = dynamic(() => import("@/components/PharmacyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-200">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="ml-2 text-slate-600">মানচিত্র লোড হচ্ছে...</span>
    </div>
  ),
});

export default function PharmacyLocator() {
  // ডিফল্ট: কলকাতা
  const defaultLocation = { lat: 22.5726, lng: 88.3639 };
  const [location, setLocation] = useState(defaultLocation);
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);
  
  // ডামি ডাটা জেনারেটর
  const generatePharmacies = (lat: number, lng: number) => {
    return [
      { id: 1, name: "City Pharmacy", lat: lat + 0.0015, lng: lng + 0.0010, distance: "200m", address: "Main Road", open: true },
      { id: 2, name: "Jibon Deep", lat: lat - 0.0020, lng: lng - 0.0015, distance: "500m", address: "College Para", open: true },
      { id: 3, name: "Health Care", lat: lat + 0.0030, lng: lng - 0.0020, distance: "800m", address: "Station Road", open: false },
      { id: 4, name: "Sanjivani", lat: lat - 0.0010, lng: lng + 0.0040, distance: "1.2 km", address: "Hospital Gate", open: true },
    ];
  };

  const [pharmacies, setPharmacies] = useState<any[]>([]);

  // শুরুতে ডিফল্ট লোকেশনের দোকান দেখাবে
  useEffect(() => {
    setPharmacies(generatePharmacies(defaultLocation.lat, defaultLocation.lng));
  }, []);

  const handleGetLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("আপনার ব্রাউজারে লোকেশন সাপোর্ট নেই।");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setPharmacies(generatePharmacies(latitude, longitude));
        setHasLocation(true);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        alert("লোকেশন পাওয়া যাচ্ছে না। দয়া করে ব্রাউজারের লোকেশন পারমিশন চেক করুন।");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* --- Header --- */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-md z-30 sticky top-0">
        <Link href="/" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
            <ArrowLeft size={20} className="text-slate-700"/>
        </Link>
        <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">ফার্মেসি খুঁজুন</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={10} /> 
                {hasLocation ? "আপনার লোকেশন" : "ডিফল্ট ভিউ (কলকাতা)"}
            </p>
        </div>
        <button 
          onClick={handleGetLocation}
          className={`p-3 rounded-full shadow-lg transition ${hasLocation ? 'bg-green-600 text-white' : 'bg-blue-600 text-white animate-bounce'}`}
        >
          {loading ? <Loader2 size={20} className="animate-spin"/> : <Crosshair size={20}/>}
        </button>
      </div>

      {/* --- Map Area --- */}
      <div className="flex-1 relative w-full h-[55vh] z-0 bg-slate-200">
         {/* এখানে আমরা আলাদা করা ম্যাপ কম্পোনেন্ট লোড করছি */}
         <PharmacyMap 
            location={location} 
            pharmacies={pharmacies} 
            onSelect={(id: number) => setSelectedPharmacy(id)}
         />
      </div>

      {/* --- Pharmacy List --- */}
      <div className="bg-white rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] -mt-6 relative z-20 p-6 pb-20 min-h-[45vh] overflow-y-auto">
         <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sticky top-0"></div>
         <h2 className="text-lg font-bold text-slate-900 mb-4">কাছাকাছি ফার্মেসি</h2>
         
         <div className="space-y-4">
            {pharmacies.map((item) => (
                <div 
                    key={item.id} 
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${selectedPharmacy === item.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
                    onClick={() => {
                      setSelectedPharmacy(item.id);
                      setLocation({ lat: item.lat, lng: item.lng });
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <MapPin size={20}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                            <p className="text-xs text-slate-500 mb-1">{item.address}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.open ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {item.open ? 'Open' : 'Closed'}
                            </span>
                        </div>
                    </div>
                    <button className="p-2 bg-slate-100 rounded-full text-slate-600">
                        <Navigation size={16}/>
                    </button>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}