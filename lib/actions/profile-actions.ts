"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateFullProfileAction(userId: string, data: {
  phone: any;
  licenseNo: any;
  gstNo: any;
  fullAddress: any;
}) {
  try {
    // ডাটাবেসে আপডেট করা হচ্ছে
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: data.phone as string,
        
        // ✅ FIX: স্কিমাতে ফিল্ডের নাম 'licenseNo', তাই 'licenseNumber' এর বদলে এটি ব্যবহার করা হলো
        licenseNo: data.licenseNo as string,
        
        // ✅ FIX: ফর্মের 'fullAddress' কে স্কিমার 'address' ফিল্ডে ম্যাপ করা হলো
        address: data.fullAddress as string,

        // নোট: যদি আপনার স্কিমায় 'gstNumber' বা 'gstNo' নামে কোনো ফিল্ড থাকে, 
        // তবেই নিচের লাইনটি আনকমেন্ট করবেন। অন্যথায় এটি এরর দিতে পারে।
        // gstNumber: data.gstNo as string, 
      },
    });

    // ড্যাশবোর্ড রিফ্রেশ করা
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return { success: false, message: error.message };
  }
}