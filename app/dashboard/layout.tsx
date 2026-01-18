import Sidebar from "@/components/dashboard/Sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;

  // যদি রোল না থাকে (লগইন করা না থাকে), লগইন পেজে পাঠাবে
  if (!userRole) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* 👈 বাম পাশে ফিক্সড সাইডবার */}
      <Sidebar userRole={userRole} />

      {/* 👉 ডান পাশে ডাইনামিক কন্টেন্ট (Manufacturer/Distributor Dashboard) */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {children}
      </main>
      
    </div>
  );
}