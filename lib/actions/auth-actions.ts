"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation"; 

// ✅ REGISTER ACTION
export async function registerAction(formData: FormData) {
  // ... (আপনার আগের রেজিস্টার কোড ঠিক আছে) ...
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

// ✅ LOGIN ACTION
export async function loginAction(formData: FormData) {
  // ... (আপনার আগের লগইন কোড ঠিক আছে) ...
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { success: false, error: "Invalid email or password" };
    }

    const cookieStore = await cookies();
    const oneDay = 24 * 60 * 60 * 1000;
    
    cookieStore.set("userId", user.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", expires: Date.now() + oneDay });
    cookieStore.set("userRole", user.role, { httpOnly: true, secure: process.env.NODE_ENV === "production", expires: Date.now() + oneDay });

    let redirectUrl = "/dashboard";
    if (user.role === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (user.role === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (user.role === "RETAILER") redirectUrl = "/dashboard/retailer";

    return { success: true, redirectUrl };
  } catch (error) {
    return { success: false, error: "Login system error" };
  }
}

// ✅ LOGOUT ACTION (এটি যোগ করুন) 👇
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  cookieStore.delete("userRole");
  redirect("/login");
}