"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ✅ 1. SHIPMENT RECEIVE FUNCTION
export async function receiveShipmentAction(shipmentId: string) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) return { success: false, error: "Not found" };

    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "DELIVERED" },
    });

    revalidatePath("/dashboard/distributor/incoming");
    revalidatePath("/dashboard/distributor");
    return { success: true };
  } catch (error) {
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