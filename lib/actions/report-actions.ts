"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReportAction(formData: FormData) {
  const medicineName = formData.get("medicineName") as string;
  const batchNo = formData.get("batchNo") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  
  // ১. ভ্যালিডেশন: নাম আর লোকেশন থাকতেই হবে
  if (!medicineName || !location) {
    return { success: false, error: "Medicine name and location are required" };
  }

  try {
    // ২. ডাটাবেসে সেভ করা
    await prisma.report.create({
      data: {
        medicineName,
        // ব্যাচ নম্বর না থাকলে null হিসেবে যাবে (খালি স্ট্রিং যাবে না)
        batchNo: batchNo || null, 
        location,
        description,
        status: "PENDING"
      }
    });

    // ৩. ড্যাশবোর্ডে নতুন ডাটা দেখার জন্য ক্যাশ ক্লিয়ার করা
    // (যাতে অ্যাডমিন পেজ রিফ্রেশ না করেই নতুন রিপোর্ট দেখতে পায়)
    revalidatePath("/dashboard/admin/reports"); 

    return { success: true };
  } catch (error) {
    console.error("Report Error:", error);
    return { success: false, error: "Failed to submit report" };
  }
}