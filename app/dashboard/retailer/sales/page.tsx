import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SalesClient from "./SalesClient"; // ✅ Import new client

export const dynamic = "force-dynamic";

export default async function SalesHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // ✅ ডাটা ফেচিং
  const sales = await prisma.salesRecord.findMany({
    where: { sellerId: userId },
    include: {
      batch: {
        include: { product: true }
      }
    },
    orderBy: { date: 'desc' }
  });

  // ✅ Client Component এ ডাটা পাঠানো হচ্ছে
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
       <div className="max-w-7xl mx-auto">
          <SalesClient sales={sales} />
       </div>
    </div>
  );
}