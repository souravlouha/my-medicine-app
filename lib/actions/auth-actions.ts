"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth"; 
import { AuthError } from "next-auth";

// 1. LOGIN ACTION (Client-Side Redirect Strategy)
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // ১. ইউজার চেক
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true } 
    });

    if (!user) return { success: false, error: "User not found!" };

    // ২. রোল সেটআপ
    const role = (user.role || "").toUpperCase();
    let redirectUrl = "/dashboard";
    
    if (role === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (role === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (role === "RETAILER") redirectUrl = "/dashboard/retailer";

    // ৩. লগইন চেষ্টা (redirect: false দেওয়া হলো)
    // এটি এরর থ্রো করবে না, রেজাল্ট রিটার্ন করবে
    await signIn("credentials", {
      email,
      password,
      redirect: false, 
    });

    // ৪. সব ঠিক থাকলে URL ফেরত পাঠাও
    return { success: true, redirectUrl }; 

  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { success: false, error: "Invalid credentials!" };
    }
    // অন্য কোনো এরর হলে
    console.error("Login error:", error);
    return { success: false, error: "Login failed! Check credentials." };
  }
}

// 2. LOGOUT ACTION
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

// 3. REGISTER ACTION (যা ছিল তাই)
import bcrypt from "bcryptjs";
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