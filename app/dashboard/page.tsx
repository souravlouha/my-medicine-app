import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// ✅ এই লাইনটি যোগ করুন (এটি Vercel-এর ক্যাশিং সমস্যা ফিক্স করবে)
export const dynamic = "force-dynamic";

export default async function DashboardCheck() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) {
    redirect("/login");
  }

  const role = (user.role || "").toUpperCase();

  if (role === "MANUFACTURER") redirect("/dashboard/manufacturer");
  if (role === "RETAILER") redirect("/dashboard/retailer");
  if (role === "DISTRIBUTOR") redirect("/dashboard/distributor");

  return (
    <div className="p-10 text-center text-red-500">
       Role not matched: {role}
    </div>
  );
}