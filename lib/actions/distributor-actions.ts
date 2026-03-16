"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; 

// ==========================================
// 1. UPDATE ORDER STATUS (The MAIN FIX)
// ==========================================
// এই ফাংশনটি আপনার OrdersView.tsx পেজে কল হচ্ছে।
export async function updateOrderStatusAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id; // Distributor ID

  if (!userId) return { success: false, error: "Unauthorized" };

  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("newStatus") as string;

  if (!orderId || !newStatus) return { success: false, error: "Missing data" };

  try {
    // ---------------------------------------------------------
    // CASE 1: যদি স্ট্যাটাস "SHIPPED" করা হয়, তবে শিপমেন্ট তৈরি করতে হবে
    // ---------------------------------------------------------
    if (newStatus === "SHIPPED") {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!order) throw new Error("Order not found");
      
      // চেক: অর্ডারটি কি ইতিমধ্যে শিপ করা হয়েছে?
      if (order.status === "SHIPPED") {
         return { success: false, error: "Order is already shipped" };
      }

      await prisma.$transaction(async (tx) => {
        const shipmentId = `SHP-${Date.now().toString().slice(-6)}`;
        let shipmentTotal = 0;
        const shipmentItemsData = [];

        // ১. ইনভেন্টরি চেক এবং আপডেট
        for (const item of order.items) {
          const inventoryRecord = await tx.inventory.findFirst({
            where: { 
              userId: userId, // Distributor
              batch: { productId: item.productId },
              currentStock: { gte: item.quantity }
            },
            include: { batch: true },
            orderBy: { batch: { expDate: 'asc' } }
          });

          if (!inventoryRecord) throw new Error(`Insufficient stock for Product ID: ${item.productId}`);

          // স্টক কমানো
          await tx.inventory.update({
            where: { id: inventoryRecord.id },
            data: { currentStock: { decrement: item.quantity } }
          });

          shipmentItemsData.push({
            batchId: inventoryRecord.batchId,
            quantity: item.quantity,
            price: item.price
          });
          shipmentTotal += (item.quantity * item.price);
        }

        // ২. শিপমেন্ট তৈরি (Retailer-এর জন্য)
        await tx.shipment.create({
          data: {
            shipmentId: shipmentId,
            manufacturerId: userId,         // Sender = Distributor
            distributorId: order.senderId,  // Receiver = Retailer (IMPORTANT)
            totalAmount: shipmentTotal,
            status: "IN_TRANSIT",
            items: { create: shipmentItemsData }
          }
        });

        // ৩. ✅ BatchMovement records for supply chain tracking
        const distUser = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
        const retailerUser = await tx.user.findUnique({ where: { id: order.senderId }, select: { name: true } });
        for (const sItem of shipmentItemsData) {
          await tx.batchMovement.create({
            data: {
              batchId: sItem.batchId,
              senderId: userId,
              receiverId: order.senderId,
              senderName: distUser?.name || "Distributor",
              receiverName: retailerUser?.name || "Retailer",
              role: "RETAILER",
              quantity: sItem.quantity,
              status: "IN_TRANSIT",
            },
          });

          // 🔗 Strip-level tracking: update currentHandlerId
          const stripsToTransfer = await tx.unit.findMany({
            where: { batchId: sItem.batchId, type: "STRIP", currentHandlerId: userId },
            take: sItem.quantity,
            orderBy: { uid: "asc" },
            select: { id: true },
          });
          if (stripsToTransfer.length > 0) {
            await tx.unit.updateMany({
              where: { id: { in: stripsToTransfer.map((s) => s.id) } },
              data: { currentHandlerId: order.senderId },
            });
          }
        }

        // ৪. অর্ডার স্ট্যাটাস আপডেট
        await tx.order.update({
          where: { id: orderId },
          data: { status: "SHIPPED" }
        });
      });

      revalidatePath("/dashboard/distributor/orders");
      return { success: true, message: "✅ Shipment Created & Order Shipped!" };
    } 
    
    // ---------------------------------------------------------
    // CASE 2: অন্যান্য স্ট্যাটাস (APPROVED, CANCELLED, etc.)
    // ---------------------------------------------------------
    else {
      const ALLOWED_STATUSES = ["PENDING", "APPROVED", "CANCELLED"];
      if (!ALLOWED_STATUSES.includes(newStatus)) {
        return { success: false, error: "Invalid status" };
      }

      // Verify ownership
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { receiverId: true } });
      if (!order || order.receiverId !== userId) return { success: false, error: "Order not found" };

      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus as "PENDING" | "APPROVED" | "CANCELLED" }
      });

      revalidatePath("/dashboard/distributor/orders");
      return { success: true, message: `Status updated to ${newStatus}` };
    }

  } catch (error: any) {
    console.error("Update Status Error:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}

// ==========================================
// 2. RECEIVE SHIPMENT (Distributor receives stock)
// ==========================================
export async function receiveShipmentAction(shipmentId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { items: true } 
    });

    if (!shipment) return { success: false, error: "Shipment not found" };
    if (shipment.distributorId !== userId) return { success: false, error: "Not authorized" };
    if (shipment.status === "DELIVERED") return { success: false, error: "Already received" };

    await prisma.$transaction(async (tx) => {
      for (const item of shipment.items) {
        const existingStock = await tx.inventory.findUnique({
          where: { userId_batchId: { userId: userId, batchId: item.batchId } }
        });

        if (existingStock) {
          await tx.inventory.update({
            where: { id: existingStock.id },
            data: { currentStock: { increment: item.quantity } }
          });
        } else {
          await tx.inventory.create({
            data: { userId: userId, batchId: item.batchId, currentStock: item.quantity, sellingPrice: 0 }
          });
        }
      }
      await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: "DELIVERED", receivedAt: new Date() }
      });
    });

    revalidatePath("/dashboard/distributor");
    return { success: true, message: "Stock Received Successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to receive stock." };
  }
}

// ==========================================
// 3. PLACE ORDER (Distributor -> Manufacturer)
// ==========================================
export async function placeOrderAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  const manufacturerId = formData.get("manufacturerId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);

  try {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    await prisma.order.create({
      data: {
        orderId: orderId,
        senderId: userId,
        receiverId: manufacturerId,
        totalAmount: price * quantity,
        status: "PENDING",
        items: { create: { productId, quantity, price } }
      }
    });
    revalidatePath("/dashboard/distributor/orders");
    return { success: true, message: "Order Placed!" };
  } catch (error) {
    return { success: false, error: "Failed to place order." };
  }
}

// ==========================================
// 4. MANUAL SHIPMENT (Extra feature)
// ==========================================
export async function createDistributorShipmentAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  const retailerId = formData.get("retailerId") as string;
  const inventoryId = formData.get("inventoryId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const pricePerUnit = parseFloat(formData.get("price") as string);

  if (!retailerId || !inventoryId || isNaN(quantity) || quantity <= 0 || isNaN(pricePerUnit) || pricePerUnit < 0) {
    return { success: false, error: "Invalid shipment data" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Stock check INSIDE transaction to prevent race conditions
      const inventoryItem = await tx.inventory.findUnique({
        where: { id: inventoryId },
        include: { batch: true }
      });

      if (!inventoryItem || inventoryItem.userId !== userId) {
        throw new Error("Inventory not found or access denied");
      }
      if (inventoryItem.currentStock < quantity) {
        throw new Error("Insufficient stock!");
      }

      await tx.inventory.update({
        where: { id: inventoryId },
        data: { currentStock: { decrement: quantity } }
      });

      await tx.shipment.create({
        data: {
          shipmentId: `SHP-${Date.now().toString().slice(-6)}`,
          manufacturerId: userId, 
          distributorId: retailerId,
          totalAmount: quantity * pricePerUnit,
          status: "IN_TRANSIT",
          items: { create: { batchId: inventoryItem.batchId, quantity, price: pricePerUnit } }
        }
      });

      // ✅ BatchMovement record for supply chain tree  
      const distUser = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
      const retailerUser = await tx.user.findUnique({ where: { id: retailerId }, select: { name: true } });
      await tx.batchMovement.create({
        data: {
          batchId: inventoryItem.batchId,
          senderId: userId,
          receiverId: retailerId,
          senderName: distUser?.name || "Distributor",
          receiverName: retailerUser?.name || "Retailer",
          role: "RETAILER",
          quantity: quantity,
          status: "IN_TRANSIT",
        },
      });

      // 🔗 Strip-level tracking: update currentHandlerId
      const stripsToTransfer = await tx.unit.findMany({
        where: { batchId: inventoryItem.batchId, type: "STRIP", currentHandlerId: userId },
        take: quantity,
        orderBy: { uid: "asc" },
        select: { id: true },
      });
      if (stripsToTransfer.length > 0) {
        await tx.unit.updateMany({
          where: { id: { in: stripsToTransfer.map((s) => s.id) } },
          data: { currentHandlerId: retailerId },
        });
      }
    });

    revalidatePath("/dashboard/distributor/inventory");
    return { success: true, message: "Shipment Dispatched!" };
  } catch (error) {
    return { success: false, error: "Failed to create shipment." };
  }
}

// ==========================================
// 5. HELPER ACTIONS
// ==========================================
export async function approveRetailerOrderAction(formData: FormData) {
  // This just wraps the update status action for specific button usage if needed
  formData.append("newStatus", "APPROVED");
  return updateOrderStatusAction(formData);
}

export async function shipOrderToRetailerAction(formData: FormData) {
  // This just wraps the update status action for specific button usage if needed
  formData.append("newStatus", "SHIPPED");
  return updateOrderStatusAction(formData);
}

export async function updateSellingPriceAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const inventoryId = formData.get("inventoryId") as string;
  const price = parseFloat(formData.get("price") as string);

  try {
    await prisma.inventory.update({
      where: { id: inventoryId, userId: session.user.id },
      data: { sellingPrice: price }
    });
    revalidatePath("/dashboard/distributor/inventory");
    return { success: true, message: "Price updated" };
  } catch (error) {
    return { success: false, error: "Failed to update price" };
  }
}