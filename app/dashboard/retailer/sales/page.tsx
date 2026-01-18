import { prisma } from "@/lib/prisma"; // ✅ Fix: db -> prisma
import { currentUser } from "@/lib/auth"; 
import { formatCurrency, formatDate } from "@/lib/formatters";
import { DollarSign, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function SalesHistoryPage() {
  const user = await currentUser();

  if (!user) return <div>Not authorized</div>;

  // ডাটাবেস থেকে সেলস হিস্ট্রি আনা (Prisma)
  const sales = await prisma.order.findMany({ // ✅ Fix
    where: { senderId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
        <div className="relative w-[300px]">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input placeholder="Search invoices..." className="pl-8" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
            </CardContent>
         </Card>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900 p-4">
         {sales.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">No sales found.</div>
         ) : (
             <div className="space-y-4">
                 {sales.map((sale) => (
                     <div key={sale.id} className="flex justify-between border-b pb-4 last:border-0">
                         <div>
                             <p className="font-medium">Order #{sale.orderId}</p>
                             <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
                         </div>
                         <div className="text-right">
                             <p className="font-bold text-green-600">{formatCurrency(sale.totalAmount)}</p>
                             <p className="text-xs">{sale.status}</p>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
}