"use client";

import { useState } from "react";
import {
  Search, Package, Calendar, CheckCircle2, AlertTriangle,
  Truck, Building2, Store, AlertCircle, Activity, User,
  ChevronDown, ChevronRight, Box, ArrowRight, ShieldCheck, Clock,
  Factory, MapPin
} from "lucide-react";
import {
  getSupplyChainTreeAction,
  type SupplyChainNode,
  type SupplyChainTreeResult,
} from "@/lib/actions/track-actions";

// ====================================================
// TREE NODE COMPONENT (Recursive)
// ====================================================
function TreeNode({
  node,
  depth = 0,
  isLast = false,
}: {
  node: SupplyChainNode;
  depth?: number;
  isLast?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [stripsExpanded, setStripsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const hasStrips = node.strips && node.strips.length > 0;

  const roleConfig: Record<string, { bg: string; border: string; icon: any; text: string; badge: string }> = {
    MANUFACTURER: {
      bg: "bg-violet-50",
      border: "border-violet-200 hover:border-violet-400",
      icon: Factory,
      text: "text-violet-700",
      badge: "bg-violet-100 text-violet-700",
    },
    DISTRIBUTOR: {
      bg: "bg-blue-50",
      border: "border-blue-200 hover:border-blue-400",
      icon: Truck,
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
    },
    RETAILER: {
      bg: "bg-emerald-50",
      border: "border-emerald-200 hover:border-emerald-400",
      icon: Store,
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
    },
    CONSUMER: {
      bg: "bg-amber-50",
      border: "border-amber-200 hover:border-amber-400",
      icon: User,
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
    },
  };

  const config = roleConfig[node.role] || roleConfig.CONSUMER;
  const Icon = config.icon;

  return (
    <div className="relative">
      {depth > 0 && (
        <div className="absolute -top-4 left-6 w-0.5 h-4 bg-slate-200" />
      )}

      <div
        className={`${config.bg} border-2 ${config.border} rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer group`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl ${config.badge} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
            <Icon size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase tracking-widest ${config.text} opacity-70`}>
                {node.role}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                {node.quantity} Strips
              </span>
            </div>
            <h4 className="text-base md:text-lg font-bold text-slate-800 truncate mt-0.5">
              {node.name}
            </h4>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {node.location && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin size={11} /> {node.location}
                </span>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={11} />
                {new Date(node.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Strip UIDs Badge */}
            {hasStrips && (
              <button
                onClick={(e) => { e.stopPropagation(); setStripsExpanded(!stripsExpanded); }}
                className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${config.border} ${config.bg} hover:shadow-sm`}
              >
                <Box size={11} />
                {node.strips!.length} Strip UID{node.strips!.length > 1 ? "s" : ""} 
                <ChevronDown size={10} className={`transition-transform ${stripsExpanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>

          {hasChildren && (
            <div className={`h-8 w-8 rounded-lg ${config.badge} flex items-center justify-center transition-transform duration-300 ${expanded ? "rotate-0" : "-rotate-90"}`}>
              <ChevronDown size={16} />
            </div>
          )}
        </div>
      </div>

      {/* Expanded Strip UIDs List */}
      {hasStrips && stripsExpanded && (
        <div className={`mt-1 ml-4 mr-2 p-3 rounded-xl border ${config.border} ${config.bg} bg-opacity-50`}>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
            Strip UIDs held by {node.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {node.strips!.map((uid) => (
              <span
                key={uid}
                className="text-[10px] font-mono font-semibold bg-white/80 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {uid}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasChildren && expanded && (
        <div className="relative ml-6 md:ml-10 mt-2 space-y-3 pl-6 border-l-2 border-slate-200">
          <div className="absolute -left-[1px] top-0 w-4 h-0.5 bg-slate-200" />
          {node.children.map((child, index) => (
            <div key={child.id + index} className="relative">
              <div className="absolute -left-6 top-8 w-6 h-0.5 bg-slate-200" />
              <TreeNode node={child} depth={depth + 1} isLast={index === node.children.length - 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====================================================
// MAIN PAGE COMPONENT
// ====================================================
export default function InternalTrackingDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<SupplyChainTreeResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setTreeData(null);

    try {
      const res = await getSupplyChainTreeAction(searchQuery.trim());
      if (res.success) {
        setTreeData(res.data);
      } else {
        setError(res.error || "No data found for this batch.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const countNodes = (node: SupplyChainNode): number => {
    let count = 1;
    for (const c of node.children) count += countNodes(c);
    return count;
  };

  const countByRole = (node: SupplyChainNode, role: string): number => {
    let count = node.role === role ? 1 : 0;
    for (const c of node.children) count += countByRole(c, role);
    return count;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 md:p-8 rounded-[28px] shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -ml-12 -mb-12" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl">
                <Activity size={22} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Supply Chain Explorer</h1>
            </div>
            <p className="text-slate-300 text-sm max-w-xl">
              Enter a Batch Number or QR UID to see the complete supply chain tree — who manufactured, who distributed, and who received the medicine.
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Enter Batch No (e.g. B-2026...) or QR UID..."
              className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition font-medium text-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="absolute right-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-5 md:px-6 py-2.5 rounded-lg font-bold transition shadow-md"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-center gap-3 border border-red-100 animate-fade-in">
            <AlertCircle size={22} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="bg-white p-12 rounded-[28px] border border-slate-200 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Search size={28} className="text-indigo-400 animate-bounce" />
            </div>
            <p className="text-slate-500 font-bold">Tracing supply chain...</p>
          </div>
        )}

        {/* RESULT */}
        {treeData && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Product Info Card */}
            <div className="bg-white p-5 md:p-6 rounded-[24px] border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Package size={28} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900">
                      {treeData.product.name}
                      {treeData.product.strength && (
                        <span className="text-slate-400 font-bold ml-2 text-sm">{treeData.product.strength}</span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{treeData.batchNumber}</span>
                      <span className="text-xs text-slate-400">{treeData.product.type}</span>
                      {treeData.product.genericName && (
                        <span className="text-xs text-slate-400">({treeData.product.genericName})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {treeData.isRecalled && (
                    <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-1.5">
                      <AlertTriangle size={13} /> Recalled
                    </span>
                  )}
                  {treeData.isExpired && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-1.5">
                      <Clock size={13} /> Expired
                    </span>
                  )}
                  {!treeData.isRecalled && !treeData.isExpired && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-1.5">
                      <ShieldCheck size={13} /> Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Qty</p>
                  <p className="text-lg font-black text-slate-800">{treeData.totalQuantity.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">MRP</p>
                  <p className="text-lg font-black text-slate-800">{'\u20B9'}{treeData.mrp}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Mfg Date</p>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(treeData.mfgDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Exp Date</p>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(treeData.expDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Chain Nodes</p>
                  <p className="text-lg font-black text-slate-800">{countNodes(treeData.tree)}</p>
                </div>
              </div>

              {/* Role breakdown */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {countByRole(treeData.tree, "MANUFACTURER") > 0 && (
                  <span className="bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Factory size={12} /> {countByRole(treeData.tree, "MANUFACTURER")} Manufacturer
                  </span>
                )}
                {countByRole(treeData.tree, "DISTRIBUTOR") > 0 && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Truck size={12} /> {countByRole(treeData.tree, "DISTRIBUTOR")} Distributor{countByRole(treeData.tree, "DISTRIBUTOR") > 1 ? "s" : ""}
                  </span>
                )}
                {countByRole(treeData.tree, "RETAILER") > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Store size={12} /> {countByRole(treeData.tree, "RETAILER")} Retailer{countByRole(treeData.tree, "RETAILER") > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* SUPPLY CHAIN TREE */}
            <div className="bg-white p-5 md:p-6 rounded-[24px] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <ArrowRight size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Supply Chain Tree</h3>
                  <p className="text-xs text-slate-400">Visual hierarchy of medicine flow from manufacturer to end point</p>
                </div>
              </div>

              <div className="space-y-4">
                <TreeNode node={treeData.tree} />
              </div>

              {/* Legend */}
              <div className="mt-8 pt-5 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Legend</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="h-3 w-3 rounded bg-violet-400" /> <span>Manufacturer</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="h-3 w-3 rounded bg-blue-400" /> <span>Distributor</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="h-3 w-3 rounded bg-emerald-400" /> <span>Retailer</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="h-3 w-3 rounded bg-amber-400" /> <span>Consumer</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !treeData && !error && (
          <div className="bg-white p-10 md:p-16 rounded-[28px] border border-slate-200 text-center">
            <div className="max-w-sm mx-auto space-y-5">
              <div className="h-20 w-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
                <Box size={36} className="text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">Track a Batch</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Enter a batch number above to see the full supply chain tree — who made it, who distributed it, and where it ended up.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Factory size={12} className="text-violet-400" /> Manufacturer</span>
                <ArrowRight size={12} />
                <span className="flex items-center gap-1"><Truck size={12} className="text-blue-400" /> Distributor</span>
                <ArrowRight size={12} />
                <span className="flex items-center gap-1"><Store size={12} className="text-emerald-400" /> Retailer</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}