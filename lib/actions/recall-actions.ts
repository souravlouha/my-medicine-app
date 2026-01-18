"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recallBatchAction(batchNumber: string, reason: string) {
  try {
    // ব্যাচটি খুঁজে বের করা
    const batch = await prisma.batch.findUnique({ where: { batchNumber } });
    
    if (!batch) return { success: false, error: "Batch not found" };

    // Recall টেবিলে এন্ট্রি দেওয়া
    await prisma.recall.create({
      data: {
        batchId: batch.id,
        reason: reason,
        status: "ACTIVE"
      }
    });

    revalidatePath("/track"); // যাতে পাবলিক পেজে সাথে সাথে আপডেট হয়
    return { success: true, message: "Batch Recalled Successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to recall batch" };
  }
}