import { prisma } from "@/lib/prisma";

export async function createBatchWithStock(data: any) {
  try {
    // ১. ইনপুট ডাটাগুলো নিয়ে নিন
    const { 
      manufacturerId, 
      medicineName, 
      mfgDate, 
      expDate, 
      pricePerStrip, 
      totalStrips, 
      mrp 
    } = data;

    // ২. ট্রানজ্যাকশন শুরু
    const result = await prisma.$transaction(async (tx) => {
      
      // ২.১: ম্যানুফ্যাকচারার চেক করা
      const manufacturerExists = await tx.user.findUnique({
        where: { id: manufacturerId }
      });

      if (!manufacturerExists) {
        throw new Error(`Manufacturer not found with ID: ${manufacturerId}`);
      }

      // ২.২: প্রোডাক্ট খোঁজা অথবা তৈরি করা
      let product = await tx.product.findFirst({
        where: { 
            name: medicineName,
            manufacturerId: manufacturerId 
        }
      });

      // যদি প্রোডাক্ট না থাকে, তবে অটোমেটিক তৈরি করে নেব
      if (!product) {
        const pCount = await tx.product.count();
        product = await tx.product.create({
            data: {
                name: medicineName,
                productCode: `AUTO-${pCount + 1}`,
                genericName: medicineName,
                type: "TABLET", // ডিফল্ট Enum
                strength: "N/A",
                storageTemp: "Room Temp",
                basePrice: parseFloat(pricePerStrip || "0"),
                manufacturerId: manufacturerId
            }
        });
      }

      // ২.৩: ব্যাচ তৈরি করা
      const bCount = await tx.batch.count();
      const autoBatchNumber = `B-${Date.now().toString().slice(-6)}-${bCount}`;

      const newBatch = await tx.batch.create({
        data: {
          batchNumber: autoBatchNumber,
          productId: product.id,
          manufacturerId: manufacturerId,
          mrp: parseFloat(mrp),
          totalQuantity: parseInt(totalStrips),
          mfgDate: new Date(mfgDate),
          expDate: new Date(expDate),
        },
      });

      // ২.৪: ইনভেন্টরি আপডেট
      await tx.inventory.create({
        data: {
            userId: manufacturerId,
            batchId: newBatch.id,
            currentStock: parseInt(totalStrips)
        }
      });

      // ২.৫: ইউনিট ডাটা তৈরি করা
      const unitsData = Array.from({ length: parseInt(totalStrips) }).map(() => ({
        uid: `UNIT-${newBatch.id}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        batchId: newBatch.id,
        currentHandlerId: manufacturerId,
        type: "STRIP",  
        status: "CREATED", 
      }));

      // ইউনিট সেভ করা
      if (unitsData.length > 0) {
        // ✅ FIX: 'as any' ব্যবহার করা হলো টাইপ এরর এড়ানোর জন্য
        await tx.unit.createMany({
          data: unitsData as any, 
        });
      }

      return newBatch;
    });

    console.log("Success! Batch created:", result);
    return { success: true, data: result };

  } catch (error: any) {
    console.error("Database Upload Error:", error);
    return { success: false, error: error.message };
  }
}