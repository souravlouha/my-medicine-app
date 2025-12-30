"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs"; // বা আপনি যা ব্যবহার করছেন
import { redirect } from "next/navigation";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const licenseNo = formData.get("licenseNo") as string || null;
  const phone = formData.get("phone") as string || null;
  const location = formData.get("location") as string || null; // রিটেইলার/ডিস্ট্রিবিউটরের জন্য

  if (!name || !email || !password || !role) {
    return { success: false, message: "Missing required fields" };
  }

  // ডুপ্লিকেট চেক
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, message: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);
  
  // Custom ID জেনারেশন লজিক (সাধারণত ছোট হাতের ৩ অক্ষর + র‍্যান্ডম সংখ্যা)
  const prefix = role === "MANUFACTURER" ? "MFG" : role === "DISTRIBUTOR" ? "DST" : "RET";
  const customId = `${prefix}-${Date.now().toString().slice(-6)}`;

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        customId, // অটো জেনারেটেড আইডি
        licenseNo,
        phone,
        location
      },
    });

    // ✅ FIX: এখানে customId রিটার্ন করতে হবে
    return { 
        success: true, 
        role: newUser.role, 
        customId: newUser.customId // 🔥 এই লাইনটি যোগ করা জরুরি
    };

  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, message: "Something went wrong" };
  }
}