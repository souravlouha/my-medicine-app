"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ১. ব্যাচ খোঁজার ফাংশন (With Debugging)
export async function getAvailableBatches() {
  const session = await auth();
  const userId = session?.user?.id;

  console.log("🔍 Checking Session User ID:", userId);

  if (!userId) {
    return { batches: [], debugInfo: "NO_SESSION_FOUND" };
  }

  try {
    const batches = await prisma.batch.findMany({
      where: {
        manufacturerId: userId,
      },
      select: {
        id: true,
        batchNumber: true,
        totalQuantity: true,
        product: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${batches.length} batches for User: ${userId}`);
    return { batches: batches, debugInfo: userId };

  } catch (error) {
    console.error("❌ Database Error:", error);
    return { batches: [], debugInfo: "DB_ERROR" };
  }
}

// ✅ ২. নতুন জব তৈরি (UPDATED: Time Limit & Operator)
export async function createPrintJob(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const batchId = formData.get("batchId") as string;
  const targetQty = parseInt(formData.get("targetQty") as string);
  const machineName = formData.get("machineName") as string;
  const operatorId = formData.get("operatorId") as string;
  const validityHours = parseInt(formData.get("validity") as string) || 8; 

  if (!batchId || !targetQty) return { success: false as const, error: "Invalid Data" };

  try {
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    const jobId = `JOB-${Date.now().toString().slice(-6)}`;

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + validityHours);

    await prisma.printJob.create({
      data: {
        jobId,
        batchId,
        machineName,
        targetQuantity: targetQty,
        accessCode,
        operatorId: operatorId || null, 
        accessExpiresAt: expiryDate,
        status: "PENDING"
      }
    });

    revalidatePath("/dashboard/manufacturer/production/assign");
    return { success: true as const, code: accessCode };
  } catch (error) {
    console.error(error);
    return { success: false as const, error: "Failed to create job" };
  }
}

// ✅ ৩. Get All Print Jobs
export async function getPrintJobs() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: [] };

  try {
    const jobs = await prisma.printJob.findMany({
      where: {
        batch: { manufacturerId: session.user.id }
      },
      include: {
        batch: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: jobs };
  } catch (error) {
    console.error("Fetch Jobs Error:", error);
    return { success: false, data: [] };
  }
}

// ✅ ৪. Verify Operator Access Code
export async function verifyOperatorCode(code: string) {
  try {
    const job = await prisma.printJob.findUnique({
      where: { accessCode: code },
      include: {
        batch: { include: { product: true } }
      }
    });

    if (!job) return { success: false, error: "Invalid Access Code" };
    if (job.status === "COMPLETED") return { success: false, error: "This job is already completed." };
    if (job.accessExpiresAt && new Date() > new Date(job.accessExpiresAt)) {
      return { success: false, error: "Access Code Expired!" };
    }

    return { success: true, job };
  } catch (error) {
    return { success: false, error: "Verification Failed" };
  }
}

// ✅ ৫. অপারেটরের জন্য জবের ডিটেইলস আনা
export async function getJobDetails(code: string) {
  try {
    const job = await prisma.printJob.findUnique({
      where: { accessCode: code },
      include: {
        batch: {
          include: { 
            product: true,
            units: {
              where: { status: "CREATED" },
              take: 100
            }
          } 
        }
      }
    });
    if (!job) return { success: false, error: "Job not found" };
    return { success: true, job };
  } catch (error) {
    return { success: false, error: "Database Error" };
  }
}

// ✅ ৬. প্রিন্ট আপডেট করা
export async function updatePrintProgress(jobId: string, printedCount: number) {
  try {
    await prisma.printJob.update({
      where: { id: jobId },
      data: { printedQuantity: printedCount }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ✅ ৭. সব অ্যাক্টিভ জব নিয়ে আসা
export async function getActiveJobs() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: [] };

  try {
    const jobs = await prisma.printJob.findMany({
      where: {
        batch: { manufacturerId: session.user.id },
        status: { not: "COMPLETED" } 
      },
      include: {
        batch: { select: { batchNumber: true, product: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: jobs };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// ✅ ৮. জবের স্ট্যাটাস চেঞ্জ করা (Pause / Resume / Cancel)
export async function toggleJobStatus(jobId: string, action: 'PAUSE' | 'RESUME' | 'CANCEL') {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    let newStatus = "";
    if (action === 'PAUSE') newStatus = "PAUSED";
    else if (action === 'RESUME') newStatus = "PENDING";
    else if (action === 'CANCEL') newStatus = "CANCELLED";

    await prisma.printJob.update({
      where: { id: jobId },
      data: { status: newStatus }
    });

    revalidatePath("/dashboard/manufacturer/production/assign");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

// ✅ ৯. অপারেটরের আগের কাজের ইতিহাস (History) আনা
export async function getOperatorHistory(operatorId: string) {
  try {
    const history = await prisma.printJob.findMany({
      where: {
        operatorId: operatorId,
        status: "COMPLETED"
      },
      include: {
        batch: { include: { product: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5 
    });
    return { success: true, data: history };
  } catch (error) {
    console.error("Fetch Operator History Error:", error);
    return { success: false, data: [] };
  }
}

// ✅ ১০. প্রিন্ট জব সম্পন্ন করা (Confirm & Finish)
export async function completePrintJob(jobId: string) {
  try {
    await prisma.printJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED" }
    });
    revalidatePath("/dashboard/manufacturer/production");
    return { success: true };
  } catch (error) {
    console.error("Complete Job Error:", error);
    return { success: false };
  }
}