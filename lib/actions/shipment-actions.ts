"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createShipmentAction(formData: any) {
  console.log("🚀 STARTING SHIPMENT (CORE MODE)...");

  const senderId = formData.senderId || formData.manufacturerId;
  const receiverId = formData.receiverId || formData.distributorId;

  if (!senderId || !receiverId) {
    return { success: false, error: "Sender or Receiver ID Missing" };
  }

  try {
    // Transaction for Data Integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Shipment
      const shipment = await tx.shipment.create({
        data: {
          manufacturerId: senderId,
          distributorId: receiverId,
          totalAmount: Number(formData.totalAmount) || 0,
          status: "IN_TRANSIT",
          vehicleNo: formData.vehicleNo || null,
          driverPhone: formData.driverPhone || null
        },
      });

      // 2. Add Items
      const items = formData.items || [];
      for (const item of items) {
        await tx.shipmentItem.create({
          data: {
            shipmentId: shipment.id,
            batchId: item.batchId,
            quantity: Number(item.quantity),
            price: Number(item.price) || 0,
          },
        });
      }

      return shipment;
    });

    revalidatePath("/dashboard/shipments");
    return { success: true, message: "Shipment Created Successfully!" };

  } catch (error: any) {
    console.error("🔴 SHIPMENT ERROR:", error);
    return { success: false, error: "Failed to create shipment." };
  }
}