"use client";

import Link from "next/link";
import Image from "next/image"; 
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-actions";
import { 
  LayoutDashboard, 
  Search, 
  Package, 
  Truck, 
  AlertTriangle, 
  ClipboardList, 
  LogOut, 
  ArrowDownLeft, 
  ShoppingCart,
  ShoppingBag,
  Boxes,
  ScanBarcode, 
  Printer 
} from "lucide-react";

export default function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  // রোল অনুযায়ী ড্যাশবোর্ড লিংক নির্ধারণ
  let dashboardLink = "/dashboard";
  if (userRole === "MANUFACTURER") dashboardLink = "/dashboard/manufacturer";
  else if (userRole === "DISTRIBUTOR") dashboardLink = "/dashboard/distributor";
  else if (userRole === "RETAILER") dashboardLink = "/dashboard/retailer";

  // ডায়নামিক রোল লেবেল লজিক
  const getRoleLabel = () => {
    if (userRole === "MANUFACTURER") return "Trusted Manufacturer";
    if (userRole === "DISTRIBUTOR") return "Authorized Distributor";
    if (userRole === "RETAILER") return "Registered Retailer";
    return "Guest User";
  };

  // একটিভ লিংক চেক করার ফাংশন
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-50 shadow-sm">
      
      {/* 1. Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <Link href={dashboardLink} className="flex items-center gap-4 group">
            <div className="relative h-16 w-16 min-w-[64px] rounded-full overflow-hidden shadow-md shadow-blue-100 border-2 border-white group-hover:scale-105 transition-transform duration-300">
               <Image 
                 src="/medtrace-logo.png" 
                 alt="MedTrace Logo"
                 fill
                 className="object-cover"
                 priority
               />
            </div>
            
            <div className="flex flex-col justify-center">
               <span className="text-2xl font-black text-gray-800 tracking-tight leading-none block">MedTrace</span>
               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full mt-1 w-fit">
                  {userRole}
               </span>
            </div>
        </Link>
        
        <p className="text-[10px] font-medium text-gray-400 mt-4 text-center border-t border-gray-50 pt-2">
            {getRoleLabel()}
        </p>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        
        {/* Dashboard Link */}
        <Link 
          href={dashboardLink} 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
            pathname === dashboardLink 
              ? "bg-blue-50 text-blue-700 shadow-sm" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </Link>

        {/* Common: Track Medicine */}
        <Link 
          href="/dashboard/track" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
            isActive("/dashboard/track") 
              ? "bg-blue-50 text-blue-700 shadow-sm" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Search size={20} /> Track Medicine
        </Link>

        {/* 🏭 MANUFACTURER LINKS */}
        {userRole === "MANUFACTURER" && (
           <>
             <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Production</div>
             
             <Link 
               href="/dashboard/manufacturer/catalog"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/manufacturer/catalog") ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`}
             >
               <Package size={20} /> Product Catalog
             </Link>

             <Link 
               href="/dashboard/manufacturer/production"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/manufacturer/production") ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`}
             >
               <Printer size={20} /> Production & Print
             </Link>

             <Link 
               href="/dashboard/manufacturer/create-batch"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/manufacturer/create-batch") ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`}
             >
               <ClipboardList size={20} /> Create Batch
             </Link>

             <Link 
               href="/dashboard/manufacturer/inventory"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/manufacturer/inventory") 
                   ? "bg-blue-50 text-blue-700 shadow-sm" 
                   : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`}
             >
               <Boxes size={20} /> My Inventory
             </Link>

             <Link 
               href="/dashboard/manufacturer/shipment"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/manufacturer/shipment") ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`}
             >
               <Truck size={20} /> Shipments
             </Link>

             <Link 
               href="/dashboard/manufacturer/orders"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/manufacturer/orders") ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`}
             >
               <ShoppingBag size={20} /> Sales Orders
             </Link>

             <Link 
               href="/dashboard/manufacturer/recall"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/manufacturer/recall") ? "bg-red-50 text-red-700 shadow-sm" : "text-gray-600 hover:bg-red-50 hover:text-red-700"
               }`}
             >
               <AlertTriangle size={20} /> Quality & Recall
             </Link>
           </>
        )}

        {/* 🚚 DISTRIBUTOR LINKS */}
        {userRole === "DISTRIBUTOR" && (
           <>
             <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Logistics</div>

             <Link 
               href="/dashboard/distributor/incoming"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/distributor/incoming") ? "bg-orange-50 text-orange-700 shadow-sm" : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
               }`}
             >
               <ArrowDownLeft size={20} /> Incoming Shipments
             </Link>

             <Link 
               href="/dashboard/distributor/inventory"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/distributor/inventory") ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`}
             >
               <Package size={20} /> My Inventory
             </Link>

             <Link 
               href="/dashboard/distributor/orders"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/distributor/orders") ? "bg-purple-50 text-purple-700 shadow-sm" : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
               }`}
             >
               <ShoppingCart size={20} /> Manage Orders
             </Link>
             
             <Link 
               href="/dashboard/distributor/shipment/create"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/distributor/shipment/create") ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-600 hover:bg-green-50 hover:text-green-700"
               }`}
             >
               <Truck size={20} /> Dispatch Stock
             </Link>

             <Link 
               href="/dashboard/distributor/recall"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/distributor/recall") ? "bg-red-50 text-red-700 shadow-sm" : "text-gray-600 hover:bg-red-50 hover:text-red-700"
               }`}
             >
               <AlertTriangle size={20} /> Quality & Recall
             </Link>
           </>
        )}

        {/* 🏪 RETAILER LINKS (UPDATED) */}
        {userRole === "RETAILER" && (
           <>
             <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Store Management</div>

             {/* 1. POS System */}
             <Link 
               href="/dashboard/retailer/pos"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/retailer/pos") ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
               }`}
             >
               <ScanBarcode size={20} /> POS Terminal
             </Link>

             {/* 2. Buy Medicine */}
             <Link 
               href="/dashboard/retailer/shop"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/retailer/shop") ? "bg-purple-50 text-purple-700 shadow-sm" : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
               }`}
             >
               <ShoppingBag size={20} /> Buy Medicine
             </Link>

             {/* 3. Shelf Inventory */}
             <Link 
               href="/dashboard/retailer/inventory"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/retailer/inventory") ? "bg-orange-50 text-orange-700 shadow-sm" : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
               }`}
             >
               <Package size={20} /> Shelf Inventory
             </Link>

             {/* 4. Incoming Shipments */}
             <Link 
               href="/dashboard/retailer/incoming"
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/retailer/incoming") ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
               }`}
             >
               <Truck size={20} /> Incoming Stock
             </Link>

             {/* ✅ 5. NEW: Quality & Recall Link */}
             <Link 
               href="/dashboard/retailer/recalls" // Ensure this matches your page path
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                 isActive("/dashboard/retailer/recalls") ? "bg-red-50 text-red-700 shadow-sm" : "text-gray-600 hover:bg-red-50 hover:text-red-700"
               }`}
             >
               <AlertTriangle size={20} /> Quality & Recall
             </Link>
           </>
        )}

      </nav>

      {/* 3. User Profile & Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
           <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
              {userRole[0]}
           </div>
           <div>
             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</p>
             <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{userRole}</p>
           </div>
        </div>
        
        <form action={logoutAction}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 py-2.5 rounded-xl transition font-bold text-sm border border-transparent hover:border-red-100">
            <LogOut size={16} /> Sign Out
          </button>
        </form>
      </div>

    </div>
  );
}