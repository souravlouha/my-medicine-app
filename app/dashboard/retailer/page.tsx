import { currentUser } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma"; 
import { formatCurrency } from "@/lib/formatters";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CreditCard, TrendingUp, Store, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RetailerDashboard() {
  // ✅ FIX: 'as any' ব্যবহার করা হলো যাতে shopName এবং licenseNumber অ্যাক্সেস করা যায়
  const user = await currentUser() as any;

  // ডাটাবেস থেকে ডাটা আনা (সেফটি চেক সহ)
  const salesCount = await db.order.count({ 
    where: { senderId: user?.id } 
  }).catch(() => 0);
  
  const inventoryCount = await db.inventory.count({
    where: { userId: user?.id }
  }).catch(() => 0);

  // ডামি ডাটা
  const totalRevenue = 0; 
  const totalProfit = 0;
  const assetValue = 0;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Retail Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center justify-end gap-1">
               <Store className="w-3 h-3" /> {user?.shopName || "My Pharmacy"}
            </p>
            <p className="text-xs text-gray-500">
              License: {user?.licenseNumber || "Pending"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
             {user?.name?.[0]?.toUpperCase() || "R"}
          </div>
          <Link href="/dashboard/retailer/pos">
            <Button size="sm" className="ml-2 bg-blue-600 hover:bg-blue-700 text-white">
              <ShoppingCart className="mr-2 h-4 w-4" /> New Sale (POS)
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-blue-200 mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-green-600 font-medium mt-1">~25% Margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(assetValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Locked Assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Batches in stock</p>
          </CardContent>
        </Card>
      </div>

      {/* CHART & ACTIVITY LOG */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-md border border-dashed">
                <p>Chart Data Loading...</p>
             </div>
          </CardContent>
        </Card>
        <ActivityLog />
      </div>
    </div>
  );
}