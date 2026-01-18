import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Truck, Package, User } from "lucide-react";
import CreateShipmentForm from "./CreateShipmentForm"; // 👇 পরের ধাপে বানাচ্ছি

export default async function CreateShipmentPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  // ১. আমার ইনভেন্টরি লোড করা (যাতে স্টক থেকে মাল পাঠাতে পারি)
  const myInventory = await prisma.inventory.findMany({
    where: { userId, currentStock: { gt: 0 } },
    include: { batch: { include: { product: true } } }
  });

  // ২. সব রিটেইলার লোড করা (যাদের কাছে মাল পাঠাবো)
  const retailers = await prisma.user.findMany({
    where: { role: "RETAILER" },
    select: { id: true, name: true, address: true }
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <Truck className="text-blue-600"/> Dispatch to Retailer
        </h1>
        <p className="text-gray-500 text-sm mt-1">Create a new shipment from your existing inventory.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
         <CreateShipmentForm inventory={myInventory} retailers={retailers} />
      </div>

    </div>
  );
}