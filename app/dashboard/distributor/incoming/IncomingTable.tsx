"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// 👇 লক্ষ্য করুন: '../actions' কারণ এটি incoming ফোল্ডারের ভেতরে আছে
import { receiveShipmentAction } from "../distributor-actions"; 


// --- ICONS ---
const Icons = {
  Truck: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h12a1 1 0 001-1v-2.5M6 7H4v10h2V7z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
};

export default function IncomingTable({ shipments }: { shipments: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReceive = async (id: string) => {
    if(!confirm("Confirm receipt of goods?")) return;
    setLoadingId(id);
    await receiveShipmentAction(id);
    router.refresh(); 
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mt-6">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipment ID</th>
                    <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {shipments.length === 0 && <tr><td colSpan={3} className="p-10 text-center text-slate-400 text-xs">No pending shipments.</td></tr>}
                {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-6 text-xs font-bold font-mono">#{s.id.substring(0,8).toUpperCase()}</td>
                        <td className="p-6"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">In Transit</span></td>
                        <td className="p-6 text-right">
                            <button 
                                onClick={() => handleReceive(s.id)} 
                                disabled={loadingId === s.id} 
                                className="bg-[#0B1120] text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-green-600 transition-all flex items-center gap-2 ml-auto disabled:opacity-50"
                            >
                                {loadingId === s.id ? "Processing..." : <><Icons.Check /> Receive</>}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}