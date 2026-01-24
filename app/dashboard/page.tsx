import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardCheck() {
  const session = await auth();
  const user = session?.user as any;

  // ১. লগইন চেক
  if (!user) {
    // লগইন না থাকলে লগইন পেজে পাঠাবে
    redirect("/login");
  }

  // ২. রোল চেক
  const role = (user.role || "").toUpperCase();

  if (role === "MANUFACTURER") redirect("/dashboard/manufacturer");
  if (role === "RETAILER") redirect("/dashboard/retailer");
  if (role === "DISTRIBUTOR") redirect("/dashboard/distributor");

  // ৩. যদি রোল না মেলে
  return (
    <div className="p-10 text-center">
      <h1 className="text-xl font-bold text-red-600">Login Successful but No Dashboard Found</h1>
      <p>Logged in as: {user.email}</p>
      <p>Detected Role: {role}</p>
    </div>
  );
}