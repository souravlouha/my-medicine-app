import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardCheck() {
  const session = await auth();
  const user = session?.user as any;

  // ১. যদি ইউজার লগইন না থাকে -> লগইন পেজে পাঠাও
  if (!user) {
    redirect("/login");
  }

  // ২. যদি Manufacturer হয় -> Manufacturer ড্যাশবোর্ডে পাঠাও
  if (user.role === "MANUFACTURER") {
    redirect("/dashboard/manufacturer");
  }

  // ৩. যদি Retailer হয় -> Retailer ড্যাশবোর্ডে পাঠাও
  if (user.role === "RETAILER") {
    redirect("/dashboard/retailer");
  }

  // ৪. যদি Distributor হয় -> Distributor ড্যাশবোর্ডে পাঠাও
  if (user.role === "DISTRIBUTOR") {
    redirect("/dashboard/distributor");
  }

  // ৫. যদি কিছুই না মেলে
  redirect("/login");
}