"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. CREATE SHIPMENT (Distributor -> Retailer)
// ==========================================
export async function createShipmentAction(data: any) {
  console.log("🚀 STARTING DISPATCH (DISTRIBUTOR TO RETAILER)...");

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized access" };
  }

  const senderId = session.user.id; 
  const receiverId = data.retailerId; 
  const { items, totalAmount, invoiceNo } = data;

  if (!receiverId || !items || items.length === 0) {
    return { success: false, error: "Invalid shipment details" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // A. Shipment তৈরি করা
      const shipment = await tx.shipment.create({
        data: {
          shipmentId: invoiceNo,
          manufacturerId: senderId, 
          distributorId: receiverId, 
          totalAmount: Number(totalAmount) || 0,
          status: "IN_TRANSIT",
          items: {
            create: items.map((item: any) => ({
              batchId: item.batchId,
              quantity: Number(item.quantity),
              price: Number(item.unitPrice)
            }))
          }
        }
      });

      // B. ডিস্ট্রিবিউটরের স্টক কমানো
      for (const item of items) {
        const existingStock = await tx.inventory.findFirst({
          where: {
            userId: senderId,
            batchId: item.batchId
          }
        });

        if (!existingStock || existingStock.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for item: ${item.productName}`);
        }

        await tx.inventory.update({
          where: { id: existingStock.id },
          data: {
            currentStock: { decrement: Number(item.quantity) }
          }
        });
      }

      return shipment;
    });

    revalidatePath("/dashboard/distributor");
    return { success: true, data: result };

  } catch (error: any) {
    console.error("🔴 SHIPMENT ACTION ERROR:", error);
    return { success: false, error: error.message || "Failed to process shipment." };
  }
}

// ==========================================
// 2. RECEIVE SHIPMENT (Retailer Receives Stock)
// ==========================================
// ✅ এই ফাংশনটি আপনার মিসিং ছিল বা সমস্যা করছিল
export async function receiveShipmentAction(shipmentId: string) {
  const session = await auth();
  const userId = session?.user?.id; // Retailer ID

  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      
      // ১. শিপমেন্ট ডাটা আনা
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        include: { items: true }
      });

      if (!shipment) throw new Error("Shipment not found");
      if (shipment.status === "DELIVERED") throw new Error("Already received!");

      // ২. রিটেইলারের ইনভেন্টরি আপডেট করা (লুপ)
      for (const item of shipment.items) {
        
        // ইনভেন্টরিতে আগে থেকেই আছে কি না চেক করা
        const existingItem = await tx.inventory.findUnique({
          where: {
            userId_batchId: {
              userId: userId,
              batchId: item.batchId
            }
          }
        });

        if (existingItem) {
          // থাকলে স্টক বাড়ানো
          await tx.inventory.update({
            where: { id: existingItem.id },
            data: {
              currentStock: { increment: item.quantity }
            }
          });
        } else {
          // না থাকলে নতুন এন্ট্রি তৈরি করা
          await tx.inventory.create({
            data: {
              userId: userId,
              batchId: item.batchId,
              currentStock: item.quantity,
              looseStock: 0,
              sellingPrice: 0 // Default selling price
            }
          });
        }
      }

      // ৩. শিপমেন্ট স্ট্যাটাস আপডেট
      await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: "DELIVERED",
          receivedAt: new Date()
        }
      });

    });

    // ✅ ৪. পেজ রিফ্রেশ (যাতে ইনভেন্টরিতে সাথে সাথে দেখায়)
    revalidatePath("/dashboard/retailer/inventory"); // Shelf Inventory
    revalidatePath("/dashboard/retailer/incoming");  // Incoming Page
    revalidatePath("/dashboard/retailer/pos");       // POS Terminal

    return { success: true, message: "Stock Received Successfully!" };

  } catch (error: any) {
    console.error("Receive Error:", error);
    return { success: false, error: error.message || "Failed to receive stock." };
  }
}