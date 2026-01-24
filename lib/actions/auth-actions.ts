"use server";

import { prisma } from "@/lib/prisma";
import { signIn, auth } from "@/lib/auth";
import { AuthError } from "next-auth";

// ... আগের ইন্টারফেস এবং রেজিস্টার লজিক ...

export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // ১. প্রথমে ডাটাবেস থেকে শুধু ইউজারের রোলটা দেখে নিন
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true } 
    });

    if (!user) return { success: false, error: "User not found!" };

    // ২. রোল অনুযায়ী সঠিক পাথ (Redirect Path) তৈরি করুন
    let redirectUrl = "/dashboard";
    if (user.role === "MANUFACTURER") redirectUrl = "/dashboard/manufacturer";
    else if (user.role === "DISTRIBUTOR") redirectUrl = "/dashboard/distributor";
    else if (user.role === "RETAILER") redirectUrl = "/dashboard/retailer";

    // ৩. NextAuth এর signIn কল করুন
    // redirectTo দিলে NextAuth নিজে থেকেই রিডাইরেক্ট করার চেষ্টা করবে
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl, 
      redirect: false, // আমরা ক্লায়েন্ট সাইড থেকে router.push দিয়ে হ্যান্ডেল করব
    });

    return { success: true, redirectUrl }; 

  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password!" };
    }
    // রিডাইরেক্ট ঠিকমতো কাজ করার জন্য এটি প্রয়োজন
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
    }
    return { success: false, error: "Something went wrong!" };
  }
}
// lib/actions/auth-actions.ts ফাইলের একদম নিচে এটি যোগ করুন
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}