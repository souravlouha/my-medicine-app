import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardCheck() {
  const session = await auth();
  const user = session?.user as any;

  // ১. লগইন চেক
  if (!user) {
    redirect("/login");
  }

  // ২. রোল চেক (Case Insensitive)
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

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-xl font-bold text-red-500">
        Error: No Dashboard Found for Role: {role}
      </h1>
    </div>
  );
}