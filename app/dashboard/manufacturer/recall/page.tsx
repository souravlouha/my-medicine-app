import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import RecallButton from "./RecallButton"; // Client Component

export default async function RecallPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // সব ব্যাচ এবং তাদের রিকল স্ট্যাটাস নিয়ে আসা
  const batches = await prisma.batch.findMany({
    where: { manufacturerId: userId },
    include: { product: true, recalls: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. Pro Header */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quality Control</h1>
          <p className="text-gray-500 mt-1">Monitor batch quality and issue emergency recalls.</p>
        </div>
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2">
          <span>⚠️</span> Emergency Protocol Active
        </div>
      </div>

      {/* 2. Pro Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="p-5">Batch Details</th>
              <th className="p-5">Mfg / Exp Date</th>
              <th className="p-5">Quantity</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.map((batch) => {
              const isRecalled = batch.recalls.length > 0;
              
              return (
                <tr key={batch.id} className={`transition hover:bg-gray-50 ${isRecalled ? "bg-red-50/30" : ""}`}>
                  <td className="p-5">
                    <div className="font-bold text-gray-900 text-base">{batch.product.name}</div>
                    <div className="text-gray-500 font-mono text-xs mt-1">{batch.batchNumber}</div>
                  </td>
                  <td className="p-5 text-gray-600">
                    <div>M: {new Date(batch.mfgDate).toLocaleDateString()}</div>
                    <div className="text-red-400">E: {new Date(batch.expDate).toLocaleDateString()}</div>
                  </td>
                  <td className="p-5 font-medium text-gray-700">
                    {batch.totalQuantity.toLocaleString()} Units
                  </td>
                  <td className="p-5">
                    {isRecalled ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> RECALLED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span> ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    {!isRecalled && <RecallButton batchId={batch.id} batchNo={batch.batchNumber} />}
                    {isRecalled && <span className="text-xs text-red-600 font-bold">Reason: {batch.recalls[0].reason}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}