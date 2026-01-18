import { prisma } from "@/lib/prisma";

export async function createBatchWithStock(data: any) {
  try {
    // ১. ইনপুট ডাটাগুলো নিয়ে নিন
    const { 
      manufacturerId, 
      medicineName, // এটি আমরা Product টেবিলে খুঁজব
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

      // ✅ FIX: ২.২: প্রোডাক্ট খোঁজা অথবা তৈরি করা (কারণ ব্যাচের জন্য productId লাগবে)
      let product = await tx.product.findFirst({
        where: { 
            name: medicineName,
            manufacturerId: manufacturerId 
        }
      });

      // যদি প্রোডাক্ট না থাকে, তবে অটোমেটিক তৈরি করে নেব (যাতে এরর না খায়)
      if (!product) {
        const pCount = await tx.product.count();
        product = await tx.product.create({
            data: {
                name: medicineName,
                productCode: `AUTO-${pCount + 1}`,
                genericName: medicineName, // ডিফল্ট
                type: "TABLET",            // ডিফল্ট
                strength: "N/A",
                storageTemp: "Room Temp",
                basePrice: parseFloat(pricePerStrip || "0"),
                manufacturerId: manufacturerId
            }
        });
      }

      // ✅ FIX: ২.৩: ব্যাচ তৈরি করা (সঠিক স্কিমা ফিল্ড ব্যবহার করে)
      const bCount = await tx.batch.count();
      const autoBatchNumber = `B-${Date.now().toString().slice(-6)}-${bCount}`;

      const newBatch = await tx.batch.create({
        data: {
          batchNumber: autoBatchNumber, // ব্যাচ নম্বর জেনারেট করা হলো
          productId: product.id,        // medicineName এর বদলে productId
          manufacturerId: manufacturerId,
          mrp: parseFloat(mrp),
          totalQuantity: parseInt(totalStrips), // totalStrips -> totalQuantity
          mfgDate: new Date(mfgDate),
          expDate: new Date(expDate),
        },
      });

      // ✅ FIX: ২.৪: ইনভেন্টরি আপডেট (স্টক ব্যাচ টেবিলে থাকে না, ইনভেন্টরিতে থাকে)
      await tx.inventory.create({
        data: {
            userId: manufacturerId,
            batchId: newBatch.id,
            currentStock: parseInt(totalStrips)
        }
      });

      // ২.৫: ইউনিট বা QR কোড ডাটা তৈরি করা (অপশনাল)
      const unitsData = Array.from({ length: parseInt(totalStrips) }).map(() => ({
        uid: `UNIT-${newBatch.id}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        batchId: newBatch.id,
        currentHandlerId: manufacturerId, // মালিকানা সেট করা হলো
        type: "STRIP", // টাইপ বলে দেওয়া হলো
        status: "CREATED",
      }));

      // ইউনিট সেভ করা
      if (unitsData.length > 0) {
        // @ts-ignore
        await tx.unit.createMany({
          data: unitsData,
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