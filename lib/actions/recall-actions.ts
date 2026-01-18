"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function recallBatchAction(formData: FormData) {
  // ১. ইউজার অথেন্টিকেশন চেক
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return { success: false, error: "Unauthorized: You must be logged in." };
  }

  // ২. ফর্ম ডাটা নেওয়া
  // আমরা এখানে batchId নামেই নিচ্ছি, তবে এটি ব্যাচ নম্বরও হতে পারে
  const inputId = formData.get("batchId") as string; 
  const reason = formData.get("reason") as string;

  if (!inputId || !reason) {
    return { success: false, error: "Batch ID and Reason are required." };
  }

  try {
    // ৩. ব্যাচটি খুঁজে বের করা (আইডি অথবা ব্যাচ নম্বর দিয়ে)
    const batch = await prisma.batch.findFirst({
      where: {
        OR: [
          { id: inputId },
          { batchNumber: inputId }
        ]
      }
    });

    if (!batch) {
      return { success: false, error: "Batch not found." };
    }

    // ৪. রিকল রেকর্ড তৈরি করা
    await prisma.recall.create({
      data: {
        batchId: batch.id,
        reason: reason,
        status: "ACTIVE",
        // ✅ FIX: issuedBy ফিল্ড যোগ করা হলো (এটি মিসিং ছিল)
        issuedBy: userId 
      }
    });

    // ৫. ইউনিটের স্ট্যাটাস আপডেট করা
    await prisma.unit.updateMany({
      where: { batchId: batch.id },
      data: { status: "RECALLED" }
    });

    revalidatePath("/dashboard/manufacturer/recall");
    return { success: true, message: "⚠️ Batch Recalled Successfully!" };

  } catch (error: any) {
    console.error("Recall Error:", error);
    return { success: false, error: "Failed to process recall request." };
  }
}