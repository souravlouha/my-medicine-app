"use server";

import { prisma } from "@/lib/prisma";

// =========================================================
// 1. EXISTING TRACKING ACTION (Internal App Tracking)
// =========================================================
export async function trackMedicineAction(query: string) {
  if (!query) return { success: false, error: "Please enter Batch ID or QR." };

  try {
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
    const unit = await prisma.unit.findUnique({
      where: { uid: scannedId },
      include: {
        batch: {
          include: {
            product: true,
            manufacturer: true,
            recalls: { // ✅ Recall স্ট্যাটাস চেক করা হচ্ছে
               where: { status: "ACTIVE" } 
            }
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
          mfgDate: unit.batch.mfgDate, // ✅ Mfg Date যোগ করা হলো
          mrp: unit.batch.mrp,
          product: unit.batch.product,
          manufacturer: unit.batch.manufacturer,
          isRecalled: unit.batch.recalls.length > 0, // ✅ Recall হলে true হবে
          unitId: unit.uid // ✅ Strip ID পাঠানোর জন্য
        },
      };
    }

    // B. সাধারণ ব্যাচ নম্বর চেক করা
    const batch = await prisma.batch.findUnique({
      where: { batchNumber: scannedId },
      include: {
        product: true,
        manufacturer: true,
        recalls: { where: { status: "ACTIVE" } }
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
          isRecalled: batch.recalls.length > 0,
          unitId: null
        },
      };
    }

    return { success: false, error: "Product verification failed." };

  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}