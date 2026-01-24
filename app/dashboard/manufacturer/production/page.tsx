"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // 🔥 ১. Link ইম্পোর্ট করা হলো
import { addOperator, getOperators, deleteOperator } from "@/lib/actions/team-actions";
import { UserPlus, Trash2, Users, Loader2, Search, BadgeCheck, Shield, RefreshCcw, KeyRound, ClipboardList, ArrowRight } from "lucide-react"; // 🔥 আইকন ইম্পোর্ট

export default function OperatorsPage() {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ১. টিম লোড করা
  async function loadTeam() {
    const res = await getOperators();
    if (res.success) setOperators(res.data);
    setLoading(false);
  }

  useEffect(() => {
    loadTeam();
  }, []);

  // ২. রিফ্রেশ হ্যান্ডলার
  async function handleRefresh() {
    setRefreshing(true);
    await loadTeam();
    setRefreshing(false);
  }

  // ৩. নতুন অপারেটর যোগ করা
  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsAdding(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const pin = formData.get("pin") as string;

    const res = await addOperator(formData);

    if (res.success) {
      await loadTeam();
      (e.target as HTMLFormElement).reset();
      alert(`✅ Operator "${name}" added successfully!\n\n🔑 PIN: ${pin}\n\nPlease share this PIN with the operator immediately.`);
    } else {
      alert("❌ Error: " + res.error);
    }
    setIsAdding(false);
  }

  // ৪. ডিলিট করা
  async function handleDelete(id: string) {
    if(!confirm("Are you sure you want to remove this operator? They will lose access immediately.")) return;
    await deleteOperator(id);
    loadTeam();
  }

  // ৫. সার্চ ফিল্টার
  const filteredOperators = operators.filter(op => 
    op.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Team Management</h1>
          <p className="text-slate-500 mt-1">Manage access for your production floor staff.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            {/* 🔥🔥🔥 ২. নতুন বাটন এখানে যোগ করা হয়েছে 🔥🔥🔥 */}
            <Link 
              href="/dashboard/manufacturer/production/assign"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95"
            >
              <ClipboardList size={20} />
              Assign Production
              <ArrowRight size={18} className="opacity-70"/>
            </Link>

            {/* Refresh Button */}
            <button 
                onClick={handleRefresh}
                className={`p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:shadow-sm transition ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh List"
            >
                <RefreshCcw size={20}/>
            </button>

            {/* Stats Card */}
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Users size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
                    <p className="text-xl font-bold text-slate-800">{operators.length}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* বাম পাশ: অপারেটর অ্যাড করার ফর্ম */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
            <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <UserPlus size={100} />
              </div>
              <h2 className="text-lg font-bold flex items-center gap-2 relative z-10">
                <UserPlus size={20} className="text-blue-400"/> Register New Operator
              </h2>
              <p className="text-slate-400 text-sm mt-1 relative z-10">Create a secure access account for machinery.</p>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleAdd} className="space-y-6">
                
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <input 
                        name="name" 
                        required 
                        placeholder="e.g. Rahul Das" 
                        className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition font-medium" 
                    />
                  </div>
                </div>
                
                {/* PIN Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                    Access PIN 
                    <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">
                        <KeyRound size={12}/> 4-6 DIGITS
                    </span>
                  </label>
                  <input 
                    name="pin" 
                    type="text" 
                    required 
                    placeholder="••••" 
                    maxLength={6} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition font-mono text-xl tracking-[0.3em] text-center text-slate-800" 
                  />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The operator will use this PIN to log in. <br/>
                    <span className="text-amber-500 font-medium">⚠️ Make sure to note it down.</span>
                  </p>
                </div>

                <button 
                  disabled={isAdding} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isAdding ? <Loader2 className="animate-spin"/> : "Create Operator Account"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ডান পাশ: অপারেটর লিস্ট */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* সার্চ বার */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center focus-within:ring-2 focus-within:ring-blue-100 transition">
            <Search className="ml-4 text-slate-400" size={20}/>
            <input 
              type="text" 
              placeholder="Search operators by name..." 
              className="w-full p-3 outline-none text-slate-700 placeholder:text-slate-400 font-medium bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Operator Profile</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Added</th>
                  <th className="p-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-600"/></td></tr>
                ) : filteredOperators.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Users size={32}/>
                      </div>
                      <h3 className="text-slate-800 font-bold mb-1">No operators found</h3>
                      <p className="text-slate-400 text-sm">Add your first team member using the form.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOperators.map((op) => (
                    <tr key={op.id} className="group hover:bg-blue-50/30 transition duration-200">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md uppercase">
                            {op.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-blue-700 transition">{op.name}</div>
                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                               <Shield size={10}/> {op.email.split('@')[0]}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                          <BadgeCheck size={12} strokeWidth={3}/> ACTIVE
                        </span>
                      </td>
                      <td className="p-5 text-sm font-medium text-slate-500">
                        {new Date(op.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleDelete(op.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove Operator"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}