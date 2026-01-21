// components/PharmacyMap.tsx
"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// আইকন ফিক্স (Leaflet এর ডিফল্ট আইকন নেক্সট জেএস এ লোড হয় না)
const fixIcons = () => {
  const iconDefault = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  L.Marker.prototype.options.icon = iconDefault;
};

// ম্যাপ মুভ করার জন্য ছোট্ট ফাংশন
function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 2 });
  }, [lat, lng, map]);
  return null;
}

export default function PharmacyMap({ location, pharmacies, onSelect }: any) {
  
  useEffect(() => {
    fixIcons();
  }, []);

  const personIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const pharmacyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/169/169869.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* ম্যাপকে নতুন লোকেশনে নিয়ে যাবে */}
      <FlyToLocation lat={location.lat} lng={location.lng} />

      {/* ইউজার মার্কার */}
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
            <b>{shop.name}</b> <br /> {shop.distance}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}