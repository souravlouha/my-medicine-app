import { prisma as db } from "@/lib/prisma"; // 👈 ফিক্স: এখানেও prisma.ts ব্যবহার করতে হবে
import { auth } from "@/lib/auth"; // যদি এটাতেও এরর দেয়, তবে "../../../auth" দিয়ে ট্রাই করবেন
import { formatDate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export async function ActivityLog() {
  const session = await auth();
  if (!session?.user) return null;

  const logs = await db.activityLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <CardTitle>Activity Log</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Recent updates & actions</p>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] overflow-y-auto pr-2 space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-center text-gray-400 mt-10">No recent activity.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex flex-col border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{log.action}</span>
                    <span className="text-[10px] text-gray-500">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                </div>
              ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}