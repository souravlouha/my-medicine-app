"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ১. অপারেটর লিস্ট নিয়ে আসা
export async function getOperators() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: [] };

  try {
    const operators = await prisma.user.findMany({
      where: {
        ownerId: session.user.id, // আমার আন্ডারে যারা আছে
        role: "OPERATOR"
      },
      select: { id: true, name: true, email: true, createdAt: true } // পাসওয়ার্ড নেব না
    });
    return { success: true, data: operators };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// ২. নতুন অপারেটর অ্যাড করা
export async function addOperator(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const pin = formData.get("pin") as string; // অপারেটররা পিন দিয়ে ঢুকবে

  if (!name || !pin) return { success: false, error: "Name and PIN required" };

  try {
    // আমরা ফেক ইমেল জেনারেট করব যাতে লগইন সিস্টেমে সমস্যা না হয়
    // format: operator-PIN-ManufacturerID@system.local
    const fakeEmail = `op-${pin}-${session.user.id.substring(0,4)}@medtrace.local`;
    
    // পিন হ্যাস করা হচ্ছে
    const hashedPassword = await bcrypt.hash(pin, 10);

    await prisma.user.create({
      data: {
        name,
        email: fakeEmail, 
        password: hashedPassword,
        role: "OPERATOR",
        ownerId: session.user.id, // লিংক করে দিলাম
      }
    });

    revalidatePath("/dashboard/manufacturer/operators");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add operator" };
  }
}

// ৩. অপারেটর ডিলিট করা
export async function deleteOperator(operatorId: string) {
  try {
    await prisma.user.delete({ where: { id: operatorId } });
    revalidatePath("/dashboard/manufacturer/operators");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete" };
  }
}