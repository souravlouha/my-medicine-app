"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// টাইপ সেফটির জন্য ইন্টারফেস (লজিক বোঝার সুবিধার্থে)
interface CartItem {
  inventoryId: string;
  name: string;
  quantity: number;
  unitType: "STRIP" | "TABLET" | "UNIT"; // 'UNIT' for Syrup/Injection
  price: number;
  totalPrice: number;
}

export async function processRetailSale(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { success: false, error: "Unauthorized" };

  // ১. কার্ট ডাটা রিসিভ করা (JSON String হিসেবে)
  const cartDataRaw = formData.get("cartData") as string;
  
  if (!cartDataRaw) {
      return { success: false, error: "Cart is empty or invalid data!" };
  }

  let cartItems: CartItem[] = [];
  try {
    cartItems = JSON.parse(cartDataRaw);
  } catch (e) {
    return { success: false, error: "Invalid cart data format." };
  }

  if (cartItems.length === 0) {
    return { success: false, error: "No items to sell." };
  }

  try {
    // ২. ডাটাবেস ট্রানজ্যাকশন (সব আইটেম একসাথে প্রসেস হবে)
    await prisma.$transaction(async (tx) => {
      
      // 🔄 লুপ: কার্টের প্রতিটি আইটেমের জন্য
      for (const item of cartItems) {
          
          // A. ইনভেন্টরি চেক
          const inventory = await tx.inventory.findUnique({
            where: { id: item.inventoryId },
            include: { batch: { include: { product: true } } }
          });

          if (!inventory) throw new Error(`Stock item not found for: ${item.name}`);

          // ভেরিয়েবল সেটআপ
          const tabletsPerStrip = inventory.batch.product.tabletsPerStrip || 1;
          let currentStripStock = inventory.currentStock; // Full Strip / Box / Unit
          let currentLooseStock = inventory.looseStock;   // Loose Tablets / Vials

          // B. স্টক ক্যালকুলেশন লজিক (Legacy Logic Preserved 🧠)
          
          if (item.unitType === "STRIP" || item.unitType === "UNIT") {
            // কেস ১: পুরো পাতা বা বোতল বিক্রি
            if (currentStripStock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.name}! Available: ${currentStripStock} ${item.unitType === 'UNIT' ? 'Units' : 'Strips'}`);
            }
            currentStripStock -= item.quantity;
          } 
          else if (item.unitType === "TABLET") {
            // কেস ২: খুচরা ট্যাবলেট বা ভায়াল বিক্রি
            let needed = item.quantity;

            if (currentLooseStock >= needed) {
              // লুজ স্টকে পর্যাপ্ত আছে
              currentLooseStock -= needed;
            } else {
              // লুজ স্টকে কম আছে, স্ট্রিপ ভাঙতে হবে
              needed -= currentLooseStock; 
              currentLooseStock = 0; // যা ছিল সব নিলাম

              // কতগুলো স্ট্রিপ ভাঙতে হবে?
              const stripsToBreak = Math.ceil(needed / tabletsPerStrip);

              if (currentStripStock < stripsToBreak) {
                throw new Error(`Not enough stock of ${item.name} to break! Need ${stripsToBreak} strips/boxes.`);
              }

              // স্ট্রিপ ভাঙা হলো
              currentStripStock -= stripsToBreak;
              
              // নতুন লুজ স্টক ক্যালকুলেশন
              // (যতগুলো ভাঙলাম * প্রতিটিতে কয়টি) - (কাস্টমারকে যা দিলাম)
              const newLooseTablets = (stripsToBreak * tabletsPerStrip) - needed;
              currentLooseStock = newLooseTablets;
            }
          }

          // C. ইনভেন্টরি আপডেট (Stock Update)
          await tx.inventory.update({
            where: { id: item.inventoryId },
            data: {
              currentStock: currentStripStock,
              looseStock: currentLooseStock
            }
          });

          // D. সেলস রেকর্ড তৈরি (Individual Record for each item)
          await tx.salesRecord.create({
            data: {
              sellerId: userId,
              batchId: inventory.batchId,
              quantity: item.quantity,
              // @ts-ignore: Enum matching is safe here
              unitType: item.unitType, 
              totalPrice: item.totalPrice, // Individual item total
              buyerType: "CONSUMER",
              date: new Date()
            }
          });
      }
    });

    // ৩. রিফ্রেশ পাথ
    revalidatePath("/dashboard/retailer/pos");
    revalidatePath("/dashboard/retailer/sales");
    revalidatePath("/dashboard/retailer");
    
    return { success: true, message: "✅ Sale Successful! All items processed." };

  } catch (error: any) {
    console.error("POS Transaction Error:", error);
    // এরর মেসেজটি ফ্রন্টএন্ডে পাঠানো হচ্ছে যাতে ইউজার বুঝতে পারে কোন আইটেমে সমস্যা
    return { success: false, error: error.message || "Transaction Failed" };
  }
}