"use client";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InvoicePrintButton() {
  return (
    <div className="flex justify-between mb-8 print:hidden">
        <Link href="/dashboard/manufacturer/shipment" className="flex items-center gap-2 text-gray-500 hover:text-gray-800">
            <ArrowLeft size={16} /> Back to Shipments
        </Link>
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-black transition shadow-lg"
        >
            <Printer size={18} /> Print / Download PDF
        </button>
    </div>
  );
}