"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { recallBatchAction } from "@/lib/actions/manufacturer-actions"; // ✅ Correct Import Path

interface RecallButtonProps {
    batchNumber: string; // Note: Ensure this is the ID if the action expects ID, or update action to find by batchNumber
    batchId?: string;    // Adding batchId optional prop just in case
}

export default function RecallButton({ batchNumber, batchId }: RecallButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleRecall() {
        const reason = prompt(`Enter reason for recalling Batch ${batchNumber}:`);
        if (!reason) return; // User cancelled or entered empty reason

        if(!confirm(`Are you sure you want to RECALL Batch ${batchNumber}? This is a critical action.`)) return;
        
        setLoading(true);
        
        // ✅ FIX: Creating FormData to match the Server Action signature
        const formData = new FormData();
        // Use batchId if available, otherwise fallback to batchNumber (backend might need adjustment if it strictly expects UUID)
        formData.append("batchId", batchId || batchNumber); 
        formData.append("reason", reason);

        const res = await recallBatchAction(formData); 
        
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