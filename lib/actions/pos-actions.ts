"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// টাইপ সেফটির জন্য ইন্টারফেস
interface CartItem {
  inventoryId: string | null; // ম্যানুয়াল আইটেমের জন্য null হতে পারে
  name: string;
  quantity: number;
  unitType: "STRIP" | "TABLET" | "UNIT"; 
  price: number;
  totalPrice: number;
  isManual?: boolean; // ✅ ম্যানুয়াল আইটেম ফ্ল্যাগ
}

export async function processRetailSale(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { success: false, error: "Unauthorized access" };

  // ১. কার্ট ডাটা রিসিভ করা
  const cartDataRaw = formData.get("cartData") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string);
  
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

  // ✅ সব রেকর্ডের জন্য একই সময় ব্যবহার করা হবে
  const transactionDate = new Date();

  try {
    // ২. ডাটাবেস ট্রানজ্যাকশন শুরু
    await prisma.$transaction(async (tx) => {

      // Seller name fetch inside tx for consistency
      const seller = await tx.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      const sellerName = seller?.name || "Retailer";
      
      // 🔄 লুপ: প্রতিটি আইটেম প্রসেস করা হবে
      for (const item of cartItems) {
          
          let batchIdToSave = null; // ডিফল্ট নাল (ম্যানুয়াল আইটেমের জন্য)

          // ---------------------------------------------------------
          // CASE A: REAL INVENTORY ITEM (স্টক চেক ও আপডেট হবে)
          // ---------------------------------------------------------
          if (!item.isManual && item.inventoryId) {
              
              // ১. ইনভেন্টরি ডাটা আনা
              const inventory = await tx.inventory.findUnique({
                where: { id: item.inventoryId },
                include: { batch: { include: { product: true } } }
              });

              if (!inventory) throw new Error(`Stock item not found for: ${item.name}`);

              // ব্যাচ আইডি সেট করা (Sales History এর জন্য)
              batchIdToSave = inventory.batchId;

              // ২. স্টক ভেরিয়েবল সেটআপ
              const tabletsPerStrip = inventory.batch.product.tabletsPerStrip || 1;
              let currentStripStock = inventory.currentStock; // Full Strip / Box / Unit
              let currentLooseStock = inventory.looseStock;   // Loose Tablets / Vials

              // ৩. স্টক ক্যালকুলেশন লজিক
              if (item.unitType === "STRIP" || item.unitType === "UNIT") {
                // --- পুরো পাতা বা ইউনিট বিক্রি ---
                if (currentStripStock < item.quantity) {
                  throw new Error(`Insufficient stock for ${item.name}! Available: ${currentStripStock} ${item.unitType === 'UNIT' ? 'Units' : 'Strips'}`);
                }
                currentStripStock -= item.quantity;
              } 
              else if (item.unitType === "TABLET") {
                // --- খুচরা ট্যাবলেট বিক্রি ---
                let needed = item.quantity;

                if (currentLooseStock >= needed) {
                  // লুজ স্টকে পর্যাপ্ত আছে
                  currentLooseStock -= needed;
                } else {
                  // লুজ স্টকে কম আছে, নতুন পাতা ভাঙতে হবে
                  needed -= currentLooseStock; 
                  currentLooseStock = 0; // যা ছিল সব নিলাম

                  // কতগুলো পাতা ভাঙতে হবে?
                  const stripsToBreak = Math.ceil(needed / tabletsPerStrip);

                  if (currentStripStock < stripsToBreak) {
                    throw new Error(`Not enough stock of ${item.name} to break! Need ${stripsToBreak} strips.`);
                  }

                  // পাতা ভাঙা হলো
                  currentStripStock -= stripsToBreak;
                  
                  // নতুন লুজ স্টক ক্যালকুলেশন
                  const newLooseTablets = (stripsToBreak * tabletsPerStrip) - needed;
                  currentLooseStock = newLooseTablets;
                }
              }

              // ৪. ডাটাবেসে ইনভেন্টরি আপডেট (Stock Update)
              await tx.inventory.update({
                where: { id: item.inventoryId },
                data: {
                  currentStock: currentStripStock,
                  looseStock: currentLooseStock
                }
              });
          }
          
          // ---------------------------------------------------------
          // CASE B: MANUAL ITEM (শুধু সেলস রেকর্ড হবে, স্টক আপডেট নেই)
          // ---------------------------------------------------------
          // এখানে কোনো 'continue' নেই, তাই কোড নিচে নামবে এবং Sales Record তৈরি করবে।

          // ৫. সেলস রেকর্ড তৈরি (সবার জন্য)
          await tx.salesRecord.create({
            data: {
              sellerId: userId,
              
              // ✅ Logic Update:
              // রিয়েল আইটেম হলে ব্যাচ আইডি যাবে
              // ম্যানুয়াল হলে null যাবে (এবং manualItemName এ নাম সেভ হবে)
              batchId: batchIdToSave, 
              manualItemName: item.isManual ? item.name : null, 
              
              quantity: item.quantity,
              // @ts-ignore: টাইপ মিসম্যাচ এড়ানোর জন্য
              unitType: item.unitType, 
              totalPrice: item.totalPrice, 
              buyerType: "CONSUMER",
              date: transactionDate,
            } as any
          });

          // ৬. BatchMovement তৈরি (Supply Chain Tree এর জন্য) — শুধু রিয়েল আইটেমের জন্য
          if (!item.isManual && batchIdToSave) {
            // Parent movement খুঁজে বের করা (Retailer-এর কাছে মালটি কোথা থেকে এসেছিল?)
            const parentMovement = await tx.batchMovement.findFirst({
              where: {
                batchId: batchIdToSave,
                receiverId: userId,
              },
              orderBy: { createdAt: "desc" },
            });

            await tx.batchMovement.create({
              data: {
                batchId: batchIdToSave,
                senderId: userId,
                receiverId: null, // Consumer-এর নির্দিষ্ট ID নেই
                senderName: sellerName,
                receiverName: "End Consumer",
                role: "CONSUMER",
                quantity: item.quantity,
                status: "SOLD_TO_CONSUMER",
                parentId: parentMovement ? parentMovement.id : null,
              },
            });
          }
      }
    });

    // ৩. রিফ্রেশ পাথ
    revalidatePath("/dashboard/retailer/pos");
    revalidatePath("/dashboard/retailer/sales");
    revalidatePath("/dashboard/retailer/inventory");
    revalidatePath("/dashboard/retailer");
    
    return { success: true, message: "✅ Sale Successful! Transaction Recorded." };

  } catch (error: any) {
    console.error("POS Transaction Error:", error);
    // সুন্দর এরর মেসেজ রিটার্ন করা
    return { success: false, error: error.message || "Transaction Failed. Please try again." };
  }
}