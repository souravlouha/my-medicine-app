"use client";

import { recallBatchAction } from "@/lib/actions/manufacturer-actions";
import { useState } from "react";

export default function RecallButton({ batchId, batchNo }: { batchId: string, batchNo: string }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRecall(formData: FormData) {
    setLoading(true);
    const res = await recallBatchAction(formData);
    if (res.success) {
        alert(res.message);
        setShowModal(false);
    } else {
        alert(res.error);
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-4 py-2 rounded-lg text-xs font-bold transition-all"
      >
        ⚠️ Recall Batch
      </button>

      {/* Professional Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            <div className="bg-red-50 p-6 border-b border-red-100">
              <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                ⚠️ Confirm Emergency Recall
              </h3>
              <p className="text-sm text-red-600 mt-1">
                This action will mark Batch <strong>{batchNo}</strong> as unsafe across the entire supply chain.
              </p>
            </div>

            <form action={handleRecall} className="p-6 space-y-4">
              <input type="hidden" name="batchId" value={batchId} />
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Recall</label>
                <select name="reason" className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-red-500 outline-none">
                  <option value="Quality Check Failed">Quality Check Failed</option>
                  <option value="Contamination Suspected">Contamination Suspected</option>
                  <option value="Packaging Defect">Packaging Defect</option>
                  <option value="Regulatory Order">Regulatory Order</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition"
                >
                  {loading ? "Processing..." : "Confirm Recall"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}