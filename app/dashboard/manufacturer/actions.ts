'use server'

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function createBatchAction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return { success: false, message: "❌ Session expired. Please login again." };
  }

  const medicineName = formData.get("medicineName") as string;
  const batchId = formData.get("batchId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const mfgDate = new Date(formData.get("mfgDate") as string); // String to Date
  const expDate = new Date(formData.get("expDate") as string); // String to Date
  const stripsPerBox = parseInt(formData.get("stripsPerBox") as string) || 20;
  const boxesPerCarton = parseInt(formData.get("boxesPerCarton") as string) || 10;

  try {
    // ব্যাচ তৈরি
    await prisma.batch.create({
      data: {
        id: batchId, // schema অনুযায়ী id অথবা customId ব্যবহার করো
        medicineName,
        mfgDate,
        expDate,
        manufacturerId: userId,
        status: "ACTIVE",
        totalStrips: quantity,
        currentStock: quantity,
        pricePerStrip: 0, // ডিফল্ট বা ইনপুট থেকে নিতে পারো
      },
    });

    const totalBoxes = Math.ceil(quantity / stripsPerBox);
    const totalCartons = Math.ceil(totalBoxes / boxesPerCarton);
    const unitsData = [];

    for (let c = 1; c <= totalCartons; c++) {
      const cartonId = `CTN-${batchId}-${c.toString().padStart(3, '0')}`;
      unitsData.push({ uid: cartonId, batchId, status: "IN_MANUFACTURER", history: JSON.stringify([]) });

      for (let b = 1; b <= boxesPerCarton; b++) {
        const globalBoxIndex = ((c - 1) * boxesPerCarton) + b;
        if (globalBoxIndex > totalBoxes) break;
        const boxId = `BOX-${batchId}-${globalBoxIndex.toString().padStart(3, '0')}`;
        unitsData.push({ uid: boxId, batchId, status: "IN_MANUFACTURER", history: JSON.stringify([]) });

        for (let s = 1; s <= stripsPerBox; s++) {
          const globalStripIndex = ((globalBoxIndex - 1) * stripsPerBox) + s;
          if (globalStripIndex > quantity) break;
          const stripId = `${batchId}-S${globalStripIndex.toString().padStart(4, '0')}`;
          unitsData.push({ uid: stripId, batchId, status: "IN_MANUFACTURER", history: JSON.stringify([]) });
        }
      }
    }

    await prisma.unit.createMany({ data: unitsData, skipDuplicates: true });

    return { 
      success: true, 
      message: `✅ Batch ${batchId} Created!`, 
      data: unitsData 
    };

  } catch (error: any) {
    console.error("Error:", error);
    return { success: false, message: "❌ Error: " + error.message };
  }
}