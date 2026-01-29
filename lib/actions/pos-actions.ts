"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function processRetailSale(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { success: false, error: "Unauthorized" };

  const inventoryId = formData.get("inventoryId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  
  // ফর্ম থেকে সঠিক ইউনিট টাইপ নেওয়া হচ্ছে
  const unitTypeRaw = formData.get("unitType") as string;
  const unitType = unitTypeRaw === "TABLET" ? "TABLET" : "STRIP"; 

  const totalAmount = parseFloat(formData.get("totalAmount") as string);

  if (!inventoryId || quantity <= 0) {
    return { success: false, error: "Invalid Data" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      
      // ১. ইনভেন্টরি চেক
      const inventory = await tx.inventory.findUnique({
        where: { id: inventoryId },
        include: { batch: { include: { product: true } } }
      });

      if (!inventory) throw new Error("Stock item not found!");

      const tabletsPerStrip = inventory.batch.product.tabletsPerStrip || 10;
      let currentStripStock = inventory.currentStock;
      let currentLooseStock = inventory.looseStock;

      // ২. স্টক ক্যালকুলেশন
      if (unitType === "STRIP") {
        if (currentStripStock < quantity) {
          throw new Error(`Insufficient STRIP stock! Available: ${currentStripStock}`);
        }
        currentStripStock -= quantity;
      } 
      else {
        // ট্যাবলেট বিক্রি
        let needed = quantity;

        if (currentLooseStock >= needed) {
          currentLooseStock -= needed;
        } else {
          needed -= currentLooseStock; 
          currentLooseStock = 0;

          const stripsToBreak = Math.ceil(needed / tabletsPerStrip);

          if (currentStripStock < stripsToBreak) {
            throw new Error(`Not enough strips! Need ${stripsToBreak} strips.`);
          }

          currentStripStock -= stripsToBreak;
          const newLooseTablets = (stripsToBreak * tabletsPerStrip) - needed;
          currentLooseStock = newLooseTablets;
        }
      }

      // ৩. ইনভেন্টরি আপডেট
      await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          currentStock: currentStripStock,
          looseStock: currentLooseStock
        }
      });

      // ৪. সেলস রেকর্ড তৈরি (🔴 Force Fix Applied Here)
      // 'as any' ব্যবহার করা হয়েছে যাতে টাইপস্ক্রিপ্ট unitType নিয়ে ঝামেলা না করে
      await tx.salesRecord.create({
        data: {
          sellerId: userId,
          batchId: inventory.batchId,
          quantity: quantity,
          totalPrice: totalAmount,
          buyerType: "CONSUMER",
          date: new Date(),
          unitType: unitType, 
        } as any 
      });

    });

    revalidatePath("/dashboard/retailer/pos");
    revalidatePath("/dashboard/retailer/sales");
    revalidatePath("/dashboard/retailer");
    
    return { success: true, message: `✅ Sold ${quantity} ${unitType}(s). Stock Updated.` };

  } catch (error: any) {
    console.error("POS Error:", error);
    return { success: false, error: error.message || "Transaction Failed" };
  }
}