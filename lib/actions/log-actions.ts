"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ ফিক্স: @/auth এর বদলে @/lib/auth

export async function logActivity(action: string, details: string) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) return;

    await prisma.activityLog.create({
      data: {
        userId: user.id as string,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}