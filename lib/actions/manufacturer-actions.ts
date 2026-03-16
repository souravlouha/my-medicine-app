"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ==========================================
// Validation Schemas
// ==========================================

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(200),
  genericName: z.string().optional(),
  type: z.enum(["TABLET", "CAPSULE", "SYRUP", "INJECTION", "CREAM", "DROPS", "SPRAY"] as const),
  strength: z.string().optional(),
  storageTemp: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Price cannot be negative"),
  tabletsPerStrip: z.coerce.number().int().min(1).max(1000).default(10),
});

// ==========================================
// 1. PRODUCT CATALOG ACTIONS
// ==========================================

// Create New Product
export async function createProductAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    genericName: formData.get("genericName"),
    type: (formData.get("type") as string)?.toUpperCase(),
    strength: formData.get("strength"),
    storageTemp: formData.get("storageTemp"),
    basePrice: formData.get("basePrice"),
    tabletsPerStrip: formData.get("tabletsPerStrip"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 99).toString().padStart(2, "0");
    const autoCode = `MED-${timestamp}${randomNum}`;

    await prisma.product.create({
      data: {
        productCode: autoCode,
        name: parsed.data.name,
        genericName: parsed.data.genericName ?? null,
        type: parsed.data.type as any,
        strength: parsed.data.strength ?? null,
        storageTemp: parsed.data.storageTemp ?? null,
        basePrice: parsed.data.basePrice,
        manufacturerId: userId,
        tabletsPerStrip: parsed.data.tabletsPerStrip,
      }
    });

    revalidatePath("/dashboard/manufacturer/catalog");
    return { success: true, message: "Product added: " + autoCode };
  } catch (error) {
    console.error("Create Product Error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

// Update Existing Product
export async function updateProductAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  if (!productId) return { success: false, error: "Product ID is required" };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    genericName: formData.get("genericName"),
    type: (formData.get("type") as string)?.toUpperCase(),
    strength: formData.get("strength"),
    storageTemp: formData.get("storageTemp"),
    basePrice: formData.get("basePrice"),
    tabletsPerStrip: formData.get("tabletsPerStrip"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Verify the product belongs to this manufacturer
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { manufacturerId: true },
    });
    if (!existing || existing.manufacturerId !== userId) {
      return { success: false, error: "Forbidden: Product not found or access denied." };
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        genericName: parsed.data.genericName ?? null,
        type: parsed.data.type as any,
        strength: parsed.data.strength ?? null,
        storageTemp: parsed.data.storageTemp ?? null,
        basePrice: parsed.data.basePrice,
        tabletsPerStrip: parsed.data.tabletsPerStrip,
      }
    });
    revalidatePath("/dashboard/manufacturer/catalog");
    return { success: true, message: "Product Updated Successfully!" };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// ✅ Get All Products for Manufacturer
export async function getProducts() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  return await prisma.product.findMany({ where: { manufacturerId: userId } });
}


// ==========================================
// 2. ADVANCED BATCH CREATION & HIERARCHY
// ==========================================

// ✅ Create Batch with Full Hierarchy (Carton > Box > Strip)
export async function createAdvancedBatchAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  const mrp = parseFloat(formData.get("mrp") as string);
  const mfgDate = new Date(formData.get("mfgDate") as string);
  const expDate = new Date(formData.get("expDate") as string);
  
  const totalCartons = parseInt(formData.get("totalCartons") as string);
  const boxesPerCarton = parseInt(formData.get("boxesPerCarton") as string);
  const stripsPerBox = parseInt(formData.get("stripsPerBox") as string);
  if ([totalCartons, boxesPerCarton, stripsPerBox].some(v => isNaN(v) || v <= 0)) {
    return { success: false, error: "Invalid packaging values" };
  }
  if (isNaN(mrp) || mrp < 0) return { success: false, error: "Invalid MRP" };
  // মোট কোয়ান্টিটি ক্যালকুলেশন
  const totalQuantity = totalCartons * boxesPerCarton * stripsPerBox;

  try {
    const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); 
    const count = await prisma.batch.count({ where: { manufacturerId: userId } });
    const uniqueSuffix = userId.slice(-4).toUpperCase();
    const autoBatchNumber = `B-${dateStr}-${(count + 1).toString().padStart(3, '0')}-${uniqueSuffix}`;

    // ১. ব্যাচ তৈরি
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

    // ২. ইনভেন্টরিতে যোগ করা
    await prisma.inventory.create({
      data: { userId, batchId: batch.id, currentStock: totalQuantity }
    });

    // ৩. হায়ারার্কি জেনারেশন (অ্যাসিনক্রোনাস)
    await createBatchWithHierarchy(batch.id, userId, totalCartons, boxesPerCarton, stripsPerBox, autoBatchNumber);

    revalidatePath("/dashboard/manufacturer");
    return { success: true, message: `Production Complete! Batch: ${autoBatchNumber}`, batchId: batch.id, batchNo: autoBatchNumber };

  } catch (error) {
    console.error("Production Error:", error);
    return { success: false, error: "Production failed. Please try again." };
  }
}

// Helper: Generate Unit Hierarchy (internal — not a server action)
async function createBatchWithHierarchy(
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

// ✅ Approve Order (Distributor Request)
export async function approveOrderAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const orderId = formData.get("orderId") as string;
  if (!orderId) return { success: false, error: "Order ID missing" };

  try {
    // Verify this order belongs to the logged-in manufacturer
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { receiverId: true, status: true } });
    if (!order || order.receiverId !== session.user.id) return { success: false, error: "Order not found" };
    if (order.status !== "PENDING") return { success: false, error: "Only pending orders can be approved" };

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

// ✅ Ship Approved Order (Auto Shipment Creation)
export async function shipApprovedOrderAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const orderId = formData.get("orderId") as string;
  if (!orderId) return { success: false, error: "Order ID missing" };
  
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) return { success: false, error: "Order not found" };
    if (order.receiverId !== session.user.id) return { success: false, error: "Forbidden" };
    if (order.status !== "APPROVED") return { success: false, error: "Order must be approved first" };

    await prisma.$transaction(async (tx) => {
      const shipmentId = `SHP-${Date.now().toString().slice(-6)}`;
      let shipmentTotal = 0;
      const shipmentItemsData = [];

      for (const item of order.items) {
        // স্টক চেক করা
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

      // শিপমেন্ট তৈরি
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

      // ✅ BatchMovement record for supply chain tracking
      const senderUser = await tx.user.findUnique({ where: { id: order.receiverId }, select: { name: true } });
      const receiverUser = await tx.user.findUnique({ where: { id: order.senderId }, select: { name: true, role: true } });
      for (const item of shipmentItemsData) {
        await tx.batchMovement.create({
          data: {
            batchId: item.batchId,
            senderId: order.receiverId,
            receiverId: order.senderId,
            senderName: senderUser?.name || "Manufacturer",
            receiverName: receiverUser?.name || "Distributor",
            role: receiverUser?.role as any || "DISTRIBUTOR",
            quantity: item.quantity,
            status: "IN_TRANSIT",
          },
        });

        // 🔗 Strip-level tracking: update currentHandlerId
        const stripsToTransfer = await tx.unit.findMany({
          where: { batchId: item.batchId, type: "STRIP", currentHandlerId: order.receiverId },
          take: item.quantity,
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

      // অর্ডার স্ট্যাটাস আপডেট
      await tx.order.update({
        where: { id: orderId },
        data: { status: "SHIPPED" }
      });
    }, {
      maxWait: 5000, 
      timeout: 20000
    });

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
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const orderId = formData.get("orderId") as string;
    if (!orderId) return { success: false, error: "Order ID missing" };
  
    try {
      // Verify ownership
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { receiverId: true, status: true } });
      if (!order || order.receiverId !== session.user.id) return { success: false, error: "Order not found" };
      if (order.status !== "PENDING" && order.status !== "APPROVED") return { success: false, error: "Cannot reject this order" };
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

// ✅ Create Manual Shipment
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

      // ✅ BatchMovement record for supply chain tree
      const mfgUser = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
      const distUser = await tx.user.findUnique({ where: { id: distributorId }, select: { name: true } });
      await tx.batchMovement.create({
        data: {
          batchId: batchId,
          senderId: userId,
          receiverId: distributorId,
          senderName: mfgUser?.name || "Manufacturer",
          receiverName: distUser?.name || "Distributor",
          role: "DISTRIBUTOR",
          quantity: quantity,
          status: "IN_TRANSIT",
        },
      });

      // 🔗 Strip-level tracking: update currentHandlerId
      const stripsToTransfer = await tx.unit.findMany({
        where: { batchId, type: "STRIP", currentHandlerId: userId },
        take: quantity,
        orderBy: { uid: "asc" },
        select: { id: true },
      });
      if (stripsToTransfer.length > 0) {
        await tx.unit.updateMany({
          where: { id: { in: stripsToTransfer.map((s) => s.id) } },
          data: { currentHandlerId: distributorId },
        });
      }
    });

    revalidatePath("/dashboard/manufacturer");
    return { success: true, message: "✅ Shipment Dispatched!" };

  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create shipment" };
  }
}

// ==========================================
// 4. RECALL & BULK ACTIONS
// ==========================================

// ✅ Recall Batch
export async function recallBatchAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) return { success: false, error: "Unauthorized" };

  const batchId = formData.get("batchId") as string;
  const reason = formData.get("reason") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // Check for duplicate active recall
      const existingRecall = await tx.recall.findFirst({
        where: { batchId, status: "ACTIVE" }
      });
      if (existingRecall) throw new Error("Batch already has an active recall");

      await tx.recall.create({
        data: { batchId, reason, issuedBy: userId, status: "ACTIVE" }
      });

      await tx.unit.updateMany({
        where: { batchId },
        data: { status: "RECALLED" }
      });
    });

    revalidatePath("/dashboard/manufacturer/recall");
    return { success: true, message: "⚠️ Batch Recalled Successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to issue recall." };
  }
}

// ✅ Create Bulk Shipment
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

      // ✅ Get names for BatchMovement
      const mfgUser = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
      const distUser = await tx.user.findUnique({ where: { id: distributorId }, select: { name: true } });

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

        // ✅ BatchMovement record for each batch in bulk shipment
        await tx.batchMovement.create({
          data: {
            batchId: item.id,
            senderId: userId,
            receiverId: distributorId,
            senderName: mfgUser?.name || "Manufacturer",
            receiverName: distUser?.name || "Distributor",
            role: "DISTRIBUTOR",
            quantity: item.quantity,
            status: "IN_TRANSIT",
          },
        });

        // 🔗 Strip-level tracking: update currentHandlerId
        const stripsToTransfer = await tx.unit.findMany({
          where: { batchId: item.id, type: "STRIP", currentHandlerId: userId },
          take: item.quantity,
          orderBy: { uid: "asc" },
          select: { id: true },
        });
        if (stripsToTransfer.length > 0) {
          await tx.unit.updateMany({
            where: { id: { in: stripsToTransfer.map((s) => s.id) } },
            data: { currentHandlerId: distributorId },
          });
        }
      }
    });

    revalidatePath("/dashboard/manufacturer");
    return { success: true, message: "✅ Shipment Confirmed & Saved to Database!" };

  } catch (error: any) {
    console.error("Shipment Error:", error);
    return { success: false, error: error.message || "Failed to process shipment" };
  }
}

// ✅ Update Manufacturer Profile
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
        gstNo: formData.get("gstNo") as string, 
      }
    });

    revalidatePath("/dashboard/manufacturer");
    return { success: true, message: "✅ Profile Updated Successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to update profile" };
  }
}

// ✅ Create Distributor Account
export async function createDistributor(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const licenseNo = formData.get("licenseNo") as string;
  
  const gstNo = formData.get("gstNo") as string;

  if (!name || !email || !password) return { success: false, error: "Name, email, and password are required" };

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