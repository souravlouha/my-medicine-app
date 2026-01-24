import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardCheck() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) {
    redirect("/login");
  }

  // ✅ ফিক্স: রোল যেভাবেই থাকুক, আমরা বড় হাতে কনভার্ট করে চেক করব
  const role = (user.role || "").toUpperCase();

  if (role === "MANUFACTURER") {
    redirect("/dashboard/manufacturer");
  }

  if (role === "RETAILER") {
    redirect("/dashboard/retailer");
  }

  if (role === "DISTRIBUTOR") {
    redirect("/dashboard/distributor");
  }

  // যদি রোল না মেলে
  redirect("/login");
}