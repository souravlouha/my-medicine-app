"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sellMedicineAction(data: any) {
  console.log("🛒 Processing Sale (CORE MODE):", data);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Sales Record
      await tx.salesRecord.create({
        data: {
          sellerId: data.sellerId,
          batchId: data.batchId,
          quantity: data.quantity,
          totalPrice: data.totalPrice || 0,
          buyerType: "CONSUMER",
        },
      });

      // 2. Update Inventory
      const inventory = await tx.inventory.findUnique({
        where: { userId_batchId: { userId: data.sellerId, batchId: data.batchId } }
      });

      if (!inventory || inventory.currentStock < data.quantity) {
        throw new Error("Insufficient stock!");
      }

      await tx.inventory.update({
        where: { id: inventory.id },
        data: { currentStock: { decrement: data.quantity } }
      });
    });

    revalidatePath("/dashboard/inventory");
    return { success: true, message: "Sale Successful!" };

  } catch (error: any) {
    console.error("POS Error:", error);
    return { success: false, error: error.message };
  }
}