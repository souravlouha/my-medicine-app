"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ✅ 1. SHIPMENT RECEIVE FUNCTION (Updated for Build Fix)
export async function receiveShipmentAction(shipmentId: string) {
  try {
    // ১. শিপমেন্ট এবং তার আইটেমগুলো খুঁজুন
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { ShipmentItem: true } // ব্যাচ আইডি পাওয়ার জন্য এটা লাগবে
    });

    if (!shipment) return { success: false, error: "Not found" };

    // ২. স্ট্যাটাস আপডেট
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "DELIVERED" },
    });

    // ৩. ব্যাচ আপডেট (Ownership Transfer) - FIXED LOGIC
    if (shipment.distributorId) {
        // ShipmentItem থেকে সব ব্যাচ আইডি বের করছি
        const batchIds = shipment.ShipmentItem.map(item => item.batchId);

        if (batchIds.length > 0) {
            // যাদের আইডি এই লিস্টে আছে, শুধু তাদের আপডেট করো
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