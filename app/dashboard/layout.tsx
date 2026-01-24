import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar"; 
import ManufacturerHeader from "@/components/ManufacturerHeader"; 

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // ১. সেশন চেক
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* বাম পাশে সাইডবার (এটি ফিক্সড থাকবে) */}
      <div className="w-64 hidden md:block h-full overflow-y-auto bg-white border-r">
         <Sidebar userRole={(session.user as any).role} />
      </div>

      {/* ডান পাশের পুরো অংশ (হেডার + কন্টেন্ট) এখন একসাথে স্ক্রল হবে */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* হেডার: এখন এটি স্ক্রল এরিয়ার ভেতরে, তাই পেজ নামলে এটিও উপরে উঠে যাবে */}
        <header className="bg-white shadow p-4 shrink-0">
           {/* 'as any' টাইপ এরর এড়ানোর জন্য */}
           <ManufacturerHeader user={session.user as any} />
        </header>

        {/* মেইন কন্টেন্ট */}
        <main className="flex-1 bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}