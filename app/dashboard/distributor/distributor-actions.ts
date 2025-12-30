"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ✅ 1. SHIPMENT RECEIVE FUNCTION (Safe Fix - No 'include' used)
export async function receiveShipmentAction(shipmentId: string) {
  try {
    // ১. শুধু শিপমেন্ট খুঁজুন (রিলেশন ছাড়া)
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) return { success: false, error: "Not found" };

    // ২. স্ট্যাটাস আপডেট
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "DELIVERED" },
    });

    // ৩. ব্যাচ আপডেট (Ownership Transfer)
    if (shipment.distributorId) {
        // ⚠️ FIX: 'include' ব্যবহার না করে আলাদাভাবে আইটেমগুলো আনা হচ্ছে
        // এতে রিলেশন নামের কোনো এরর আসবে না
        const shipmentItems = await prisma.shipmentItem.findMany({
            where: { shipmentId: shipmentId }
        });

        const batchIds = shipmentItems.map(item => item.batchId);

        if (batchIds.length > 0) {
            await prisma.batch.updateMany({
                where: { 
                    id: { in: batchIds } 
                },
                data: { 
                    distributorId: shipment.distributorId 
                }
            });
        }
    }

    revalidatePath("/dashboard/distributor/incoming");
    revalidatePath("/dashboard/distributor");
    return { success: true };
  } catch (error) {
    console.error("Receive Error:", error);
    return { success: false, error: "Failed to update" };
  }
}

// ✅ 2. PROFILE UPDATE FUNCTION
export async function updateProfile(userId: string, data: any) {
  try {
    if (!userId) return { success: false, error: "User ID missing" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        location: data.location,
        phone: data.phone,
        licenseNo: data.licenseNo,
        gstNo: data.gstNo,
      },
    });

    revalidatePath("/dashboard/distributor");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}