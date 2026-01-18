'use server'

import { prisma } from "@/lib/prisma"; // ✅ FIX: db এর বদলে prisma ইম্পোর্ট
import { auth } from "@/auth";

export async function logActivity(action: string, details: string) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) return;

    await prisma.activityLog.create({
      data: {
        action,
        details,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // লগ ফেইল করলে আমরা অ্যাপ ক্র্যাশ করাতে চাই না, তাই সাইলেন্টলি ইগনোর করছি
  }
}