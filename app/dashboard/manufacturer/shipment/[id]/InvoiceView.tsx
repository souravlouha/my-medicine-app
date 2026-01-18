"use client";

import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InvoiceView() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      
      <button 
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-black transition shadow-sm"
      >
        <Printer size={16} />
        Print Invoice
      </button>
    </div>
  );
}