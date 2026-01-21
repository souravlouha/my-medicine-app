"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic"; 
import { ArrowLeft, MapPin, Navigation, Loader2, Crosshair, AlertTriangle } from "lucide-react";

// ⚠️ CSS ইম্পোর্ট সবার উপরে থাকতে হবে
import "leaflet/dist/leaflet.css";

// --- Dynamic Imports ---
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// ম্যাপের পজিশন চেঞ্জ করার জন্য ছোট্ট হুক
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = require("react-leaflet").useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

export default function PharmacyLocator() {
  const defaultLocation = { lat: 22.5726, lng: 88.3639 }; // কলকাতা
  const [location, setLocation] = useState(defaultLocation);
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [icons, setIcons] = useState<any>(null);

  // --- ফিক্স: আইকন লোডিং ---
  useEffect(() => {
    const loadIcons = async () => {
      const L = (await import("leaflet")).default;
      setIcons({
        person: new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        }),
        pharmacy: new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/169/169869.png",
          iconSize: [35, 35],
          iconAnchor: [17, 35],
          popupAnchor: [0, -35]
        })
      });
    };
    loadIcons();
  }, []);

  const pharmacies = [
    { id: 1, name: "Local Pharmacy 1", lat: location.lat + 0.002, lng: location.lng + 0.002, address: "Nearby Street" },
    { id: 2, name: "City Medicos", lat: location.lat - 0.002, lng: location.lng - 0.002, address: "Main Road" },
  ];

  const handleGetLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Browser does not support geolocation");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setHasLocation(true);
        setLoading(false);
      },
      () => {
        alert("Please enable location permissions!");
        setLoading(false);
      }
    );
  };

  if (!icons) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white p-4 shadow-md z-30 flex items-center gap-4">
        <Link href="/"><ArrowLeft className="text-slate-700"/></Link>
        <h1 className="font-bold flex-1">Pharmacy Locator</h1>
        <button onClick={handleGetLocation} className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
          {loading ? <Loader2 className="animate-spin"/> : <Crosshair/>}
        </button>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[location.lat, location.lng]} 
          zoom={15} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap'/>
          <RecenterMap lat={location.lat} lng={location.lng} />
          
          {hasLocation && (
            <Marker position={[location.lat, location.lng]} icon={icons.person}>
               <Popup>You</Popup>
            </Marker>
          )}

          {pharmacies.map(p => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icons.pharmacy}>
              <Popup>{p.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}