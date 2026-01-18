import { auth } from "@/auth"; // ✅ @/auth ব্যবহার করা স্ট্যান্ডার্ড

export const currentUser = async () => {
  try {
    const session = await auth();
    return session?.user;
  } catch (error) {
    return null;
  }
};

export const currentRole = async () => {
  try {
    const session = await auth();
    // ✅ FIX: (session?.user as any) ব্যবহার করা হয়েছে যাতে 'role' অ্যাক্সেস করা যায়
    return (session?.user as any)?.role;
  } catch (error) {
    return null;
  }
};