'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function logActivity(action: string, details: string) {
  try {
    const session = await auth();
    const user = session?.user;

    // ✅ FIX: user.id আছে কিনা সেটাও চেক করা হচ্ছে।
    // TypeScript জানত না যে user থাকলেই user.id থাকবে, তাই এই চেকটি জরুরি।
    if (!user || !user.id) return;

    await prisma.activityLog.create({
      data: {
        action,
        details,
        userId: user.id, // এখন TypeScript নিশ্চিত যে এটি string
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // লগ ফেইল করলে আমরা অ্যাপ ক্র্যাশ করাতে চাই না
  }
}