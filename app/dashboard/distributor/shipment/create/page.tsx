import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Truck, FileText } from "lucide-react";
import CreateShipmentForm from "./CreateShipmentForm";

export default async function CreateShipmentPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // ১. ইনভেন্টরি ফেচ করা (যেগুলোর স্টক ০ এর বেশি)
  const myInventory = await prisma.inventory.findMany({
    where: { userId, currentStock: { gt: 0 } },
    include: { batch: { include: { product: true } } }
  });

  // ২. রিটেইলার লিস্ট ফেচ করা
  const retailers = await prisma.user.findMany({
    where: { role: "RETAILER" },
    select: { id: true, name: true, address: true, phone: true }
  });

  // ৩. নতুন ইনভয়েস নম্বর জেনারেট করা (উদাহরণ: INV-2026001)
  const totalShipments = await prisma.shipment.count({ where: { manufacturerId: userId } });
  const nextInvoiceNo = `INV-${new Date().getFullYear()}${String(totalShipments + 1).padStart(3, '0')}`;

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-lg text-white"><Truck size={24}/></div>
             New Dispatch & Invoice
          </h1>
          <p className="text-slate-500 mt-1 ml-1">Create a shipment, generate invoice, and dispatch stock.</p>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Number</p>
            <p className="text-2xl font-mono font-bold text-blue-600">{nextInvoiceNo}</p>
        </div>
      </div>

      {/* Main Form Component */}
      <CreateShipmentForm 
        inventory={myInventory} 
        retailers={retailers} 
        invoiceNo={nextInvoiceNo}
      />
    </div>
  );
}