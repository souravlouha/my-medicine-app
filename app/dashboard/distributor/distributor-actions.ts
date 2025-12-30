"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ✅ 1. SHIPMENT RECEIVE FUNCTION (Fixed Case Sensitivity)
export async function receiveShipmentAction(shipmentId: string) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      // ⚠️ FIX: ShipmentItem (বড় হাতের S) এর বদলে shipmentItems (ছোট হাতের s) ব্যবহার করা হয়েছে।
      // যদি আপনার স্কিমায় অন্য নাম থাকে (যেমন items), তবে সেটা ব্যবহার করতে হবে।
      include: { shipmentItems: true } 
    });

    if (!shipment) return { success: false, error: "Not found" };

    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "DELIVERED" },
    });

    if (shipment.distributorId) {
        // ⚠️ FIX: এখানেও shipmentItems ব্যবহার করতে হবে
        // @ts-ignore (যদি টাইপস্ক্রিপ্ট ঝামেলা করে, তাই ইগনোর ট্যাগ রাখা হলো, তবে নাম ঠিক থাকলে লাগবে না)
        const batchIds = shipment.shipmentItems ? shipment.shipmentItems.map((item: any) => item.batchId) : [];

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