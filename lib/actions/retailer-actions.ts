"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // ✅ Auth ইম্পোর্ট নিশ্চিত করুন

// 1. CREATE ORDER
export async function createOrderAction(formData: FormData) {
  const session = await auth(); // ✅ FIX: কুকির বদলে সেশন
  const userId = session?.user?.id;
  
  if (!userId) throw new Error("User not authenticated");

  const distributorId = formData.get("distributorId") as string;
  const productId = formData.get("productId") as string;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);

  const orderId = `ORD-${Date.now().toString().slice(-6)}`;

  await prisma.order.create({
    data: {
      orderId, 
      senderId: userId, 
      receiverId: distributorId, 
      totalAmount: price * quantity, 
      status: "PENDING",
      items: { create: { productId, quantity, price } }
    }
  });
  redirect("/dashboard/retailer/orders");
}

// 2. RECEIVE ORDER (Legacy - Keep as is)
export async function receiveOrderAction(formData: FormData) {
  // Legacy logic
}

// 3. ✅ RECEIVE SHIPMENT ACTION (Fix applied here)
export async function receiveShipmentAction(formData: FormData) {
  const session = await auth(); // ✅ FIX: কুকির বদলে সেশন ব্যবহার করা হলো
  const userId = session?.user?.id;
  
  if (!userId) {
      console.error("Unauthorized: No User ID found");
      return;
  }

  const shipmentId = formData.get("shipmentId") as string;

  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { items: { include: { batch: { include: { product: true } } } } } 
    });

    if (!shipment) throw new Error("Shipment not found");
    
    // Authorization Check: নিশ্চিত করা হচ্ছে যে এই রিটেইলারই রিসিভার
    if (shipment.distributorId !== userId) {
        throw new Error("Unauthorized: You are not the receiver of this shipment"); 
    }
    
    if (shipment.status === "DELIVERED") {
        throw new Error("Already received");
    }

    // Transaction: স্টক আপডেট + স্ট্যাটাস চেঞ্জ
    await prisma.$transaction(async (tx) => {
      for (const item of shipment.items) {
        // রিটেইলারের ইনভেন্টরি চেক করা
        const existingStock = await tx.inventory.findFirst({
            where: { 
                userId: userId, 
                batchId: item.batchId 
            }
        });

        if (existingStock) {
             // স্টক থাকলে বাড়াবে
             await tx.inventory.update({ 
                 where: { id: existingStock.id }, 
                 data: { currentStock: { increment: item.quantity } } 
             });
        } else {
             // স্টক না থাকলে নতুন এন্ট্রি (Selling Price 0 থাকবে, পরে সেট করবে)
             await tx.inventory.create({ 
                 data: { 
                     userId: userId, 
                     batchId: item.batchId, 
                     currentStock: item.quantity,
                     sellingPrice: 0 
                 } 
             });
        }
      }

      // শিপমেন্ট স্ট্যাটাস আপডেট
      await tx.shipment.update({ 
          where: { id: shipmentId }, 
          data: { status: "DELIVERED", receivedAt: new Date() } 
      });
    });

    console.log("✅ Shipment Received Successfully!");

    revalidatePath("/dashboard/retailer/incoming");
    revalidatePath("/dashboard/retailer/inventory");
    
  } catch (error) {
    console.error("Receive Error:", error);
  }
}

// 4. ADD TO CART
export async function addToCartAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const inventoryId = formData.get("inventoryId") as string;
  const price = parseFloat(formData.get("price") as string);
  
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, inventoryId: inventoryId },
  });

  if (existingItem) {
    await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: existingItem.quantity + 1 } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, inventoryId: inventoryId, quantity: 1, price: price } });
  }
  redirect("/dashboard/retailer/cart");
}

// 5. UPDATE CART QTY
export async function updateCartItemQuantityAction(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const actionType = formData.get("type") as "plus" | "minus";

  const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!cartItem) return;

  if (actionType === "plus") {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: cartItem.quantity + 1 } });
  } else if (actionType === "minus" && cartItem.quantity > 1) {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: cartItem.quantity - 1 } });
  }
  revalidatePath("/dashboard/retailer/cart");
}

// 6. REMOVE CART
export async function removeFromCartAction(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/dashboard/retailer/cart");
}

// 7. PLACE ORDER (No GST)
export async function placeOrderAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { inventory: true } } }
  });

  if (!cart || cart.items.length === 0) return;

  const ordersMap = new Map();
  for (const item of cart.items) {
    const distributorId = item.inventory.userId;
    if (!ordersMap.has(distributorId)) ordersMap.set(distributorId, { totalAmount: 0, items: [] });

    const group = ordersMap.get(distributorId);
    group.items.push({ inventoryBatchId: item.inventory.batchId, quantity: item.quantity, price: item.price });
    group.totalAmount += (item.price * item.quantity);
  }

  await prisma.$transaction(async (tx) => {
    for (const [distributorId, data] of ordersMap) {
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      const order = await tx.order.create({
        data: {
          orderId, senderId: userId, receiverId: distributorId, totalAmount: data.totalAmount, status: "PENDING",
        }
      });

      for (const itemData of data.items) {
         const batch = await tx.batch.findUnique({ where: { id: itemData.inventoryBatchId }, select: { productId: true } });
         if (batch) {
             await tx.orderItem.create({
               data: { orderId: order.id, productId: batch.productId, quantity: itemData.quantity, price: itemData.price }
             });
         }
      }
    }
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  });

  redirect("/dashboard/retailer/orders"); 
}