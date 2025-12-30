import { prisma } from "./prisma";

export async function generateCustomId(role: string) {
  // রোলের প্রথম ৩টি অক্ষর বড় হাতের অক্ষরে নেওয়া (MANUFACTURER -> MFG)
  const prefix = role.substring(0, 3).toUpperCase();
  
  // ওই রোলের শেষ ইউজারটি খুঁজে বের করা
  const lastUser = await prisma.user.findFirst({
    where: { role: role },
    orderBy: { createdAt: 'desc' },
    select: { customId: true }
  });

  let nextNumber = 101; // যদি কোনো ইউজার না থাকে তবে ১০১ থেকে শুরু হবে

  if (lastUser && lastUser.customId) {
    // আগের আইডি থেকে নাম্বারটি আলাদা করা (যেমন: MFG-105 থেকে 105 বের করা)
    const lastNumber = parseInt(lastUser.customId.split('-')[1]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${nextNumber}`;
}