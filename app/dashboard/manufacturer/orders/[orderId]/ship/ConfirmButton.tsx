"use client";

import { shipApprovedOrderAction } from "@/lib/actions/manufacturer-actions";
import { useState } from "react";
import { Loader2, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConfirmButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        if(!confirm("Are you sure you want to generate invoice and ship?")) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("orderId", orderId);

        const res = await shipApprovedOrderAction(formData);

        if (res.success) {
            // ✅ আপডেট: সাকসেস হলে সরাসরি ইনভয়েস পেজে নিয়ে যাবে
            router.push(`/dashboard/manufacturer/orders/${orderId}/invoice`);
        } else {
            alert("❌ Error: " + res.error);
        }
        setLoading(false);
    };

    return (
        <button 
            onClick={handleConfirm} 
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 shadow-lg transition"
        >
            {loading ? <Loader2 className="animate-spin" /> : <Truck />}
            Confirm & Generate Invoice
        </button>
    );
}