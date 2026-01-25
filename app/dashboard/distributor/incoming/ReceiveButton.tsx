"use client";

import { useState } from "react";
import { receiveShipmentAction } from "@/lib/actions/distributor-actions";
import { CheckCircle, Loader2 } from "lucide-react";

export default function ReceiveButton({ shipmentId }: { shipmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReceive = async () => {
    if (!confirm("Are you sure you received this shipment physically?")) return;
    
    setLoading(true);
    const res = await receiveShipmentAction(shipmentId);
    
    if (res.success) {
      alert("✅ Stock Updated Successfully!");
      // Optionally trigger a refresh of the shipment list here if needed
      // window.location.reload(); 
    } else {
      alert("❌ Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleReceive}
      disabled={loading}
      className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 flex justify-center items-center gap-2 transition disabled:opacity-50 shadow-sm"
    >
      {loading ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
      {loading ? "Processing..." : "Receive & Add to Stock"}
    </button>
  );
}