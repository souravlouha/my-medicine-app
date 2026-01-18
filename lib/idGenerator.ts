import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export async function generateCustomId(role: string) {
  // রোলের প্রথম ৩টি অক্ষর বড় হাতের অক্ষরে নেওয়া
  let prefix = role.substring(0, 3).toUpperCase();
  
  if (role === 'MANUFACTURER') prefix = 'MFG';
  if (role === 'DISTRIBUTOR') prefix = 'DIS';
  if (role === 'RETAILER') prefix = 'RET';

  // ওই রোলের শেষ ইউজারটি খুঁজে বের করা
  const lastUser = await prisma.user.findFirst({
    where: { role: role as Role },
    orderBy: { createdAt: 'desc' },
    // ✅ FIX: 'customId' এর বদলে 'publicId' ব্যবহার করা হলো (স্কিমা অনুযায়ী)
    select: { publicId: true } 
  });

  let nextNumber = 101; // যদি কোনো ইউজার না থাকে তবে ১০১ থেকে শুরু হবে

  // ✅ FIX: এখানেও 'publicId' চেক করা হচ্ছে
  if (lastUser && lastUser.publicId) {
    // আগের আইডি থেকে নাম্বারটি আলাদা করা (যেমন: MFG-105 থেকে 105 বের করা)
    const parts = lastUser.publicId.split('-');
    if (parts.length > 1) {
        const lastNumber = parseInt(parts[1]);
        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }
  }

  return `${prefix}-${nextNumber}`;
}