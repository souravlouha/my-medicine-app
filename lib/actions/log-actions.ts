'use server'

import { db } from "@/lib/db"; // অথবা prisma ইমপোর্ট করো
import { auth } from "@/auth";

export async function logActivity(action: string, details: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Log Error:", error);
  }
}