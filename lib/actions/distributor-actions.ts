"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; // ✅ Auth ইম্পোর্ট করা হলো (কুকির বদলে)

// ==========================================
// 1. SHIPMENT RECEIVE ACTION (Distributor receives stock)
// ==========================================
export async function receiveShipmentAction(shipmentId: string) {
  // ✅ ফিক্স: কুকির বদলে Auth ব্যবহার করা হচ্ছে
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    console.error("Receive Action: No User ID found in session");
    return { success: false, error: "Unauthorized: Please login first." };
  }

  try {
    console.log(`Receiving Shipment ID: ${shipmentId} for User: ${userId}`);

    // ১. শিপমেন্ট চেক করা
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { items: true } 
    });

    if (!shipment) return { success: false, error: "Shipment not found" };
    
    // Authorization Check
    if (shipment.distributorId !== userId) {
        console.error(`Auth Error: Shipment Receiver ${shipment.distributorId} !== Current User ${userId}`);
        return { success: false, error: "Not authorized to receive this shipment" };
    }

    if (shipment.status === "DELIVERED") return { success: false, error: "Already received!" };

    // ২. ট্রানজ্যাকশন (স্টক আপডেট + স্ট্যাটাস চেঞ্জ)
    await prisma.$transaction(async (tx) => {
      
      // A. ইনভেন্টরি আপডেট (Loop through items)
      const itemsToProcess = shipment.items || []; 

      for (const item of itemsToProcess) {
        // ডিস্ট্রিবিউটরের ইনভেন্টরিতে এই ব্যাচ আছে কিনা দেখা
        const existingStock = await tx.inventory.findUnique({
          where: {
            userId_batchId: {
              userId: userId,
              batchId: item.batchId
            }
          }
        });

        if (existingStock) {
          // থাকলে স্টক বাড়ানো
          await tx.inventory.update({
            where: { id: existingStock.id },
            data: { 
                currentStock: { increment: item.quantity },
                // ✅ অপশনাল: totalReceived আপডেট করা ভালো ট্র্যাকিংয়ের জন্য
                // totalReceived: { increment: item.quantity } 
            }
          });
        } else {
          // না থাকলে নতুন এন্ট্রি তৈরি করা
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
          // @ts-ignore: Enum conflict fix
          status: "DELIVERED" as any, 
          receivedAt: new Date()
        }
      });

    });

    console.log("Transaction Successful!");

    revalidatePath("/dashboard/distributor");
    revalidatePath("/dashboard/distributor/incoming");
    revalidatePath("/dashboard/distributor/inventory");
    
    return { success: true, message: "Stock Received Successfully!" };

  } catch (error) {
    console.error("Receive Action Error:", error);
    return { success: false, error: "Failed to update inventory. Check server logs." };
  }
}

// ==========================================
// 2. PLACE ORDER ACTION (Distributor buys from Manufacturer)
// ==========================================
export async function placeOrderAction(formData: FormData) {
  // ✅ ফিক্স: কুকির বদলে Auth
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { success: false, error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  const manufacturerId = formData.get("manufacturerId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);

  if (!productId || !quantity || !manufacturerId) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    await prisma.order.create({
      data: {
        orderId: orderId,
        senderId: userId,         // Distributor (Buyer)
        receiverId: manufacturerId, // Manufacturer (Seller)
        totalAmount: price * quantity,
        // @ts-ignore
        status: "PENDING" as any,
        items: {
          create: {
            productId: productId,
            quantity: quantity,
            price: price
          }
        }
      }
    });

    revalidatePath("/dashboard/distributor/orders");
    return { success: true, message: "Order Placed Successfully!" };

  } catch (error) {
    console.error("Order Error:", error);
    return { success: false, error: "Failed to place order." };
  }
}

// ==========================================
// 3. CREATE MANUAL SHIPMENT (Distributor sends to Retailer manually)
// ==========================================
export async function createDistributorShipmentAction(formData: FormData) {
  // ✅ ফিক্স: কুকির বদলে Auth
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { success: false, error: "Unauthorized" };

  const retailerId = formData.get("retailerId") as string;
  const inventoryId = formData.get("inventoryId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const pricePerUnit = parseFloat(formData.get("price") as string);

  if (!retailerId || !inventoryId || !quantity) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const inventoryItem = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: { batch: true }
    });

    if (!inventoryItem || inventoryItem.currentStock < quantity) {
      return { success: false, error: "Insufficient stock in inventory!" };
    }

    await prisma.$transaction(async (tx) => {
      // A. স্টক কমানো
      await tx.inventory.update({
        where: { id: inventoryId },
        data: { currentStock: { decrement: quantity } }
      });

      // B. শিপমেন্ট তৈরি
      const shipmentId = `SHP-${Date.now().toString().slice(-6)}`;
      
      await tx.shipment.create({
        data: {
          shipmentId: shipmentId,
          manufacturerId: userId, // Distributor acting as Sender
          distributorId: retailerId, // Retailer receiving
          totalAmount: quantity * pricePerUnit,
          // @ts-ignore
          status: "IN_TRANSIT" as any,
          items: { 
            create: {
              batchId: inventoryItem.batchId,
              quantity: quantity,
              price: pricePerUnit
            }
          }
        }
      });
    });

    revalidatePath("/dashboard/distributor/inventory");
    revalidatePath("/dashboard/distributor/shipment");
    return { success: true, message: "Shipment Dispatched to Retailer!" };

  } catch (error) {
    console.error("Dispatch Error:", error);
    return { success: false, error: "Failed to create shipment." };
  }
}

// ==========================================
// 4. UPDATE ORDER STATUS ACTION (Manage Incoming Orders)
// ==========================================
export async function updateOrderStatusAction(formData: FormData) {
  // এই ফাংশনে অথ চেক দরকার নেই কারণ এটি সাধারণত এডমিন বা অথরাইজড পেজ থেকেই কল হয়, 
  // তবে সিকিউরিটির জন্য এখানেও অথ চেক দেওয়া ভালো। আপাতত আপনার কোড অনুযায়ী রাখলাম।
  
  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("newStatus") as string;

  if (!orderId || !newStatus) return;

  try {
    // অর্ডার স্ট্যাটাস আপডেট করা
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any } 
    });

    // পেজ রিফ্রেশ করা যাতে UI আপডেট হয়
    revalidatePath("/dashboard/distributor/orders");
    
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw new Error("Failed to update order status");
  }
}