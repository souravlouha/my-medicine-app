"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ==========================================
// Validation Schemas
// ==========================================

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["MANUFACTURER", "DISTRIBUTOR", "RETAILER"]),
  licenseNo: z.string().optional(),
});

// 1. LOGIN ACTION
export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    });

    if (!user) return { success: false, error: "Invalid credentials!" };

    const role = (user.role || "").toUpperCase();
    let redirectUrl = "/dashboard";

    if (role === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (role === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (role === "RETAILER") redirectUrl = "/dashboard/retailer";

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, redirectUrl };

  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { success: false, error: "Invalid credentials!" };
    }
    console.error("Login error:", error);
    return { success: false, error: "Login failed! Check credentials." };
  }
}

// 2. LOGOUT ACTION
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

// 3. REGISTER ACTION
export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    licenseNo: formData.get("licenseNo"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password, role, licenseNo } = parsed.data;

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
