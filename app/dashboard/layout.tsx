import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // ✅ নতুন ইম্পোর্ট: ডাটাবেস কানেকশন
import Sidebar from "@/components/dashboard/Sidebar"; 
import ManufacturerHeader from "@/components/ManufacturerHeader"; 

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // ১. সেশন চেক (লগইন আছে কি না)
  if (!session?.user) {
    redirect("/login");
  }

  // ২. ✅ ফিক্স: সেশনের পুরনো ডাটা বাদ দিয়ে, ডাটাবেস থেকে একদম লেটেস্ট ডাটা আনা হচ্ছে
  const freshUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  // যদি কোনো কারণে ইউজার না পাওয়া যায় (খুবই রেয়ার কেস)
  if (!freshUser) {
     redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* বাম পাশে সাইডবার (এটি ফিক্সড থাকবে) */}
      <div className="w-64 hidden md:block h-full overflow-y-auto bg-white border-r">
         {/* রোল আমরা ফ্রেশ ইউজার থেকে নিচ্ছি */}
         <Sidebar userRole={(freshUser as any).role} />
      </div>

      {/* ডান পাশের পুরো অংশ (হেডার + কন্টেন্ট) এখন একসাথে স্ক্রল হবে */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* হেডার: এখন এটি ডাটাবেসের ফ্রেশ ইউজার ডাটা দেখাবে */}
        <header className="bg-white shadow p-4 shrink-0">
           {/* 'as any' টাইপ এরর এড়ানোর জন্য */}
           <ManufacturerHeader user={freshUser as any} />
        </header>

        {/* মেইন কন্টেন্ট */}
        <main className="flex-1 bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}