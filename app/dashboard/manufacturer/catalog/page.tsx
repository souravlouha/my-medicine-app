import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation"; 
import CatalogClient from "./CatalogClient";

export default async function CatalogPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
      redirect("/login");
  }

  // ডাটাবেস থেকে সব প্রোডাক্ট নিয়ে আসা
  const products = await prisma.product.findMany({
    where: { manufacturerId: userId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <CatalogClient products={products} />
    </div>
  );
}