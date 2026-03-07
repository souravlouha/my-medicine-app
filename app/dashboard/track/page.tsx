import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TrackClient from "./TrackClient";

export const dynamic = "force-dynamic";

export default async function DashboardTrackingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const role = (session.user as { role?: string }).role ?? "";

  // Fetch up to 8 recent batches the current user is associated with,
  // to power the Quick Track shortcuts.
  const recentBatches = await prisma.batch.findMany({
    where:
      role === "MANUFACTURER"
        ? { manufacturerId: userId }
        : {
            inventory: {
              some: { userId },
            },
          },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      batchNumber: true,
      product: { select: { name: true, type: true } },
    },
  });

  return (
    <TrackClient
      recentBatches={recentBatches.map((b) => ({
        id: b.id,
        batchNumber: b.batchNumber,
        product: { name: b.product.name, type: b.product.type },
      }))}
    />
  );
}
