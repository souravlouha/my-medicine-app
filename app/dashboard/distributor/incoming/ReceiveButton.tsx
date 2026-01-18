"use client";

import { useState } from "react";
import { receiveShipmentAction } from "@/lib/actions/distributor-actions";
import { CheckCircle, Loader2 } from "lucide-react";

export default function ReceiveButton({ shipmentId }: { shipmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReceive = async () => {
    if(!confirm("Are you sure you received this shipment physically?")) return;
    
    setLoading(true);
    const res = await receiveShipmentAction(shipmentId);
    
    if (res.success) {
      alert("✅ Stock Updated Successfully!");
    } else {
      alert("❌ Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleReceive}
      disabled={loading}
      className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 flex justify-center items-center gap-2 transition disabled:opacity-50"
    >
      {loading ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
      {loading ? "Processing..." : "Receive Shipment"}
    </button>
  );
}