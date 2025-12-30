import Link from "next/link";

// Icons for Sidebar
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Truck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h12a1 1 0 001-1v-2.5M6 7H4v10h2V7z" /></svg>,
  Qr: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 6h2v2H6V6zm0 12h2v2H6v-2zm12-12h2v2h-2V6z" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans">
      {/* FIXED SIDEBAR */}
      <aside className="w-64 bg-[#0B1120] text-white fixed h-full flex flex-col z-50 shadow-2xl">
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-gray-800">
           <div>
             <h1 className="text-2xl font-black tracking-tighter text-white">MEDTRACE</h1>
             <p className="text-[9px] text-blue-400 font-bold tracking-widest uppercase mt-1">Distributor Panel</p>
           </div>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Main Menu</p>
          
          <Link href="/dashboard/distributor" className="flex items-center gap-3 px-4 py-3.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <span className="group-hover:text-blue-400 transition-colors"><Icons.Home /></span> Dashboard
          </Link>

          <Link href="/dashboard/distributor/incoming" className="flex items-center gap-3 px-4 py-3.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <span className="group-hover:text-blue-400 transition-colors"><Icons.Truck /></span> Incoming Shipments
          </Link>

          <Link href="/dashboard/distributor/dispatch" className="flex items-center gap-3 px-4 py-3.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <span className="group-hover:text-blue-400 transition-colors"><Icons.Qr /></span> Dispatch Retailer
          </Link>

          <div className="pt-4 pb-2">
             <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Alerts</p>
             <Link href="/dashboard/distributor/recall" className="flex items-center gap-3 px-4 py-3.5 text-xs font-bold text-red-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all">
               <Icons.Alert /> Recall Alerts
             </Link>
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-800">
           <button className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white bg-[#1E293B] hover:bg-red-600/20 rounded-xl transition-all">
              <Icons.Logout /> Sign Out
           </button>
        </div>
      </aside>

      {/* CONTENT WRAPPER */}
      <main className="ml-64 w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}