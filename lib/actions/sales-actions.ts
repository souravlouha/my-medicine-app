"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createSaleAction(data: any) {
  // Auth check — only retailers can sell to consumers
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized: Please login." };

  // Use authenticated userId as seller (ignore client-supplied sellerId)
  const sellerId = userId;

  if (!data.batchId || !data.quantity || data.quantity <= 0) {
    return { success: false, error: "Invalid sale data: batchId and positive quantity required." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. ইনভেন্টরি চেক আগে (stock verify before sale)
      const inventory = await tx.inventory.findUnique({
        where: { userId_batchId: { userId: sellerId, batchId: data.batchId } }
      });

      if (!inventory || inventory.currentStock < data.quantity) {
        throw new Error("Insufficient stock!");
      }

      // 2. Sales Record তৈরি
      const sale = await tx.salesRecord.create({
        data: {
          sellerId: sellerId,
          batchId: data.batchId,
          quantity: data.quantity,
          totalPrice: data.totalPrice || 0,
          buyerType: "CONSUMER",
        },
      });

      // 3. ইনভেন্টরি কমানো
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { currentStock: { decrement: data.quantity } }
      });

      // 4. Parent Movement খুঁজে বের করা
      const parentMovement = await tx.batchMovement.findFirst({
        where: {
          batchId: data.batchId,
          receiverId: sellerId,
        },
        orderBy: { createdAt: 'desc' }
      });

      // 5. Consumer Movement তৈরি
      const seller = await tx.user.findUnique({
        where: { id: sellerId },
        select: { name: true },
      });

      await tx.batchMovement.create({
        data: {
          batchId: data.batchId,
          senderId: sellerId,
          receiverId: null,
          senderName: seller?.name || "Retailer",
          receiverName: "End Consumer",
          role: "CONSUMER",
          quantity: data.quantity,
          status: "SOLD_TO_CONSUMER",
          parentId: parentMovement ? parentMovement.id : null
        }
      });

      return sale;
    });

    revalidatePath("/dashboard/retailer/inventory");
    revalidatePath("/dashboard/retailer/sales");
    return { success: true, message: "Sale Recorded & Tracked!" };

  } catch (error: any) {
    console.error("Sales Error:", error);
    return { success: false, error: error.message || "Failed to record sale" };
  }
}