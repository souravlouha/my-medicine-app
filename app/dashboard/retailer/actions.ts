'use server'
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// 1. Profile Update (Jemon chilo temoni ache)
export async function updateRetailerProfileAction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return { success: false, message: "Unauthorized!" };

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, location: address, phone: phone }
    });
    revalidatePath("/dashboard/retailer");
    return { success: true, message: "✅ Profile Updated Successfully!" };
  } catch (error) {
    return { success: false, message: "Failed to update profile." };
  }
}

// 2. Stock Receive (Ekhon theke ID automatically toiri hobe)
export async function receiveInventoryAction(transferId: string) {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer || transfer.status === "RECEIVED") {
      return { success: false, message: "Invalid or already received!" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.transfer.update({
        where: { id: transferId },
        data: { status: "RECEIVED" }
      });

      // Quantity onujayi Unit toiri hochhe
      const unitData = Array.from({ length: transfer.quantity }).map((_, i) => ({
        uid: `S-${transfer.batchId}-${Date.now()}-${i}`, // Simple Unique ID
        batchId: transfer.batchId,
        currentHolderId: transfer.toId,
        type: "STRIP",
        status: "RECEIVED"
      }));

      await tx.unit.createMany({
        data: unitData
      });
    });

    revalidatePath("/dashboard/retailer");
    return { success: true, message: "✅ Stock Received & Units Created!" };
  } catch (error) {
    console.error("Receive Error:", error);
    return { success: false, message: "Failed to receive stock." };
  }
}

// 3. Sell Medicine (Error fixing logic)
export async function sellMedicineAction(searchInput: string, totalPrice: number, quantity: number, retailerId: string) {
  try {
    // Stock-e Unit ache kina check kora
    const units = await prisma.unit.findMany({
      where: {
        currentHolderId: retailerId,
        status: { not: "SOLD" },
        OR: [
          { uid: searchInput },
          { 
            batch: { 
              medicineName: { 
                contains: searchInput, 
                mode: 'insensitive' 
              } 
            } 
          }
        ]
      },
      take: quantity,
      include: { batch: true }
    });

    // Jodi unit na thake (Purono stock er khetre eta hote pare)
    if (units.length < quantity) {
      return { 
        success: false, 
        message: `❌ Stock-e Unit nei! (Puraon stock hole eita hobe, notun kore receive kore dekho)` 
      };
    }

    const pricePerUnit = totalPrice / quantity;
    const batchId = units[0].batchId;

    await prisma.$transaction(async (tx) => {
      // Unit SOLD kora
      for (const unit of units) {
        await tx.unit.update({
          where: { uid: unit.uid },
          data: { status: "SOLD", currentHolderId: null }
        });

        // Sale record create kora
        await tx.sale.create({
          data: {
            retailerId: retailerId,
            medicineName: unit.batch.medicineName,
            batchId: unit.batchId,
            unitUid: unit.uid,
            salePrice: pricePerUnit
          }
        });
      }

      // Main stock table theke quantity komano
      await tx.transfer.updateMany({
        where: {
          toId: retailerId,
          batchId: batchId,
          status: "RECEIVED"
        },
        data: {
          quantity: { decrement: quantity }
        }
      });
    });

    revalidatePath("/dashboard/retailer");
    return { success: true, message: `🎉 Successfully sold ${quantity} units!` };

  } catch (error) {
    console.error("Sale Error:", error);
    return { success: false, message: "Kono ekta vul hoyeche, abar chesta koro!" };
  }
}