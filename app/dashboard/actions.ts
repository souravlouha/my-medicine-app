'use server'
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * ১. প্রোফাইল আপডেট লজিক
 * এটি ইউজার প্রোফাইলের লাইসেন্স, জিএসটি এবং কন্টাক্ট ডিটেইলস সেভ করবে।
 */
export async function updateFullProfileAction(userId: string, data: any) {
  try {
    if (!userId) return { success: false, message: "User ID is missing!" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: data.phone || "",
        location: data.location || "",
        fullAddress: data.fullAddress || "",
        licenseNo: data.licenseNo || "",
        gstNo: data.gstNo || "",
      }
    });
    
    // ডাটা আপডেট হওয়ার পর ড্যাশবোর্ডের সব পেজ রিফ্রেশ হবে
    revalidatePath("/dashboard", "layout");

    return { success: true, message: "✅ Profile verified and updated!" };
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return { success: false, message: "Update failed: " + error.message };
  }
}

/**
 * ২. মাস্টার ট্রান্সফার লজিক
 * এক ইউজার থেকে অন্য ইউজারের কাছে ওষুধ পাঠানোর মূল লজিক।
 */
export async function createTransferAction(formData: FormData, selectedUnits: string[]) {
  const fromId = formData.get("fromId") as string;
  const toCustomId = formData.get("toCustomId") as string; 
  const batchId = formData.get("batchId") as string;

  if (!selectedUnits.length) return { success: false, message: "No units selected!" };

  try {
    // প্রাপককে খুঁজে বের করা (customId দিয়ে)
    const receiver = await prisma.user.findUnique({
      where: { customId: toCustomId }
    });

    if (!receiver) return { success: false, message: "❌ Receiver not found! Please check ID." };

    const sender = await prisma.user.findUnique({ where: { id: fromId } });
    const invoiceNo = `INV-${Date.now()}-${sender?.customId || 'TRF'}`;

    // ট্রান্সফার লজিক (ট্রানজেকশন ব্যবহার করা হয়েছে যাতে মাঝপথে এরর হলে ডাটাবেস রোলব্যাক হয়)
    await prisma.$transaction(async (tx) => {
      // ১. ট্রান্সফার রেকর্ড তৈরি
      await tx.transfer.create({
        data: {
          batchId,
          fromId,
          toId: receiver.id,
          quantity: selectedUnits.length,
          invoiceNo,
          status: "PENDING"
        }
      });

      const timestamp = new Date().toISOString();
      const historyEntry = {
        from: sender?.name,
        fromId: sender?.customId,
        to: receiver.name,
        toId: receiver.customId,
        date: timestamp,
        status: "IN_TRANSIT"
      };

      // ২. প্রতিটি ইউনিটের মালিকানা এবং হিস্ট্রি আপডেট করা
      for (const uid of selectedUnits) {
        const unit = await tx.unit.findUnique({ where: { uid } });
        
        // হিস্ট্রি পার্স করা (JSON array হিসেবে হ্যান্ডেল করা)
        let currentHistory = [];
        try {
            currentHistory = typeof unit?.history === 'string' 
                ? JSON.parse(unit.history) 
                : (Array.isArray(unit?.history) ? unit.history : []);
        } catch (e) {
            currentHistory = [];
        }
        
        await tx.unit.update({
          where: { uid },
          data: {
            currentHolderId: receiver.id,
            status: "IN_TRANSIT",
            history: [...currentHistory, historyEntry] 
          }
        });
      }
    });

    revalidatePath("/dashboard", "layout");
    return { success: true, message: "✅ Transfer successful!", invoiceNo };
  } catch (error: any) {
    console.error("Transfer Error:", error);
    return { success: false, message: "Error: " + error.message };
  }
}