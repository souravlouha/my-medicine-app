"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic"; 
import { ArrowLeft, MapPin, Navigation, Loader2, Crosshair } from "lucide-react";
// ⚠️ Leaflet CSS অবশ্যই ইম্পোর্ট করতে হবে
import "leaflet/dist/leaflet.css";

// --- 1. Dynamic Map Imports (SSR Safe) ---
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// --- 2. Map Re-center Component (ম্যাপ ফিক্স করার জন্য এটি সবচেয়ে জরুরি) ---
// এটি ম্যাপকে জোর করে আপনার নতুন লোকেশনে নিয়ে যাবে
const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const [map, setMap] = useState<any>(null);
  
  // useMap হুকটি ডাইনামিকলি ইম্পোর্ট করতে হবে
  useEffect(() => {
    (async () => {
      const { useMap } = await import("react-leaflet");
      // আমরা এখানে ফেক হুক ব্যবহার করছি না, সরাসরি ম্যাপ এক্সেস করার লজিক এটা
    })();
  }, []);

  // ম্যাপ কন্টেইনারের চাইল্ড হিসেবে থাকলে এটি অটোমেটিক কাজ করবে, 
  // তবে সহজ ফিক্স হিসেবে আমরা MapContainer এর key প্রপ চেঞ্জ করব।
  return null;
};

// ⚠️ সহজ সমাধান: ম্যাপের লোকেশন চেঞ্জ করার জন্য আলাদা কম্পোনেন্ট দরকার নেই, 
// আমরা MapContainer-এর 'key' প্রপ আপডেট করলে ম্যাপ রি-রেন্ডার হবে।

export default function PharmacyLocator() {
  // ডিফল্ট: কলকাতা
  const defaultLocation = { lat: 22.5726, lng: 88.3639 };
  
  const [location, setLocation] = useState(defaultLocation);
  const [mapKey, setMapKey] = useState(0); // এটি ম্যাপ রিফ্রেশ করতে সাহায্য করবে
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [LeafletIcons, setLeafletIcons] = useState<any>(null); 

  // --- 3. আইকন সেটআপ (উইন্ডো এরর ফিক্স) ---
  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined') {
        // ⚠️ লক্ষ্য করুন: L এখানে ইম্পোর্ট হচ্ছে, উপরে নয়।
        const L = (await import('leaflet')).default;
        
        const personIcon = new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        });

        const pharmacyIcon = new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/169/169869.png",
          iconSize: [35, 35],
          iconAnchor: [17, 35],
          popupAnchor: [0, -35]
        });

        setLeafletIcons({ person: personIcon, pharmacy: pharmacyIcon });
      }
    })();
  }, []);

  // --- 4. দোকান জেনারেটর (আপনার ফালাকাটা লোকেশনের আশেপাশে) ---
  const generatePharmacies = (lat: number, lng: number) => {
    return [
      { id: 1, name: "Falakata Medico", lat: lat + 0.0015, lng: lng + 0.0010, distance: "200m", address: "Main Road, Near Chowpathi", open: true },
      { id: 2, name: "Jibon Deep Pharmacy", lat: lat - 0.0020, lng: lng - 0.0015, distance: "500m", address: "College Para", open: true },
      { id: 3, name: "Arogya Niketan", lat: lat + 0.0030, lng: lng - 0.0020, distance: "800m", address: "Station Road", open: false },
      { id: 4, name: "Sanjivani Store", lat: lat - 0.0010, lng: lng + 0.0040, distance: "1.2 km", address: "Hospital Gate", open: true },
    ];
  };

  // --- 5. জিপিএস লোকেশন বের করার ফাংশন ---
  const handleGetLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      alert("Browser location not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // ✅ ফালাকাটার লোকেশন এখানে সেট হবে
        const { latitude, longitude } = position.coords;
        
        setLocation({ lat: latitude, lng: longitude });
        setPharmacies(generatePharmacies(latitude, longitude)); 
        setHasLocation(true);
        setMapKey(prev => prev + 1); // ⚠️ এটি ম্যাপকে ফোর্স করবে নতুন লোকেশনে যেতে
        setLoading(false);
      },
      (error) => {
        console.error("GPS Error: ", error);
        alert("Location blocked! Please allow location access from browser settings (top left lock icon).");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // প্রথমে ডিফল্ট দোকান লোড হবে
  useEffect(() => {
    setPharmacies(generatePharmacies(defaultLocation.lat, defaultLocation.lng));
  }, []);

  // লোডিং বা আইকন না আসা পর্যন্ত অপেক্ষা
  if (!LeafletIcons) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 gap-2">
        <Loader2 className="animate-spin text-blue-600"/>
        <p className="text-slate-500 text-sm">Loading Maps...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* --- Header --- */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-md z-30 sticky top-0">
        <Link href="/" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
            <ArrowLeft size={20} className="text-slate-700"/>
        </Link>
        <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">Nearby Stores</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={10} /> 
                {hasLocation ? "Your Location (Falakata)" : "Default View (Kolkata)"}
            </p>
        </div>
        {/* GPS Button */}
        <button 
          onClick={handleGetLocation}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-90 transition animate-bounce-slow"
        >
          {loading ? <Loader2 size={20} className="animate-spin"/> : <Crosshair size={20}/>}
        </button>
      </div>

      {/* --- Map View --- */}
      <div className="flex-1 relative w-full h-[55vh] z-0 bg-slate-200">
        {/* key={mapKey} পরিবর্তন হলে ম্যাপ নতুন করে রেন্ডার হবে এবং নতুন লোকেশনে জুম হবে */}
        <MapContainer 
            key={mapKey} 
            center={[location.lat, location.lng]} 
            zoom={15} 
            scrollWheelZoom={true} 
            style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Marker */}
            {hasLocation && (
              <Marker position={[location.lat, location.lng]} icon={LeafletIcons.person}>
                  <Popup>You are here!</Popup>
              </Marker>
            )}

            {/* Pharmacy Markers */}
            {pharmacies.map((pharmacy) => (
                <Marker 
                    key={pharmacy.id} 
                    position={[pharmacy.lat, pharmacy.lng]} 
                    icon={LeafletIcons.pharmacy}
                    eventHandlers={{
                        click: () => setSelectedPharmacy(pharmacy.id),
                    }}
                >
                  <Popup>{pharmacy.name}</Popup>
                </Marker>
            ))}
        </MapContainer>

        {/* GPS Prompt if not enabled */}
        {!hasLocation && !loading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-red-100 flex items-center gap-2 w-max">
             <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
             <p className="text-xs font-bold text-slate-700">Tap GPS button to locate you</p>
          </div>
        )}
      </div>

      {/* --- Bottom List View --- */}
      <div className="bg-white rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] -mt-6 relative z-20 p-6 pb-10 min-h-[45vh] max-h-[50vh] overflow-y-auto">
         <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sticky top-0"></div>
         <h2 className="text-lg font-bold text-slate-900 mb-4">Pharmacies List</h2>
         
         <div className="space-y-4">
            {pharmacies.map((item) => (
                <div 
                    key={item.id} 
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${selectedPharmacy === item.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                    onClick={() => {
                      setSelectedPharmacy(item.id);
                      setLocation({ lat: item.lat, lng: item.lng }); 
                      setMapKey(prev => prev + 1); // Focus map on clicked shop
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${selectedPharmacy === item.id ? 'bg-blue-200 text-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                            <MapPin size={20}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                            <p className="text-xs text-slate-500 mb-1">{item.address}</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.open ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.open ? 'Open' : 'Closed'}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">• {item.distance}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <button className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-blue-600 hover:text-white transition shadow-sm">
                            <Navigation size={16}/>
                        </button>
                    </div>
                </div>
            ))}
         </div>
      </div>

    </div>
  );
}