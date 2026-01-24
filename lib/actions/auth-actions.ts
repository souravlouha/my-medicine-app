"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut, auth } from "@/lib/auth"; 
import { AuthError } from "next-auth";

// রিটার্ন টাইপ ইন্টারফেস
interface AuthResponse {
  success: boolean;
  error?: string;
  redirectUrl?: string; 
}

// ✅ 1. REGISTER ACTION (এটি মিসিং ছিল)
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

// ✅ 2. LOGIN ACTION
export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true } 
    });

    if (!user) return { success: false, error: "User not found!" };

    let redirectUrl = "/dashboard";
    if (user.role === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (user.role === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (user.role === "RETAILER") redirectUrl = "/dashboard/retailer";

    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl, 
      redirect: false, 
    });

    return { success: true, redirectUrl }; 

  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { success: false, error: "Invalid credentials!" };
      return { success: false, error: "Something went wrong!" };
    }
    throw error; 
  }
}

// ✅ 3. LOGOUT ACTION (এটিও মিসিং ছিল)
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}