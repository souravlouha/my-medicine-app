"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut, auth } from "@/lib/auth"; // ✅ auth ও ইম্পোর্ট করুন
import { AuthError } from "next-auth";

interface AuthResponse {
  success: boolean;
  error?: string;
  redirectUrl?: string; 
}

// ✅ REGISTER ACTION
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

// ✅ OPTIMIZED LOGIN ACTION
export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    /** * ⚡ অপ্টিমাইজেশন: সরাসরি signIn কল করুন। 
     * আপনার lib/auth.ts এর authorize ফাংশন ইতিমধ্যেই ডাটাবেসে ইউজার চেক করছে।
     * এখানে আলাদা করে prisma.user.findUnique করার প্রয়োজন নেই।
     */
    await signIn("credentials", {
      email,
      password,
      redirect: false, // ব্রাউজার লেভেলে রিডাইরেক্ট কন্ট্রোল করতে এটি false রাখুন
    });

    // সেশন থেকে রোল নিয়ে ড্যাশবোর্ড পাথ ঠিক করা
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    let redirectUrl = "/dashboard";
    if (userRole === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (userRole === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (userRole === "RETAILER") redirectUrl = "/dashboard/retailer";

    return { success: true, redirectUrl }; 

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid credentials!" };
        default:
          return { success: false, error: "Something went wrong!" };
      }
    }
    return { success: false, error: "Authentication failed." };
  }
}

// ✅ LOGOUT ACTION
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}