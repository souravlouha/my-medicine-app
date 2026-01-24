import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar"; // আপনার সাইডবার কম্পোনেন্টের পাথ চেক করুন
import ManufacturerHeader from "@/components/ManufacturerHeader"; // হেডার কম্পোনেন্টের পাথ চেক করুন

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // ১. ডবল চেক: যদি সেশন না থাকে, লগইনে পাঠাও
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* বাম পাশে সাইডবার (যদি থাকে) */}
      <div className="w-64 hidden md:block">
         <Sidebar userRole={(session.user as any).role} />
      </div>

      {/* মেইন কন্টেন্ট */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* উপরে হেডার */}
        <header className="bg-white shadow p-4">
           <ManufacturerHeader user={session.user} />
        </header>

        {/* পেজের ভেতরের অংশ */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}