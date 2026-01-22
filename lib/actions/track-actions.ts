"use server";

import { prisma } from "@/lib/prisma";

// =========================================================
// 1. EXISTING TRACKING ACTION (Internal App Tracking)
// =========================================================
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
        movements: { orderBy: { createdAt: 'asc' } },
        recalls: true,
      }
    });

    // 2. ব্যাচ না পেলে QR কোড (Unit UID) দিয়ে খোঁজা
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
      parentId: move.parentId,
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

// =========================================================
// 2. NEW: PUBLIC VERIFICATION ACTION (Smart QR / Google Lens)
// =========================================================
export async function getTrackingData(scannedId: string) {
  if (!scannedId) return { success: false, error: "Invalid ID" };

  try {
    // A. স্মার্ট QR (Unit) চেক করা
    // যেমন: CARTON-..., BOX-..., STRIP-...
    const unit = await prisma.unit.findUnique({
      where: { uid: scannedId },
      include: {
        batch: {
          include: {
            product: true,
            manufacturer: true,
          },
        },
      },
    });

    if (unit) {
      return {
        success: true,
        data: {
          type: unit.type, // STRIP, BOX, or CARTON
          batchNumber: unit.batch.batchNumber,
          expDate: unit.batch.expDate,
          mfgDate: unit.batch.mfgDate,
          mrp: unit.batch.mrp,
          product: unit.batch.product,
          manufacturer: unit.batch.manufacturer,
        },
      };
    }

    // B. সাধারণ ব্যাচ নম্বর চেক করা
    const batch = await prisma.batch.findUnique({
      where: { batchNumber: scannedId },
      include: {
        product: true,
        manufacturer: true,
      },
    });

    if (batch) {
      return {
        success: true,
        data: {
          type: "BATCH",
          batchNumber: batch.batchNumber,
          expDate: batch.expDate,
          mfgDate: batch.mfgDate,
          mrp: batch.mrp,
          product: batch.product,
          manufacturer: batch.manufacturer,
        },
      };
    }

    return { success: false, error: "Product verification failed." };

  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}