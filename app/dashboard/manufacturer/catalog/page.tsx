import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // রিডাইরেক্ট ইম্পোর্ট
import CatalogClient from "./CatalogClient";

export default async function CatalogPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
      redirect("/login");
  }

  // ডাটাবেস থেকে সব প্রোডাক্ট নিয়ে আসা
  // নতুন প্রোডাক্ট যেন সবার আগে দেখায় তাই 'desc' অর্ডার ব্যবহার করা হয়েছে
  const products = await prisma.product.findMany({
    where: { manufacturerId: userId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* আমরা ডাটাগুলো Client Component এ পাঠিয়ে দিচ্ছি */}
      <CatalogClient products={products} />
    </div>
  );
}