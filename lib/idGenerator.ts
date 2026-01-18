import { prisma } from "./prisma";
import { Role } from "@prisma/client"; // ✅ FIX: Role Enum ইম্পোর্ট করা হলো

export async function generateCustomId(role: string) {
  // রোলের প্রথম ৩টি অক্ষর বড় হাতের অক্ষরে নেওয়া (MANUFACTURER -> MAN, DISTRIBUTOR -> DIS)
  // তবে আমরা চাইলে ম্যানুয়ালি প্রিফিক্স ম্যাপ করতে পারি
  let prefix = role.substring(0, 3).toUpperCase();
  
  if (role === 'MANUFACTURER') prefix = 'MFG';
  if (role === 'DISTRIBUTOR') prefix = 'DIS';
  if (role === 'RETAILER') prefix = 'RET';

  // ওই রোলের শেষ ইউজারটি খুঁজে বের করা
  const lastUser = await prisma.user.findFirst({
    // ✅ FIX: 'as Role' ব্যবহার করে স্ট্রিং কে এনামে কনভার্ট করা হলো
    where: { role: role as Role },
    orderBy: { createdAt: 'desc' },
    select: { customId: true }
  });

  let nextNumber = 101; // যদি কোনো ইউজার না থাকে তবে ১০১ থেকে শুরু হবে

  if (lastUser && lastUser.customId) {
    // আগের আইডি থেকে নাম্বারটি আলাদা করা (যেমন: MFG-105 থেকে 105 বের করা)
    const parts = lastUser.customId.split('-');
    if (parts.length > 1) {
        const lastNumber = parseInt(parts[1]);
        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }
  }

  return `${prefix}-${nextNumber}`;
}