import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import ProfileForm from "./ProfileForm"; 

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return <div className="p-10 text-center font-black uppercase text-red-500">Access Denied: Please Login</div>;

  // ডাটাবেস থেকে ইউজার আনা
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return <div className="p-10 text-center font-black">User Not Found In Database</div>;

  // TypeScript Error এড়ানোর জন্য 'any' ব্যবহার করা হলো
  const profileUser = user as any;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-10 font-sans relative">
      
      {/* 🔥 WATERMARK BACKGROUND (Medical Pattern) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230D1B3E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* --- PRO HEADER CARD --- */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden relative group">
          
          {/* Gradient Banner */}
          <div className="h-40 bg-gradient-to-r from-[#0D1B3E] via-blue-900 to-[#0D1B3E] relative">
            <div className="absolute top-6 right-8">
              <span className="bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-lg">
                {profileUser.role} ACCOUNT
              </span>
            </div>
          </div>

          <div className="px-10 pb-10 flex flex-col sm:flex-row items-center sm:items-end -mt-16 gap-6">
            
            {/* Avatar with Verified Tick */}
            <div className="relative">
              <div className="w-32 h-32 bg-white p-1 rounded-[2.5rem] shadow-xl">
                 <div className="w-full h-full bg-[#0D1B3E] rounded-[2rem] flex items-center justify-center text-white text-5xl font-black uppercase">
                    {profileUser.name.charAt(0)}
                 </div>
              </div>
              {/* ✅ BLUE VERIFIED TICK (X Style) */}
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md" title="Verified ID">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.498 4.491 4.491 0 013.497-1.307zm4.45 7.54l3.22-3.22a.75.75 0 011.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-1.75-1.75a.75.75 0 111.06-1.06l1.22 1.22z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Name & ID */}
            <div className="text-center sm:text-left mb-2">
              <h1 className="text-4xl font-black text-[#0D1B3E] tracking-tighter uppercase flex items-center gap-2">
                {profileUser.name}
              </h1>
              <p className="text-blue-500 text-xs font-black tracking-widest uppercase mt-1 bg-blue-50 inline-block px-3 py-1 rounded-lg">
                System ID: {profileUser.customId || "N/A"}
              </p>
            </div>

          </div>
        </div>

        {/* --- FORM SECTION --- */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative">
          <div className="mb-12 border-b border-gray-100 pb-8">
            <h3 className="text-xl font-black text-[#0D1B3E] uppercase tracking-tight flex items-center gap-3">
              <span className="text-2xl">📝</span> Edit Business Profile
            </h3>
            <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-wide ml-10">
              Manage your official contact details & license info
            </p>
          </div>
          
          {/* Client Component Load হচ্ছে */}
          <ProfileForm user={JSON.parse(JSON.stringify(profileUser))} />
        </div>

      </div>
    </div>
  );
}