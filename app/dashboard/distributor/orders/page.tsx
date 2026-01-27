import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrdersView from "./OrdersView"; // ✅ ক্লায়েন্ট কম্পোনেন্ট ইম্পোর্ট

export default async function ManageOrdersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // ১. ডাটা ফেচিং (Logic Unchanged)
  const [sentOrders, receivedOrders] = await Promise.all([
    // A. আমি যা অর্ডার করেছি (Outgoing)
    prisma.order.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: { 
        receiver: { select: { name: true } }, 
        items: { include: { product: { select: { name: true, strength: true } } } }
      }
    }),

    // B. রিটেইলাররা যা অর্ডার করেছে (Incoming)
    prisma.order.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: { 
        sender: { select: { name: true } }, 
        items: { include: { product: { select: { name: true, strength: true } } } }
      }
    })
  ]);

  // Client Component এ ডাটা পাস করা
  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-10 bg-slate-50 min-h-screen">
       <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500">Track incoming retailer requests and your stock purchases.</p>
       </div>
       
       <OrdersView 
          sentOrders={sentOrders} 
          receivedOrders={receivedOrders} 
       />
    </div>
  );
}