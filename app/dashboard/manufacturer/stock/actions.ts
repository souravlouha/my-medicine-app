"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ১. ক্যাটালগ সেভ ফাংশন (Catalog Save Function)
export async function upsertMedicineCatalog(data: { name: string, details: string, code: string, price: number }) {
  try {
    const activeUser = await prisma.user.findFirst();
    if (!activeUser) return { success: false, error: "No User Found" };

    // ক্যাটালগ তৈরি বা আপডেট
    await prisma.batch.create({
      data: {
        manufacturerId: activeUser.id,
        medicineName: `${data.name} | ${data.code} | ${data.details}`,
        totalStrips: 0,
        currentStock: 0, 
        mfgDate: new Date(),
        expDate: new Date(),
        pricePerStrip: Number(data.price || 0),
        status: "CATALOG_ENTRY" // ক্যাটালগ আইটেম হিসেবে মার্ক করার জন্য
      }
    });
    revalidatePath("/dashboard/manufacturer/stock");
    return { success: true };
  } catch (error: any) {
    console.error("Catalog Error:", error);
    return { success: false, error: error.message };
  }
}

// ২. ক্যাটালগ ডিলিট ফাংশন (Delete Catalog Item)
export async function deleteCatalogItem(id: string) {
  try {
    // ব্যাচ ডিলিট করা
    await prisma.batch.delete({
      where: { id }
    });
    revalidatePath("/dashboard/manufacturer/stock");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: "Could not delete item. It might have linked units." };
  }
}

// ৩. প্রোডাকশন ব্যাচ সেভ ফাংশন (Save Production Batch - FIXED)
export async function saveProductionBatch(formData: any, cartons: any[]) {
  try {
    const activeUser = await prisma.user.findFirst();
    if (!activeUser) return { success: false, error: "System User Not Found" };

    const totalQty = Number(formData.cartonCount) * Number(formData.boxesPerCarton) * Number(formData.stripsPerBox);
    
    // DATE FIX LOGIC
    const fixedMfgDate = new Date(formData.mfgDate + "T12:00:00Z");
    const fixedExpDate = formData.expDate 
      ? new Date(formData.expDate + "T12:00:00Z") 
      : new Date(new Date().setFullYear(new Date().getFullYear() + 2));

    // --- TRANSACTION START ---
    await prisma.$transaction(async (tx) => {
      
      // ১. ব্যাচ তৈরি
      const batch = await tx.batch.create({
        data: {
          manufacturerId: activeUser.id,
          medicineName: `${formData.medicineName} (${formData.medicineId})`,
          totalStrips: totalQty,
          currentStock: totalQty, 
          mfgDate: fixedMfgDate,
          expDate: fixedExpDate,
          pricePerStrip: Number(formData.pricePerStrip || 0),
          status: "ACTIVE", 
        },
      });

      console.log("✅ Batch Created ID:", batch.id);

      // ২. ইউনিট (Strips) তৈরি
      const allStrips = [];
      for (const carton of cartons) {
        for (const box of carton.boxes) {
          for (const strip of box.strips) {
            allStrips.push({
              uid: String(strip.id), // 🔥 FIXED: 'id' কে বদলে 'uid' করা হয়েছে (Schema অনুযায়ী)
              batchId: batch.id,
              status: "IN_MANUFACTURER", // শুরুতে স্ট্যাটাস ফ্যাক্টরিতে থাকবে
            });
          }
        }
      }

      if (allStrips.length > 0) {
        await tx.unit.createMany({
          data: allStrips,
          skipDuplicates: true,
        });
      }
    });
    // --- TRANSACTION END ---

    revalidatePath("/dashboard/manufacturer");
    revalidatePath("/dashboard/manufacturer/stock");
    
    return { success: true };

  } catch (error: any) {
    console.error("❌ DB ERROR:", error);
    return { success: false, error: "DB Error: " + error.message };
  }
}