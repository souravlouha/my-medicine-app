import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DistributorDashboard from "./DistributorDashboard"; 

export default async function DistributorPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  // ১. ডিস্ট্রিবিউটর ডিটেইলস
  const distributor = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
        id: true, name: true, location: true, email: true, 
        licenseNo: true, gstNo: true, phone: true 
    }
  });

  if (!distributor) redirect("/login");

  // ২. ইনভেন্টরি (FIXED: শুধুমাত্র এই ডিস্ট্রিবিউটরের স্টক)
  const inventory = await prisma.batch.findMany({
    where: { 
      distributorId: userId, // ✅ এখন শুধু আপনার স্টক আসবে
      currentStock: { gt: 0 } 
    },
    orderBy: { currentStock: 'desc' }
  });

  // ৩. শিপমেন্টস (শুধুমাত্র আপনার)
  const shipments = await prisma.shipment.findMany({
    where: { distributorId: userId },
    select: { id: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  // ৪. রিটেইলার কাউন্ট (আপনার সাথে যুক্ত রিটেইলার)
  // আপাতত সব রিটেইলার সংখ্যা দেখাচ্ছি, পরে রিলেশন থাকলে ফিল্টার করা যাবে
  const retailerCount = await prisma.user.count({
    where: { role: "RETAILER" }
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <DistributorDashboard 
        distributor={distributor} 
        inventory={inventory} 
        shipments={shipments}
        retailerCount={retailerCount} // নতুন প্রপস পাঠাচ্ছি
      />
    </div>
  );
}