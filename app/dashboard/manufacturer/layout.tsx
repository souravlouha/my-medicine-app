import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ManufacturerHeader from "@/components/ManufacturerHeader";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function ManufacturerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  let user = null;
  try {
    user = await prisma.user.findUnique({ where: { id: userId } });
  } catch (error) {
    console.error("Database connection error:", error);
  }

  if (!user || user.role !== "MANUFACTURER") redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#F8F9FD]">
      <aside className="w-72 bg-[#0D1B3E] text-white fixed h-full z-50 shadow-2xl no-print flex flex-col">
        <div className="p-8">
          <h2 className="font-black text-2xl tracking-tighter uppercase text-white">MedTrace</h2>
          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1 italic">Manufacturer Control</p>
        </div>
        <nav className="mt-6 px-4 space-y-2 flex-1">
          <SidebarLink href="/dashboard/manufacturer" label="Dashboard Overview" />
          <SidebarLink href="/dashboard/manufacturer/stock" label="Generate Medicine QR & ID" />
          <SidebarLink href="/dashboard/manufacturer/distributors" label="Manage Partners" />
          <SidebarLink href="/dashboard/manufacturer/dispatch" label="Shipment Logs" />
          <SidebarLink href="/dashboard/manufacturer/recall" label="Recall Batch" isRed />
        </nav>
        <div className="p-6 border-t border-white/5">
           <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10 print:ml-0 print:p-0">
        <div className="no-print">
           <ManufacturerHeader user={user as any} />
        </div>
        <div className="animate-in fade-in duration-1000">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, label, isRed = false }: { href: string; label: string; isRed?: boolean }) {
  return (
    <Link href={href} className={`block p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
      isRed ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}>
      {label}
    </Link>
  );
}