"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { recallBatchAction } from "@/lib/actions/recall-actions";

// আপনার দেওয়া কোড অনুযায়ী ইন্টারফেস তৈরি করা হলো
interface RecallButtonProps {
    batchNumber: string;
}

export default function RecallButton({ batchNumber }: RecallButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleRecall() {
        if(!confirm(`Are you sure you want to RECALL Batch ${batchNumber}? This is a critical action.`)) return;
        
        setLoading(true);
        // ব্যাচ নম্বর দিয়ে অ্যাকশন কল করা হচ্ছে
        const res = await recallBatchAction(batchNumber); 
        
        if(res.success) {
            alert("✅ Batch Recalled Successfully!");
            window.location.reload();
        } else {
            alert("❌ Failed: " + res.error);
        }
        setLoading(false);
    }

    return (
        <button 
            onClick={handleRecall} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition text-xs font-bold shadow-sm"
        >
            <AlertTriangle size={16} />
            {loading ? "Processing..." : "Initiate Recall"}
        </button>
    );
}