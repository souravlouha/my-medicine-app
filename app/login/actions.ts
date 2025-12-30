'use server'

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// ১. লগইন অ্যাকশন
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return { success: false, message: "ইউজার পাওয়া যায়নি!" };

    // পাসওয়ার্ড চেক (Bcrypt ব্যবহার করা ভালো)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { success: false, message: "ভুল ইমেইল বা পাসওয়ার্ড!" };

    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, { httpOnly: true, path: '/' });
    cookieStore.set("userRole", user.role, { httpOnly: true, path: '/' });

    return { success: true, role: user.role };
  } catch (error) {
    return { success: false, message: "লগইন এরর" };
  }
}

// ২. সাইন-আপ অ্যাকশন
export async function signupAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const location = formData.get("location") as string;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { success: false, message: "এই ইমেইল অলরেডি আছে!" };

    // সিকিউর পাসওয়ার্ড
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 খুবই জরুরি: customId জেনারেট করা (তোমার স্কিমা অনুযায়ী এটি রিকোয়ার্ড)
    const customId = `${role.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        location,
        customId, // এটি না দিলে সার্ভার এরর দেবে
        fullAddress: location, // আপাতত লোকেশনটাই অ্যাড্রেসে রাখছি
      }
    });

    const cookieStore = await cookies();
    cookieStore.set("userId", newUser.id, { httpOnly: true, path: '/' });
    cookieStore.set("userRole", newUser.role, { httpOnly: true, path: '/' });

    return { success: true, role: newUser.role };
  } catch (error: any) {
    console.error("Signup Error Details:", error);
    return { success: false, message: "সার্ভার এরর: " + error.message };
  }
}