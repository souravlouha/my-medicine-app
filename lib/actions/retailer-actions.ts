"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 1. CREATE ORDER ACTION (EXISTING)
export async function createOrderAction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) throw new Error("User not authenticated");

  const distributorId = formData.get("distributorId") as string;
  const productId = formData.get("productId") as string;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);

  if (!distributorId || !productId || !quantity) throw new Error("Missing fields");

  const orderId = `ORD-${Date.now().toString().slice(-6)}`;

  await prisma.order.create({
    data: {
      orderId, senderId: userId, receiverId: distributorId, totalAmount: price * quantity, status: "PENDING",
      items: { create: { productId, quantity, price } }
    }
  });
  redirect("/dashboard/retailer/orders");
}

// 2. RECEIVE ORDER ACTION (EXISTING)
export async function receiveOrderAction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return;

  const orderId = formData.get("orderId") as string;
  if (!orderId) return;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) throw new Error("Order not found");
    if (order.senderId !== userId) throw new Error("Unauthorized");

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const latestBatch = await tx.batch.findFirst({
            where: { productId: item.productId },
            orderBy: { createdAt: 'desc' }
        });

        if (!latestBatch) {
             throw new Error(`Manufacturer hasn't produced any batch for: ${item.product.name}. Cannot receive stock.`);
        }

        const existingStock = await tx.inventory.findUnique({
            where: {
                userId_batchId: {
                    userId: userId,
                    batchId: latestBatch.id
                }
            }
        });

        if (existingStock) {
             await tx.inventory.update({
                 where: { id: existingStock.id },
                 data: { currentStock: { increment: item.quantity } }
             });
        } else {
             await tx.inventory.create({
                 data: {
                     userId: userId,
                     batchId: latestBatch.id,
                     currentStock: item.quantity
                 }
             });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: "DELIVERED" }
      });
    });

    revalidatePath("/dashboard/retailer/incoming");
    revalidatePath("/dashboard/retailer/inventory");
    revalidatePath("/dashboard/retailer/orders");
    revalidatePath("/dashboard"); 

  } catch (error: any) {
    console.error("Receive Error Details:", error);
    throw new Error(error.message || "Failed to receive stock");
  }
}

// 3. ✅ NEW: RECEIVE SHIPMENT ACTION (Distributor -> Retailer Dispatch)
export async function receiveShipmentAction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return;

  const shipmentId = formData.get("shipmentId") as string;
  if (!shipmentId) return;

  try {
    // ১. শিপমেন্ট চেক করা
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { items: true }
    });

    if (!shipment) throw new Error("Shipment not found");
    // স্কিমা অনুযায়ী distributorId মানে Receiver (এখানে Retailer)
    if (shipment.distributorId !== userId) throw new Error("Unauthorized"); 
    if (shipment.status === "DELIVERED") throw new Error("Already received");

    // ২. ট্রানজ্যাকশন
    await prisma.$transaction(async (tx) => {
      
      // A. ইনভেন্টরি আপডেট (লুপ)
      for (const item of shipment.items) {
        // ডিস্ট্রিবিউটর ব্যাচ আইডি দিয়ে পাঠিয়েছে, তাই সরাসরি ব্যাচ আইডি পাব
        const existingStock = await tx.inventory.findUnique({
            where: {
                userId_batchId: {
                    userId: userId,
                    batchId: item.batchId
                }
            }
        });

        if (existingStock) {
             await tx.inventory.update({
                 where: { id: existingStock.id },
                 data: { currentStock: { increment: item.quantity } }
             });
        } else {
             await tx.inventory.create({
                 data: {
                     userId: userId,
                     batchId: item.batchId,
                     currentStock: item.quantity
                 }
             });
        }
      }

      // B. শিপমেন্ট স্ট্যাটাস আপডেট
      await tx.shipment.update({
        where: { id: shipmentId },
        data: { 
          status: "DELIVERED",
          receivedAt: new Date()
        }
      });
    });

    revalidatePath("/dashboard/retailer/incoming");
    revalidatePath("/dashboard/retailer/inventory");
    revalidatePath("/dashboard/retailer");

  } catch (error) {
    console.error("Shipment Receive Error:", error);
    throw new Error("Failed to receive shipment");
  }
}