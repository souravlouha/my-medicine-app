"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // ⚠️ CSS থাকতেই হবে
import L from "leaflet";

// --- আইকন ফিক্স (Next.js এর জন্য বাধ্যতামূলক) ---
const iconFix = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

// --- ম্যাপ অটো-মুভ কন্ট্রোলার ---
function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.flyTo([center.lat, center.lng], 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function PharmacyMap({ location, pharmacies, onSelect }: any) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    iconFix();
    setIsMounted(true);
  }, []);

  // ম্যাপ লোড না হওয়া পর্যন্ত খালি ডিভ দেখাবে (Hydration Error ফিক্স)
  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-xl">
        <span className="text-slate-400 text-sm">Loading Map...</span>
      </div>
    );
  }

  // কাস্টম আইকন
  const personIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const pharmacyIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/169/169869.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* এই লাইনটি ম্যাপকে নতুন লোকেশনে নিয়ে যাবে */}
        <MapController center={location} />

        {/* আপনার লোকেশন */}
        <Marker position={[location.lat, location.lng]} icon={personIcon}>
          <Popup>আপনি এখানে আছেন</Popup>
        </Marker>

        {/* ফার্মেসি মার্কারস */}
        {pharmacies.map((shop: any) => (
          <Marker
            key={shop.id}
            position={[shop.lat, shop.lng]}
            icon={pharmacyIcon}
            eventHandlers={{
              click: () => onSelect(shop.id),
            }}
          >
            <Popup>
              <div className="font-bold">{shop.name}</div>
              <div className="text-xs text-slate-500">{shop.address}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}