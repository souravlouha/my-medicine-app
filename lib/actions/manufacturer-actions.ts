"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; 
import bcrypt from "bcryptjs"; // ✅ পাসওয়ার্ড হ্যাশিং এর জন্য ইম্পোর্ট

// ==========================================
// 1. PRODUCT CATALOG ACTIONS
// ==========================================

export async function createProductAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    const autoCode = `MED-${timestamp}${randomNum}`;

    await prisma.product.create({
      data: {
        productCode: autoCode,
        name: formData.get("name") as string,
        genericName: formData.get("genericName") as string,
        type: (formData.get("type") as string).toUpperCase() as any,
        strength: formData.get("strength") as string,
        storageTemp: formData.get("storageTemp") as string,
        basePrice: parseFloat(formData.get("basePrice") as string) || 0,
        manufacturerId: userId
      }
    });
    
    revalidatePath("/dashboard/manufacturer/catalog");
    return { success: true, message: "✅ Product added with Code: " + autoCode };
  } catch (error) {
    console.error("Create Product Error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProductAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  const productId = formData.get("productId") as string;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: formData.get("name") as string,
        genericName: formData.get("genericName") as string,
        type: formData.get("type") as any,
        strength: formData.get("strength") as string,
        storageTemp: formData.get("storageTemp") as string,
        basePrice: parseFloat(formData.get("basePrice") as string) || 0,
      }
    });
    revalidatePath("/dashboard/manufacturer/catalog");
    return { success: true, message: "✅ Product Updated Successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

export async function getProducts() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return [];
  
  return await prisma.product.findMany({ where: { manufacturerId: userId } });
}


// ==========================================
// 2. ADVANCED BATCH CREATION (Auto-Calculation Logic)
// ==========================================

export async function createAdvancedBatchAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  const mrp = parseFloat(formData.get("mrp") as string);
  const mfgDate = new Date(formData.get("mfgDate") as string);
  const expDate = new Date(formData.get("expDate") as string);
  
  // Hierarchy Inputs
  const totalCartons = parseInt(formData.get("totalCartons") as string);
  const boxesPerCarton = parseInt(formData.get("boxesPerCarton") as string);
  const stripsPerBox = parseInt(formData.get("stripsPerBox") as string);

  // 🧮 Auto Calculate Total Quantity (Strips)
  const totalQuantity = totalCartons * boxesPerCarton * stripsPerBox;

  try {
    // A. Auto Batch ID Generation
    const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); 
    const count = await prisma.batch.count({ where: { manufacturerId: userId } });
    
    const uniqueSuffix = userId.slice(-4).toUpperCase();
    const autoBatchNumber = `B-${dateStr}-${(count + 1).toString().padStart(3, '0')}-${uniqueSuffix}`;

    // B. Create Batch
    const batch = await prisma.batch.create({
      data: {
        batchNumber: autoBatchNumber,
        productId,
        manufacturerId: userId,
        mrp,
        totalQuantity: totalQuantity,
        mfgDate,
        expDate
      }
    });

    // C. Update Inventory
    await prisma.inventory.create({
      data: { userId, batchId: batch.id, currentStock: totalQuantity }
    });

    // D. Generate Hierarchy & QR Units (Loop)
    await createBatchWithHierarchy(batch.id, userId, totalCartons, boxesPerCarton, stripsPerBox, autoBatchNumber);

    revalidatePath("/dashboard/manufacturer");
    return { success: true, message: `Production Complete! Batch: ${autoBatchNumber}`, batchId: batch.id, batchNo: autoBatchNumber };

  } catch (error) {
    console.error("Production Error:", error);
    return { success: false, error: "Production failed. Please try again." };
  }
}

// Helper: Hierarchy Generation
export async function createBatchWithHierarchy(
  batchId: string, 
  manufacturerId: string, 
  totalCartons: number, 
  boxesPerCarton: number, 
  stripsPerBox: number,
  batchNo: string
) {
  try {
    for (let c = 1; c <= totalCartons; c++) {
      const cartonUid = `CARTON-${batchNo}-${c}`; 
      
      const carton = await prisma.unit.create({
        data: {
          uid: cartonUid,
          type: "CARTON",
          batchId: batchId,
          currentHandlerId: manufacturerId,
          status: "CREATED"
        }
      });

      for (let b = 1; b <= boxesPerCarton; b++) {
        const boxUid = `BOX-${batchNo}-${c}-${b}`;
        
        const box = await prisma.unit.create({
          data: {
            uid: boxUid,
            type: "BOX",
            batchId: batchId,
            parentId: carton.id,
            currentHandlerId: manufacturerId,
            status: "CREATED"
          }
        });

        const stripsData = [];
        for (let s = 1; s <= stripsPerBox; s++) {
          stripsData.push({
            uid: `STRIP-${batchNo}-${c}-${b}-${s}`,
            type: "STRIP",
            batchId: batchId,
            parentId: box.id,
            currentHandlerId: manufacturerId,
            status: "CREATED"
          });
        }
        
        // @ts-ignore
        await prisma.unit.createMany({ data: stripsData });
      }
    }
    console.log("✅ Hierarchy Generated Successfully");
  } catch (error) {
    console.error("Hierarchy Generation Failed:", error);
  }
}

// ==========================================
// 3. SHIPMENT & ORDER ACTIONS
// ==========================================

export async function getDistributors() {
  try {
    return await prisma.user.findMany({
      where: { role: "DISTRIBUTOR" },
      select: { id: true, name: true, publicId: true, address: true, licenseNo: true, gstNo: true }
    });
  } catch (error) {
    return [];
  }
}

// ✅ Approve Order
export async function approveOrderAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  if (!orderId) return { success: false, error: "Order ID missing" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "APPROVED" }
    });

    revalidatePath("/dashboard/manufacturer/orders");
    return { success: true, message: "✅ Order Approved! Ready for Shipment." };
  } catch (error) {
    return { success: false, error: "Failed to approve order" };
  }
}

// ✅ Ship Approved Order
export async function shipApprovedOrderAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "APPROVED") throw new Error("Order must be approved first");

    await prisma.$transaction(async (tx) => {
      const shipmentId = `SHP-${Date.now().toString().slice(-6)}`;
      let shipmentTotal = 0;
      const shipmentItemsData = [];

      for (const item of order.items) {
        const inventoryRecord = await tx.inventory.findFirst({
          where: { 
            userId: order.receiverId, 
            batch: { productId: item.productId },
            currentStock: { gte: item.quantity }
          },
          include: { batch: true },
          orderBy: { batch: { expDate: 'asc' } }
        });

        if (!inventoryRecord) throw new Error(`Stock mismatch for Product ID: ${item.productId}`);

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

      await tx.shipment.create({
        data: {
          shipmentId: shipmentId,
          manufacturerId: order.receiverId,
          distributorId: order.senderId,
          totalAmount: shipmentTotal,
          status: "IN_TRANSIT",
          items: { create: shipmentItemsData }
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: "SHIPPED" }
      });
    }, {
      maxWait: 5000, 
      timeout: 20000
    });

    // ✅ ড্যাশবোর্ড আপডেট করা হচ্ছে
    revalidatePath("/dashboard/manufacturer");
    revalidatePath("/dashboard/manufacturer/orders");

    return { success: true, message: "✅ Invoice Generated & Shipment Dispatched!" };

  } catch (error: any) {
    console.error("Shipment Logic Error:", error);
    return { success: false, error: error.message || "Shipment Failed" };
  }
}

// ✅ Reject Order
export async function rejectOrderAction(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    
    if (!orderId) return;
  
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
      });
  
      revalidatePath("/dashboard/manufacturer/orders");
      return { success: true, message: "Order Rejected (Cancelled)" };
    } catch (error) {
      console.error("Reject Error:", error);
      return { success: false, error: "Failed to reject order" };
    }
}

// [MANUAL SHIPMENT]
export async function createShipmentAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  const distributorId = formData.get("distributorId") as string;
  const batchId = formData.get("batchId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);

  try {
    await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findFirst({
        where: { userId: userId, batchId: batchId }
      });

      if (!inventory || inventory.currentStock < quantity) {
        throw new Error("❌ Insufficient Stock!");
      }

      await tx.shipment.create({
        data: {
          shipmentId: `SHP-${Math.floor(10000 + Math.random() * 90000)}`,
          manufacturerId: userId,
          distributorId: distributorId,
          status: "IN_TRANSIT",
          totalAmount: quantity * price,
          items: {
            create: { batchId: batchId, quantity: quantity, price: price }
          }
        }
      });

      await tx.inventory.update({
        where: { id: inventory.id },
        data: { currentStock: { decrement: quantity } }
      });
    });

    // ✅ ড্যাশবোর্ড আপডেট করা হচ্ছে
    revalidatePath("/dashboard/manufacturer");
    return { success: true, message: "✅ Shipment Dispatched!" };

  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create shipment" };
  }
}

// ==========================================
// 4. RECALL ACTIONS
// ==========================================

export async function recallBatchAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  const batchId = formData.get("batchId") as string;
  const reason = formData.get("reason") as string;

  try {
    await prisma.recall.create({
      data: { batchId, reason, issuedBy: userId, status: "ACTIVE" }
    });

    await prisma.unit.updateMany({
      where: { batchId },
      data: { status: "RECALLED" }
    });

    revalidatePath("/dashboard/manufacturer/recall");
    return { success: true, message: "⚠️ Batch Recalled Successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to issue recall." };
  }
}

// ✅ BULK SHIPMENT ACTION
export async function createBulkShipmentAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  const distributorId = formData.get("distributorId") as string;
  const cartData = formData.get("cartData") as string; 

  if (!distributorId || !cartData) {
    return { success: false, error: "Invalid Data" };
  }

  const items = JSON.parse(cartData);
  let totalAmount = 0;

  items.forEach((item: any) => {
    const total = item.quantity * item.unitPrice;
    const tax = total * 0.18; 
    totalAmount += (total + tax);
  });

  try {
    await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          shipmentId: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
          manufacturerId: userId,
          distributorId: distributorId,
          status: "IN_TRANSIT",
          totalAmount: totalAmount,
          items: {
            create: items.map((item: any) => ({
              batchId: item.id,
              quantity: item.quantity,
              price: item.unitPrice 
            }))
          }
        }
      });

      for (const item of items) {
        const inventory = await tx.inventory.findFirst({
            where: { userId: userId, batchId: item.id }
        });

        if (!inventory || inventory.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for batch: ${item.id}`);
        }

        await tx.inventory.update({
            where: { id: inventory.id },
            data: { currentStock: { decrement: item.quantity } }
        });
      }
    });

    // ✅ ড্যাশবোর্ড আপডেট করা হচ্ছে
    revalidatePath("/dashboard/manufacturer");
    
    return { success: true, message: "✅ Shipment Confirmed & Saved to Database!" };

  } catch (error: any) {
    console.error("Shipment Error:", error);
    return { success: false, error: error.message || "Failed to process shipment" };
  }
}

// ✅ UPDATE PROFILE ACTION
export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string, 
        licenseNo: formData.get("licenseNo") as string,
        gstNo: formData.get("gstNo") as string, // ✅ GST Update
      }
    });

    revalidatePath("/dashboard/manufacturer");
    return { success: true, message: "✅ Profile Updated Successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to update profile" };
  }
}

// ✅ CREATE DISTRIBUTOR ACTION
export async function createDistributor(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const licenseNo = formData.get("licenseNo") as string;
  
  const gstNo = formData.get("gstNo") as string; 

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, 
        role: "DISTRIBUTOR",
        licenseNo,
        gstNo: gstNo || null, 
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Create Distributor Error:", error);
    return { success: false, error: "Failed to create distributor" };
  }
}