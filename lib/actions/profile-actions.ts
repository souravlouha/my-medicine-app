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
        // ফর্মের 'licenseNo' কে ডাটাবেসের 'licenseNumber' এ ম্যাপ করা হলো
        licenseNumber: data.licenseNo as string,
        // ফর্মের 'gstNo' কে ডাটাবেসের 'gstNumber' এ ম্যাপ করা হলো (যদি ফিল্ড থাকে)
        // নোট: যদি আপনার স্কিমায় 'gstNumber' না থাকে, এই লাইনটি এরর দিতে পারে। 
        // সেক্ষেত্রে এটি রিমুভ করে দিয়েন। তবে সাধারণত বিজনেসের জন্য এটা থাকে।
        // gstNumber: data.gstNo as string, 
        
        // ফর্মের 'fullAddress' কে ডাটাবেসের 'address' এ ম্যাপ করা হলো
        address: data.fullAddress as string,
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