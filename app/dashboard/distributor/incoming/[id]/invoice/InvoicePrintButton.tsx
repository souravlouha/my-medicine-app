"use client";
import { Printer } from "lucide-react";

export default function InvoicePrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-black transition"
    >
      <Printer size={16} /> Print / PDF
    </button>
  );
}