import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardCheck() {
  const session = await auth();
  const user = session?.user as any;

  // ১. ইউজার না থাকলে লগইনে
  if (!user) {
    redirect("/login");
  }

  // ✅ ফিক্স: এখানেও রোল বড় হাতের অক্ষরে কনভার্ট করা হলো
  const role = (user.role || "").toUpperCase();

  // ২. সঠিক ড্যাশবোর্ডে পাঠানো
  if (role === "MANUFACTURER") {
    redirect("/dashboard/manufacturer");
  }

  if (role === "RETAILER") {
    redirect("/dashboard/retailer");
  }

  if (role === "DISTRIBUTOR") {
    redirect("/dashboard/distributor");
  }

  // ৩. যদি রোলের সাথে কোনো ড্যাশবোর্ড না মেলে
  // এখানে লগইনে না পাঠিয়ে একটি নোটিশ বা মেইন পেজে রাখা ভালো, যাতে লুপ না হয়
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      <p>Your role ({role}) does not have a dashboard assigned.</p>
    </div>
  );
}