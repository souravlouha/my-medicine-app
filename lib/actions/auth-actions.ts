"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth"; // ✅ আমাদের বানানো auth ইম্পোর্ট
import { AuthError } from "next-auth";

// ✅ REGISTER ACTION (এটা আগের মতোই ঠিক আছে)
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

    // পাসওয়ার্ড হ্যাস করা হচ্ছে (আপনার auth.ts এ bcrypt.compare আছে, তাই এটা মিলবে)
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

// ✅ LOGIN ACTION (এটাই আসল ফিক্স)
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // ১. ইউজার খুঁজে বের করা (রোল চেক করার জন্য)
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        return { success: false, error: "User not found" };
    }

    // ২. রোল অনুযায়ী রিডাইরেক্ট ঠিক করা
    let redirectUrl = "/dashboard";
    if (user.role === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (user.role === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (user.role === "RETAILER") redirectUrl = "/dashboard/retailer";

    // ৩. ✅ NextAuth এর signIn ফাংশন কল করা
    // এটি অটোমেটিক সেশন তৈরি করবে যা production-actions.ts পড়তে পারবে
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl, 
    });

    return { success: true }; 

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid credentials!" };
        default:
          return { success: false, error: "Something went wrong!" };
      }
    }
    throw error; // রিডাইরেক্ট এর জন্য এরর থ্রো করা জরুরি
  }
}

// ✅ LOGOUT ACTION
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}