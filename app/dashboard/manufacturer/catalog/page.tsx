import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ কুকির বদলে auth ইম্পোর্ট
import { redirect } from "next/navigation"; 
import CatalogClient from "./CatalogClient";

export default async function CatalogPage() {
  // ✅ ফিক্স: কুকি স্টোর বাদ দিয়ে সেশন চেক
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
      redirect("/login");
  }

  // ডাটাবেস থেকে সব প্রোডাক্ট নিয়ে আসা
  // নতুন প্রোডাক্ট যেন সবার আগে দেখায় তাই 'desc' অর্ডার ব্যবহার করা হয়েছে
  const products = await prisma.product.findMany({
    where: { manufacturerId: userId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* আমরা ডাটাগুলো Client Component এ পাঠিয়ে দিচ্ছি */}
      <CatalogClient products={products} />
    </div>
  );
}