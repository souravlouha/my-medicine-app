'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateRetailerProfileAction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return { success: false, message: "Unauthorized!" };

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name, 
        location: address, // স্কিমা অনুযায়ী location অ্যাড্রেস হিসেবে কাজ করবে
        phone: phone 
      }
    });

    revalidatePath("/dashboard/retailer");
    return { success: true, message: "✅ Shop Profile Updated!" };
  } catch (error) {
    return { success: false, message: "Failed to update profile." };
  }
}