"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createShipmentAction(data: any) {
  console.log("🚀 STARTING DISPATCH (DISTRIBUTOR TO RETAILER)...");

  // ১. ইউজার অথেন্টিকেশন চেক
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized access" };
  }

  // ফর্ম থেকে আসা ডাটা
  const senderId = session.user.id; // Distributor (যে পাঠাচ্ছে)
  const receiverId = data.retailerId; // Retailer (যে পাবে)
  const { items, totalAmount, invoiceNo } = data;

  if (!receiverId || !items || items.length === 0) {
    return { success: false, error: "Invalid shipment details" };
  }

  try {
    // ২. ডাটাবেস ট্রানজ্যাকশন (যাতে স্টক কমা এবং শিপমেন্ট তৈরি একসাথে হয়)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Shipment তৈরি করা
      // নোট: স্কিমা অনুযায়ী sender = manufacturerId ফিল্ডে বসছে (Role যাই হোক না কেন)
      const shipment = await tx.shipment.create({
        data: {
          shipmentId: invoiceNo, // ইনভয়েস নম্বরটিই শিপমেন্ট আইডি
          manufacturerId: senderId, // Sender (Distributor)
          distributorId: receiverId, // Receiver (Retailer)
          totalAmount: Number(totalAmount) || 0,
          status: "IN_TRANSIT",
          // Shipment Items যোগ করা (নেস্টেড রাইট)
          items: {
            create: items.map((item: any) => ({
              batchId: item.batchId,
              quantity: Number(item.quantity),
              price: Number(item.unitPrice)
            }))
          }
        }
      });

      // B. ইনভেন্টরি আপডেট (স্টক কমানো)
      for (const item of items) {
        // ১. আগে চেক করি স্টক আছে কিনা
        const existingStock = await tx.inventory.findFirst({
          where: {
            userId: senderId,
            batchId: item.batchId
          }
        });

        if (!existingStock || existingStock.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for item: ${item.productName}`);
        }

        // ২. স্টক কমানো
        await tx.inventory.update({
          where: { id: existingStock.id },
          data: {
            currentStock: {
              decrement: Number(item.quantity)
            }
          }
        });
      }

      return shipment;
    });

    // ৩. সাকসেস এবং রিভ্যালিডেশন
    console.log("✅ Shipment Created:", result.id);
    revalidatePath("/dashboard/distributor"); // ড্যাশবোর্ড আপডেট করা
    return { success: true, data: result };

  } catch (error: any) {
    console.error("🔴 SHIPMENT ACTION ERROR:", error);
    // এরর মেসেজটি ক্লায়েন্টে পাঠানো
    return { success: false, error: error.message || "Failed to process shipment." };
  }
}