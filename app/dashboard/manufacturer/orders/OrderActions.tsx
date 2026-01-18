"use client";

import { approveOrderAction, rejectOrderAction } from "@/lib/actions/manufacturer-actions";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation"; 

export default function OrderActions({ orderId, status }: { orderId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("orderId", orderId);
    
    const res = await approveOrderAction(formData);
    if(res.success) {
        // Approve হলে পেজ রিফ্রেশ হবে
    } else {
        alert("❌ " + res.error);
    }
    setLoading(false);
  };

  const handleReviewShipment = () => {
    // ✅ এখানে ক্লিক করলে শিপমেন্ট পেজে নিয়ে যাবে (Confirm করার জন্য)
    router.push(`/dashboard/manufacturer/orders/${orderId}/ship`);
  };

  const handleReject = async () => {
    if(!confirm("Reject Order?")) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("orderId", orderId);
    await rejectOrderAction(formData);
    setLoading(false);
  };

  return (
    <div className="flex gap-3 justify-end border-t border-gray-100 pt-4">
      {status === "PENDING" && (
        <>
          <button onClick={handleReject} disabled={loading} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex items-center gap-2">
             <XCircle size={16}/> Reject
          </button>
          
          <button onClick={handleApprove} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
             {loading ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16}/>}
             Approve Order
          </button>
        </>
      )}

      {status === "APPROVED" && (
        <button onClick={handleReviewShipment} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200 transition">
           Review & Ship <ArrowRight size={18}/>
        </button>
      )}
    </div>
  );
}