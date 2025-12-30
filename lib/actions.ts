import { prisma } from "@/lib/prisma"; // আপনার প্রিজমা ক্লায়েন্ট ইম্পোর্ট পাথ ঠিক করুন

export async function createBatchWithStock(data: any) {
  try {
    // ১. ইনপুট ডাটাগুলো নিয়ে নিন
    const { 
      manufacturerId, 
      medicineName, 
      mfgDate, 
      expDate, 
      pricePerStrip, 
      totalStrips, 
      mrp 
    } = data;

    // ২. ট্রানজ্যাকশন শুরু (সব কাজ একসাথে হবে, অথবা কিছুই হবে না)
    const result = await prisma.$transaction(async (tx) => {
      
      // স্টেপ ২.১: ম্যানুফ্যাকচারার বা ইউজার চেক করা
      // আমরা প্রথমে চেক করছি এই আইডির ইউজার আসলেই আছে কিনা
      const manufacturerExists = await tx.user.findUnique({
        where: { id: manufacturerId }
      });

      if (!manufacturerExists) {
        throw new Error(`Manufacturer not found with ID: ${manufacturerId}. Please check the User table.`);
      }

      // স্টেপ ২.২: ব্যাচ তৈরি করা
      const newBatch = await tx.batch.create({
        data: {
          medicineName,
          mfgDate: new Date(mfgDate),
          expDate: new Date(expDate),
          pricePerStrip: parseFloat(pricePerStrip),
          mrp: parseFloat(mrp),
          totalStrips: parseInt(totalStrips),
          currentStock: parseInt(totalStrips), // শুরুতে স্টক = টোটাল স্ট্রিপস
          manufacturerId: manufacturerId, // এখানে রিলেশন তৈরি হচ্ছে
        },
      });

      // স্টেপ ২.৩: ইউনিট বা QR কোড ডাটা তৈরি করা (অপশনাল)
      // যদি প্রতিটা স্ট্রিপের জন্য আলাদা QR/Unit দরকার হয়
      const unitsData = Array.from({ length: parseInt(totalStrips) }).map(() => ({
        uid: `UNIT-${newBatch.id}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, // ইউনিক আইডি
        batchId: newBatch.id,
        status: "IN_MANUFACTURER",
      }));

      // অনেকগুলো ইউনিট একসাথে ডাটাবেসে ঢুকানো
      if (unitsData.length > 0) {
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
    
    // এরর মেসেজ ক্লিন করে রিটার্ন করা
    if (error.code === 'P2025') {
      return { success: false, error: "Manufacturer ID did not match any User in the database." };
    }
    return { success: false, error: error.message };
  }
}