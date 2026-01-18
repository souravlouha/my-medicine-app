"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSaleAction(data: any) {
  // data-তে sellerId, batchId, quantity, totalPrice থাকতে হবে

  try {
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Sales Record তৈরি (Existing Logic)
      const sale = await tx.salesRecord.create({
        data: {
          sellerId: data.sellerId,
          batchId: data.batchId,
          quantity: data.quantity,
          totalPrice: data.totalPrice || 0,
          buyerType: "CONSUMER",
        },
      });

      // 2. ইনভেন্টরি কমানো (Existing Logic)
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

      // 👉 STEP A: আগের ধাপ (Parent) খুঁজে বের করা (Retailer-এর কাছে মালটি কোথা থেকে এসেছিল?)
      const parentMovement = await tx.batchMovement.findFirst({
        where: {
          batchId: data.batchId,
          receiverId: data.sellerId, // Retailer ID
        },
        orderBy: { createdAt: 'desc' }
      });

      // 👉 STEP B: Consumer Movement তৈরি (Tree-এর শেষ মাথা)
      await tx.batchMovement.create({
        data: {
          batchId: data.batchId,
          senderId: data.sellerId,
          receiverId: null, // Consumer-এর নির্দিষ্ট ID নেই
          
          senderName: data.sellerName || "Retailer",
          receiverName: "End Consumer", // UI-তে দেখানোর জন্য
          
          role: "CONSUMER",
          quantity: data.quantity,
          status: "SOLD_TO_CONSUMER",
          
          // 🔗 চেইন লিংক
          parentId: parentMovement ? parentMovement.id : null
        }
      });

      return sale;
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/sales");
    return { success: true, message: "Sale Recorded & Tracked!" };

  } catch (error: any) {
    console.error("Sales Error:", error);
    return { success: false, error: error.message || "Failed to record sale" };
  }
}