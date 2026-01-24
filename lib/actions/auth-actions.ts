"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth"; 
import { AuthError } from "next-auth";

// 1. REGISTER ACTION
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
    
    // পাবলিক আইডি জেনারেশন লজিক
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

// 2. LOGIN ACTION (Robust Logic for Vercel)
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true } 
    });

    if (!user) return { success: false, error: "User not found!" };

    // ✅ ফিক্স: রোল Case-Insensitive করা হলো (যাতে manufecture বা MANUFACTURER সব কাজ করে)
    const role = (user.role || "").toUpperCase();

    // রোল অনুযায়ী সঠিক রিডাইরেক্ট ইউআরএল সেট করা
    let redirectUrl = "/dashboard";
    if (role === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (role === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (role === "RETAILER") redirectUrl = "/dashboard/retailer";

    // ✅ সার্ভার সাইড রিডাইরেক্ট
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl,
    });
    
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { success: false, error: "Invalid credentials!" };
      return { success: false, error: "Something went wrong!" };
    }
    // ⚠️ এই লাইনটি মুছবেন না। Next.js এর সফল রিডাইরেক্ট কাজ করার জন্য এটি মাস্ট।
    throw error; 
  }
}

// 3. LOGOUT ACTION
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}