import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DispatchManager from "./DispatchManager";

export default async function DispatchPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  try {
    const manufacturer = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, location: true, gstNo: true }
    });

    if (!manufacturer) {
      redirect("/login");
    }

    const distributors = await prisma.user.findMany({
      where: { role: "DISTRIBUTOR" },
      select: { id: true, name: true, location: true, gstNo: true }
    });

    const batches = await prisma.batch.findMany({
      where: { manufacturerId: userId, currentStock: { gt: 0 } },
      orderBy: { createdAt: 'desc' }
    });

    const shipments = await prisma.shipment.findMany({
      where: { manufacturerId: userId },
      include: { distributor: true },
      orderBy: { createdAt: 'desc' }
    });

    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <DispatchManager 
          distributors={distributors} 
          batches={batches} 
          manufacturer={manufacturer} 
          shipments={shipments} 
        />
      </div>
    );

  } catch (error) {
    console.error("DB Error:", error);
    redirect("/login");
  }
}