"use server";

import { prisma } from "@/lib/prisma";

export async function trackMedicineAction(query: string) {
  if (!query) return { success: false, error: "Please enter Batch ID or QR." };

  try {
    // 1. ব্যাচ এবং তার মুভমেন্ট হিস্ট্রি খুঁজে বের করা
    let batch = await prisma.batch.findUnique({
      where: { batchNumber: query },
      include: {
        product: true,
        manufacturer: true,
        inventory: { include: { user: true } },
        // 🌳 নতুন টেবিল ফেচ করা
        movements: {
          orderBy: { createdAt: 'asc' }
        },
        recalls: true,
      }
    });

    // 2. ব্যাচ না পেলে QR কোড দিয়ে খোঁজা
    let unitInfo = null;
    if (!batch) {
      const unit = await prisma.unit.findUnique({ where: { uid: query } });
      if (unit) {
        unitInfo = unit;
        batch = await prisma.batch.findUnique({
          where: { id: unit.batchId },
          include: {
            product: true,
            manufacturer: true,
            inventory: { include: { user: true } },
            movements: { orderBy: { createdAt: 'asc' } },
            recalls: true,
          }
        });
      }
    }

    if (!batch) return { success: false, error: "No record found." };

    // 3. UI-এর জন্য ডেটা সাজানো
    const fullTimeline = batch.movements.map(move => ({
      id: move.id,
      parentId: move.parentId, // এটি ট্রি বানাতে লাগবে
      from: move.senderName,
      distributor: move.receiverName,
      role: move.role,
      quantity: move.quantity,
      status: move.status,
      location: move.location || "N/A",
      date: move.createdAt
    }));

    const currentHolders = batch.inventory.map(inv => ({
      holder: inv.user.name,
      role: inv.user.role,
      stock: inv.currentStock
    }));

    return { 
      success: true, 
      data: {
        batchInfo: batch,
        unitInfo: unitInfo,
        timeline: fullTimeline,
        holders: currentHolders
      }
    };

  } catch (error: any) {
    console.error("Tracking Error:", error);
    return { success: false, error: "Failed to track medicine." };
  }
}