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
            recalls: { where: { status: "ACTIVE" } }
          },
        },
      },
    });

    if (unit) {
      return {
        success: true,
        data: {
          type: unit.type, 
          batchNumber: unit.batch.batchNumber,
          expDate: unit.batch.expDate,
          mfgDate: unit.batch.mfgDate,
          mrp: unit.batch.mrp,
          isRecalled: unit.batch.recalls.length > 0,
          unitId: unit.uid,
          // ✅ PRIVACY FILTER: Only public fields
          product: {
            name: unit.batch.product.name,
            genericName: unit.batch.product.genericName,
            type: unit.batch.product.type,
            strength: unit.batch.product.strength,
            // ❌ No basePrice
          },
          manufacturer: {
            name: unit.batch.manufacturer.name,
            address: unit.batch.manufacturer.address,
            licenseNo: unit.batch.manufacturer.licenseNo
          }
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
          isRecalled: batch.recalls.length > 0,
          unitId: null,
          // ✅ PRIVACY FILTER: Only public fields
          product: {
            name: batch.product.name,
            genericName: batch.product.genericName,
            type: batch.product.type,
            strength: batch.product.strength,
            // ❌ No basePrice
          },
          manufacturer: {
            name: batch.manufacturer.name,
            address: batch.manufacturer.address,
            licenseNo: batch.manufacturer.licenseNo
          }
        },
      };
    }

    return { success: false, error: "Product verification failed." };

  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}