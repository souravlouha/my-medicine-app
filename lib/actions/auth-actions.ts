"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth"; // auth এখানে না লাগলে সরিয়ে দিতে পারেন
import { AuthError } from "next-auth";

// রিটার্ন টাইপ ইন্টারফেস
interface AuthResponse {
  success: boolean;
  error?: string;
  // redirectUrl এখানে আর দরকার নেই, কারণ সার্ভার নিজেই নিয়ে যাবে
}

// ✅ 1. REGISTER ACTION
export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const licenseNo = formData.get("licenseNo") as string;

  if (!name || !email || !password || !role) {
    return { success: false, error: "All fields are required!" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { success: false, error: "Email already exists!" };

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const shortRole = role.substring(0, 3).toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const publicId = `${shortRole}-${randomCode}`;

    await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role as any, publicId, licenseNo: licenseNo || null },
    });

    return { success: true, message: "Account created successfully!" };
  } catch (error) {
    return { success: false, error: "Registration failed." };
  }
}

// ✅ 2. LOGIN ACTION (Optimized for Vercel)
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // ১. ইউজারের রোল চেক করা
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true } 
    });

    if (!user) return { success: false, error: "User not found!" };

    // ২. রোল অনুযায়ী রিডাইরেক্ট পাথ ঠিক করা
    let redirectUrl = "/dashboard";
    if (user.role === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (user.role === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (user.role === "RETAILER") redirectUrl = "/dashboard/retailer";

    // ৩. ✅ সার্ভার সাইড রিডাইরেক্ট
    // redirect: false মুছে ফেলা হয়েছে। এখন সফল হলে signIn নিজেই পেজ চেঞ্জ করবে।
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl,
    });
    
    // সফল হলে কোড এখানে আসবে না, অটোমেটিক রিডাইরেক্ট হয়ে যাবে।

  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { success: false, error: "Invalid credentials!" };
      return { success: false, error: "Something went wrong!" };
    }
    // ⚠️ Next.js এর রিডাইরেক্ট কাজ করার জন্য এই এররটি ছুঁড়ে দিতে হয় (এটি মাস্ট)
    throw error; 
  }
}

// ✅ 3. LOGOUT ACTION
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}