"use client";

import { useState } from "react";
import { getTrackingHistoryAction } from "@/lib/actions/track-actions";
import type { TrackingResult, TimelineEvent } from "@/lib/actions/track-actions";
import {
  Search,
  Package,
  Truck,
  Store,
  Factory,
  ShoppingBag,
  MapPin,
  Calendar,
  Hash,
  Users,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Loader2,
  ArrowLeft,
  Copy,
  CheckCircle2,
  XCircle,
  BarChart3,
  ChevronRight,
  History,
} from "lucide-react";

// ─── Role colour helpers ────────────────────────────────────────────────────
const ROLE_STYLES: Record<
  string,
  { dot: string; badge: string; icon: React.ElementType }
> = {
  MANUFACTURER: {
    dot: "bg-violet-600",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    icon: Factory,
  },
  DISTRIBUTOR: {
    dot: "bg-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
  },
  RETAILER: {
    dot: "bg-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Store,
  },
  CONSUMER: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: ShoppingBag,
  },
};

const DEFAULT_UNIT_TYPE = "BATCH" as const;

function getRoleStyle(role: string) {
  return (
    ROLE_STYLES[role?.toUpperCase()] ?? {
      dot: "bg-slate-400",
      badge: "bg-slate-50 text-slate-600 border-slate-200",
      icon: Package,
    }
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────
interface RecentBatch {
  id: string;
  batchNumber: string;
  product: { name: string; type: string };
}

interface Props {
  recentBatches: RecentBatch[];
}

// ─── Timeline node ──────────────────────────────────────────────────────────
function TimelineNode({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  const style = getRoleStyle(event.role);
  const Icon = style.icon;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full ${style.dot} flex items-center justify-center flex-shrink-0 shadow-md`}
        >
          <Icon size={18} className="text-white" />
        </div>
        {!isLast && (
          <div className="w-0.5 bg-gradient-to-b from-slate-300 to-slate-100 flex-1 mt-1 min-h-[2rem]" />
        )}
      </div>

      <div className="pb-8 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">
              {event.event}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {event.actor}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${style.badge}`}
          >
            {event.status}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {event.location && event.location !== "N/A" && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {event.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(event.date).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Package size={11} />
            {event.quantity.toLocaleString()} units
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TrackClient({ recentBatches }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setQuery(searchTerm);

    const res = await getTrackingHistoryAction(searchTerm.trim());
    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = result ? new Date() > new Date(result.expDate) : false;
  const totalInCirculation = result?.currentHolders.reduce(
    (s, h) => s + h.stock,
    0
  ) ?? 0;

  return (
    <div className="space-y-8 p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Track & Trace
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter a Batch Number or Unit UID to see the full supply chain timeline.
        </p>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <form
        onSubmit={handleFormSubmit}
        className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by Batch ID or Unit UID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-slate-800 font-medium focus:outline-none bg-transparent placeholder:text-slate-400"
            autoFocus
          />
        </div>
        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-7 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Search size={16} />
              Track
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-medium">
          <AlertTriangle size={18} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Quick-access recent batches ─────────────────────────────────── */}
      {!result && !loading && recentBatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History size={16} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              Quick Track — Recent Batches
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentBatches.map((batch) => (
              <button
                key={batch.id}
                onClick={() => executeSearch(batch.batchNumber)}
                className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md text-left transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                    {batch.product.type}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-slate-300 group-hover:text-blue-500 transition"
                  />
                </div>
                <p className="font-bold text-slate-800 text-sm truncate">
                  {batch.product.name}
                </p>
                <p className="font-mono text-[11px] text-slate-400 mt-1 truncate">
                  {batch.batchNumber}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  result.isRecalled
                    ? "bg-red-100"
                    : isExpired
                    ? "bg-amber-100"
                    : "bg-emerald-100"
                }`}
              >
                {result.isRecalled || isExpired ? (
                  <XCircle
                    size={28}
                    className={
                      result.isRecalled ? "text-red-500" : "text-amber-500"
                    }
                  />
                ) : (
                  <ShieldCheck size={28} className="text-emerald-600" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-slate-800">
                    {result.product.name}
                  </h2>
                  {result.isRecalled && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-1 rounded uppercase border border-red-200">
                      RECALLED
                    </span>
                  )}
                  {isExpired && !result.isRecalled && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded uppercase border border-amber-200">
                      EXPIRED
                    </span>
                  )}
                  {!result.isRecalled && !isExpired && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase border border-emerald-200">
                      ✓ VERIFIED SAFE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-500 text-sm font-mono">
                    {result.batchNumber}
                  </p>
                  <button
                    onClick={() => handleCopy(result.batchNumber)}
                    className="text-slate-400 hover:text-blue-600 transition"
                    title="Copy batch number"
                  >
                    {copied ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                {result.product.strength && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {result.product.strength} · {result.product.genericName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-6 flex-wrap">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mfg Date
                </p>
                <p className="font-bold text-slate-700 text-sm mt-0.5">
                  {new Date(result.mfgDate).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Expiry Date
                </p>
                <p
                  className={`font-bold text-sm mt-0.5 ${
                    isExpired ? "text-red-500" : "text-slate-700"
                  }`}
                >
                  {new Date(result.expDate).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  MRP
                </p>
                <p className="font-bold text-slate-700 text-sm mt-0.5">
                  ₹{result.mrp}
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Checkpoints",
                value: result.timeline.length,
                icon: BarChart3,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "In Circulation",
                value: totalInCirculation.toLocaleString(),
                icon: Package,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Current Holders",
                value: result.currentHolders.length,
                icon: Users,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                label: "Unit Type",
                value: result.unitType ?? DEFAULT_UNIT_TYPE,
                icon: Hash,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3"
              >
                <div className={`${bg} p-2.5 rounded-lg flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {String(value)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Truck size={16} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    Supply Chain Journey
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {result.timeline.length} verified checkpoint
                    {result.timeline.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="p-6">
                {result.timeline.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">
                      No movement records yet.
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Movements appear after shipments are received.
                    </p>
                  </div>
                ) : (
                  result.timeline.map((event, i) => (
                    <TimelineNode
                      key={event.id}
                      event={event}
                      isLast={i === result.timeline.length - 1}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Manufacturer card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Factory size={14} className="text-violet-600" />
                  <h3 className="font-bold text-slate-700 text-sm">
                    Manufacturer
                  </h3>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {result.manufacturer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {result.manufacturer.name}
                    </p>
                    {result.manufacturer.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin size={10} />
                        {result.manufacturer.address}
                      </p>
                    )}
                  </div>
                </div>
                {result.manufacturer.licenseNo && (
                  <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                    Lic: {result.manufacturer.licenseNo}
                  </p>
                )}
              </div>

              {/* Current holders */}
              {result.currentHolders.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                    <Store size={14} className="text-emerald-600" />
                    <h3 className="font-bold text-slate-700 text-sm">
                      Current Stock Holders
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {result.currentHolders.map((h, i) => {
                      const style = getRoleStyle(h.role);
                      const HIcon = style.icon;
                      return (
                        <div
                          key={i}
                          className="px-5 py-3 flex items-center gap-3"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${style.dot}`}
                          >
                            <HIcon size={13} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-xs truncate">
                              {h.holder}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase">
                              {h.role}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-600 flex-shrink-0">
                            {h.stock} units
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Unit info */}
              {result.unitId && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash size={14} className="text-blue-600" />
                    <h3 className="font-bold text-slate-700 text-sm">
                      Unit Details
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type</span>
                      <span className="font-bold text-slate-700">
                        {result.unitType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className="font-bold text-slate-700">
                        {result.unitStatus}
                      </span>
                    </div>
                    <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2 font-mono text-[10px] text-slate-500 break-all">
                      {result.unitId}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Back button */}
          <div className="pt-2">
            <button
              onClick={() => {
                setResult(null);
                setQuery("");
                setError("");
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-sm transition"
            >
              <ArrowLeft size={16} />
              Back to Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
