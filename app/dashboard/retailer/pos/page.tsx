import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PosClientInterface from "./PosClientInterface"; 

// ✅ ডাটা যাতে ক্যাশ না ধরে রাখে, তাই ফোর্স ডাইনামিক
export const dynamic = "force-dynamic";

export default async function RetailerPosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  // ✅ রিটেইলারের ইনভেন্টরি ফেচ (0 স্টকের স্ট্রিপ বা লুজ থাকলেও যাতে শো করে যদি অন্যটা থাকে)
  const myInventory = await prisma.inventory.findMany({
    where: { 
      userId: userId,
      // হয় স্ট্রিপ আছে অথবা লুজ ট্যাবলেট আছে - এমন আইটেম দেখাবে
      OR: [
        { currentStock: { gt: 0 } },
        { looseStock: { gt: 0 } }
      ]
    },
    include: {
      batch: {
        include: { product: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">🛒 POS Terminal</h1>
            <p className="text-slate-500 font-medium">Quick billing for Strips & Loose Tablets.</p>
          </div>
          <div className="hidden md:block text-right">
             <span className="text-xs font-bold bg-white border px-3 py-1 rounded-full text-slate-500">
                {new Date().toDateString()}
             </span>
          </div>
        </div>

        {/* Client Component Load */}
        <PosClientInterface inventory={myInventory} />
      </div>
    </div>
  );
}