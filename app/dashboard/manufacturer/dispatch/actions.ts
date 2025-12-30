"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createShipmentAction(data: {
  manufacturerId: string;
  distributorId: string;
  items: { id: string; quantity: number; unitPrice: number }[];
}) {
  try {
    if (!data.manufacturerId || !data.distributorId || data.items.length === 0) {
      return { success: false, error: "Missing required fields." };
    }

    // Calculate Total Amount
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Use Transaction to Ensure Data Integrity
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Create Shipment Record
      const shipment = await tx.shipment.create({
        data: {
          manufacturerId: data.manufacturerId,
          distributorId: data.distributorId,
          totalAmount: totalAmount,
          status: "IN_TRANSIT",
          // items relation will be created below
        },
      });

      // 2. Create Shipment Items & Update Batch Stock
      for (const item of data.items) {
        // Check Stock First
        const batch = await tx.batch.findUnique({ where: { id: item.id } });
        if (!batch || batch.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for Batch ID: ${item.id}`);
        }

        // Create Shipment Item
        await tx.shipmentItem.create({
          data: {
            shipmentId: shipment.id,
            batchId: item.id,
            quantity: item.quantity,
            price: item.unitPrice
          }
        });

        // Reduce Stock
        await tx.batch.update({
          where: { id: item.id },
          data: { currentStock: { decrement: item.quantity } }
        });
      }

      return shipment;
    });

    revalidatePath("/dashboard/manufacturer/dispatch");
    return { success: true, message: "Shipment created successfully!" };

  } catch (error: any) {
    console.error("Create Shipment Error:", error);
    return { success: false, error: error.message || "Failed to create shipment." };
  }
}