'use server'
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// ১. কাস্টম আইডি জেনারেটর
async function generateId(role: string) {
  const prefix = role.slice(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

// ২. সাইন-আপ অ্যাকশন
export async function registerAction(formData: FormData) {
  console.log("--- Signup Process Started ---");
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || !role) {
    return { success: false, message: "সবগুলো ফিল্ড পূরণ করুন!" };
  }

  try {
    // ইমেইল চেক
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { success: false, message: "ইমেইল অলরেডি আছে!" };

    // পাসওয়ার্ড হ্যাশ
    const hashedPassword = await bcrypt.hash(password, 10);
    const customId = await generateId(role);

    // ইউজার তৈরি
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        customId,
        phone: "",
        location: "",
        fullAddress: "",
        licenseNo: "",
        gstNo: ""
      }
    });

    console.log("User Created Successfully:", user.email);

    // কুকি সেট
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, { httpOnly: true, path: '/' });
    cookieStore.set("role", user.role, { httpOnly: true, path: '/' });

    // সাকসেস হলে এখানে রিটার্ন করবে
    return { success: true, role: user.role };
    
  } catch (error: any) {
    console.error("--- DETAILED REGISTRATION ERROR ---");
    console.error(error); // এটি তোমার টার্মিনালে আসল এরর দেখাবে
    return { success: false, message: "Server Error: " + error.message };
  }
}

// ৩. লগইন অ্যাকশন
export async function loginAction(formData: FormData) {
  console.log("--- Login Process Started ---");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "ইউজার পাওয়া যায়নি!" };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return { success: false, message: "ভুল পাসওয়ার্ড!" };

    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, { httpOnly: true, path: '/' });
    cookieStore.set("role", user.role, { httpOnly: true, path: '/' });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("Login Error:", error);
    return { success: false, message: "লগইন এরর: " + error.message };
  }
}