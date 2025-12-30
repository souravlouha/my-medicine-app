"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ✅ 1. SHIPMENT RECEIVE FUNCTION (Updated)
export async function receiveShipmentAction(shipmentId: string) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) return { success: false, error: "Not found" };

    // ১. শিপমেন্ট স্ট্যাটাস আপডেট
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "DELIVERED" },
    });

    // ২. ব্যাচ আপডেট (মালিকানা পরিবর্তন: Manufacturer -> Distributor)
    // ✅ এই অংশটি নতুন। শিপমেন্টের সাথে যুক্ত সব ব্যাচ এখন আপনার হবে।
    if (shipment.distributorId) {
        await prisma.batch.updateMany({
            where: { shipmentId: shipmentId },
            data: { distributorId: shipment.distributorId }
        });
    }

    revalidatePath("/dashboard/distributor/incoming");
    revalidatePath("/dashboard/distributor");
    return { success: true };
  } catch (error) {
    console.error("Receive Error:", error);
    return { success: false, error: "Failed to update" };
  }
}

// ... updateProfile ফাংশন যেমন ছিল তেমনই থাকবে ...
export async function updateProfile(userId: string, data: any) {
    // ... previous code ...
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