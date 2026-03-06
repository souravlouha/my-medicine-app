"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  Calendar,
  Factory,
  Hash,
  Package,
  Truck,
  Store,
  ShoppingBag,
  Home,
  Search,
  Loader2,
  Clock,
  MapPin,
  ChevronRight,
  Info,
  Lock,
} from "lucide-react";
import { verifyMedicineAction } from "@/lib/actions/track-actions";
import type { TrackingResult } from "@/lib/actions/track-actions";

// ─── Role → Icon / Color map ───────────────────────────────────────────────
const ROLE_META: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  MANUFACTURER: {
    icon: Factory,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  DISTRIBUTOR: {
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  RETAILER: {
    icon: Store,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  CONSUMER: {
    icon: ShoppingBag,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

function getRoleMeta(role: string) {
  return (
    ROLE_META[role?.toUpperCase()] ?? {
      icon: Package,
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200",
    }
  );
}

// ─── Timeline Step ─────────────────────────────────────────────────────────
function TimelineStep({
  event,
  isFirst,
  isLast,
}: {
  event: TrackingResult["timeline"][number];
  isFirst: boolean;
  isLast: boolean;
}) {
  const meta = getRoleMeta(event.role);
  const Icon = meta.icon;

  return (
    <div className="flex gap-4">
      {/* Connector line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full border-2 ${meta.border} ${meta.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}
        >
          <Icon size={18} className={meta.color} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 mt-1 bg-gradient-to-b from-slate-300 to-slate-100 min-h-[2rem]" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-bold text-slate-800 text-sm">{event.event}</p>
            <p className={`text-xs font-semibold ${meta.color} mt-0.5`}>
              {event.actor}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color} border ${meta.border} flex-shrink-0`}
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
            <Clock size={11} />
            {new Date(event.date).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Package size={11} />
            {event.quantity.toLocaleString()} units
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Row ─────────────────────────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
  valueClass = "text-slate-800",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className={`font-semibold text-sm mt-0.5 break-all ${valueClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TrackResultClient({ id }: { id: string }) {
  const [data, setData] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;

    // Wholesale logistics packs are restricted to authenticated users
    if (id.startsWith("CARTON") || id.startsWith("BOX")) {
      setNotFound(false);
      setLoading(false);
      setErrorMsg("RESTRICTED");
      return;
    }

    const fetchData = async () => {
      try {
        const result = await verifyMedicineAction(id);
        if (result.success) {
          setData(result.data);
        } else {
          setNotFound(true);
          setErrorMsg(result.error);
        }
      } catch {
        setNotFound(true);
        setErrorMsg("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <Loader2 size={64} className="text-blue-500 animate-spin" />
          <ShieldCheck
            size={24}
            className="text-blue-300 absolute inset-0 m-auto"
          />
        </div>
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Verifying authenticity…
        </p>
        <p className="text-slate-600 text-xs">Checking recall database…</p>
      </div>
    );
  }

  // ── Restricted (CARTON / BOX) ──
  if (errorMsg === "RESTRICTED") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
            <Lock size={28} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Logistics Pack Detected
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            This is a wholesale logistics unit (
            {id.startsWith("CARTON") ? "Carton" : "Box"}). Details are
            accessible only to authorised supply chain partners.
          </p>
          <div className="font-mono text-xs text-slate-500 bg-slate-800 px-3 py-2 rounded-lg break-all mb-6">
            {id}
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm w-full transition"
          >
            <Lock size={14} />
            Sign in to View
          </Link>
          <Link
            href="/track"
            className="mt-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition"
          >
            <Search size={14} />
            Try Another ID
          </Link>
        </div>
      </div>
    );
  }

  // ── Not Found / Error ──
  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-red-800/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20">
            <XCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Verification Failed
          </h2>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            {errorMsg ||
              "This code was not found in our database. It may be a counterfeit product."}
          </p>
          <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-left mb-6">
            <p className="text-red-300 text-xs font-bold flex items-center gap-1.5 mb-1">
              <AlertTriangle size={12} />
              What to do
            </p>
            <ul className="text-red-200/70 text-xs space-y-1 list-disc list-inside">
              <li>Do not consume this medicine</li>
              <li>Report to the pharmacy or authorities</li>
              <li>
                Submit a fraud report at{" "}
                <a href="/features/report" className="underline">
                  medtrace.in/report
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/features/report"
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm w-full transition"
            >
              <AlertTriangle size={14} />
              Report Suspicious Medicine
            </Link>
            <Link
              href="/track"
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm w-full transition"
            >
              <Search size={14} />
              Try Another ID
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Recalled ──
  if (data.isRecalled) {
    return (
      <div className="min-h-screen bg-red-950 flex items-center justify-center p-6">
        <div className="bg-red-900/50 border-2 border-red-600 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-sm">
          <div className="bg-red-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-red-500/40 animate-pulse">
            <AlertOctagon size={40} className="text-red-400" />
          </div>
          <div className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4">
            SAFETY RECALL ACTIVE
          </div>
          <h1 className="text-3xl font-black text-white mb-2">WARNING!</h1>
          <h2 className="text-lg font-bold text-red-100 mb-4">
            This batch has been recalled
          </h2>
          <p className="text-red-200/80 text-sm mb-6 leading-relaxed">
            The manufacturer has issued a recall for this batch due to safety
            or quality concerns.{" "}
            <strong className="text-red-300">
              Do not consume this medicine.
            </strong>
          </p>
          <div className="bg-red-900/60 rounded-2xl p-4 text-left space-y-3 mb-6 border border-red-700/40">
            <div>
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">
                Medicine
              </p>
              <p className="text-white font-bold text-sm mt-0.5">
                {data.product.name}
              </p>
            </div>
            <div>
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">
                Batch Number
              </p>
              <p className="text-white font-mono font-bold text-sm mt-0.5">
                {data.batchNumber}
              </p>
            </div>
          </div>
          <Link
            href="/features/report"
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm w-full transition mb-2"
          >
            <AlertTriangle size={14} />
            Report This Medicine
          </Link>
          <Link
            href="/track"
            className="flex items-center justify-center gap-2 text-red-300 hover:text-white text-sm font-medium transition mt-2"
          >
            <Search size={14} />
            Verify Another Medicine
          </Link>
        </div>
      </div>
    );
  }

  // ── Expired ──
  if (data.isExpired) {
    return (
      <div className="min-h-screen bg-amber-950 flex items-center justify-center p-6">
        <div className="bg-amber-900/50 border-2 border-amber-600 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-sm">
          <div className="bg-amber-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-amber-500/40">
            <AlertTriangle size={40} className="text-amber-400" />
          </div>
          <div className="bg-amber-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4">
            EXPIRED MEDICINE
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Expired!</h1>
          <p className="text-amber-200/80 text-sm mb-6 leading-relaxed">
            This medicine expired on{" "}
            <strong className="text-amber-300">
              {new Date(data.expDate).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </strong>
            . Do not consume it.
          </p>
          <div className="bg-amber-900/60 rounded-2xl p-4 text-left space-y-3 mb-6 border border-amber-700/40">
            <div>
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                Medicine
              </p>
              <p className="text-white font-bold text-sm mt-0.5">
                {data.product.name}
              </p>
            </div>
            <div>
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                Batch Number
              </p>
              <p className="text-white font-mono font-bold text-sm mt-0.5">
                {data.batchNumber}
              </p>
            </div>
          </div>
          <Link
            href="/track"
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-sm w-full transition"
          >
            <Search size={14} />
            Verify Another Medicine
          </Link>
        </div>
      </div>
    );
  }

  // ── Authentic ──
  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 pt-10 pb-28 px-6">
        {/* Decorative ring */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border-[32px] border-white/5" />
        <div className="absolute bottom-0 left-0 w-full h-16 bg-slate-50 rounded-t-[3rem]" />

        <div className="relative z-10 max-w-md mx-auto text-center">
          {/* Verified shield */}
          <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-xl">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <div className="bg-white/20 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3 border border-white/20">
            ✓ Verified Authentic
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            {data.product.name}
          </h1>
          {data.product.strength && (
            <p className="text-emerald-100/80 text-sm mt-1 font-medium">
              {data.product.strength} · {data.product.genericName}
            </p>
          )}
          <p className="text-emerald-100/60 text-xs mt-2">
            Safe to consume · 100% Genuine Product
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 -mt-12 relative z-20 space-y-4">

        {/* Product Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <Info size={16} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-slate-800">Product Details</h2>
          </div>
          <div className="px-5 py-2">
            <DetailRow
              icon={Hash}
              label="Batch Number"
              value={data.batchNumber}
              valueClass="font-mono text-blue-700"
            />
            <DetailRow
              icon={Package}
              label="Medicine Type"
              value={data.product.type}
            />
            <DetailRow
              icon={Calendar}
              label="Manufacture Date"
              value={new Date(data.mfgDate).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            />
            <DetailRow
              icon={AlertTriangle}
              label="Expiry Date"
              value={new Date(data.expDate).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
              valueClass="text-amber-600 font-bold"
            />
            {data.unitId && (
              <DetailRow
                icon={Package}
                label="Unit ID"
                value={`…${data.unitId.slice(-16)}`}
                valueClass="font-mono text-xs text-slate-600"
              />
            )}
          </div>
        </div>

        {/* MRP Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">
              Maximum Retail Price
            </p>
            <p className="text-white text-3xl font-black mt-0.5">₹{data.mrp}</p>
            <p className="text-blue-200/60 text-xs mt-1">Inclusive of all taxes</p>
          </div>
          <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
        </div>

        {/* Manufacturer Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-3">
            <div className="bg-violet-50 p-2 rounded-lg">
              <Factory size={16} className="text-violet-600" />
            </div>
            <h2 className="font-bold text-slate-800">Manufacturer</h2>
          </div>
          <div className="px-5 py-4">
            <p className="font-bold text-slate-800 text-sm">
              {data.manufacturer.name}
            </p>
            {data.manufacturer.address && (
              <p className="text-slate-500 text-xs mt-1 flex items-start gap-1">
                <MapPin size={11} className="mt-0.5 flex-shrink-0" />
                {data.manufacturer.address}
              </p>
            )}
            {data.manufacturer.licenseNo && (
              <p className="text-slate-400 text-xs mt-2 font-mono">
                Lic: {data.manufacturer.licenseNo}
              </p>
            )}
          </div>
        </div>

        {/* Supply Chain Timeline */}
        {data.timeline.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Truck size={16} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Supply Chain Journey</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {data.timeline.length} verified checkpoint
                  {data.timeline.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="px-5 pt-5">
              {data.timeline.map((event, i) => (
                <TimelineStep
                  key={event.id}
                  event={event}
                  isFirst={i === 0}
                  isLast={i === data.timeline.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current Holders */}
        {data.currentHolders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <Store size={16} className="text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-800">Available At</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {data.currentHolders.map((holder, i) => {
                const meta = getRoleMeta(holder.role);
                const Icon = meta.icon;
                return (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={15} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {holder.holder}
                      </p>
                      <p className={`text-xs ${meta.color} font-medium`}>
                        {holder.role}
                      </p>
                    </div>
                    <p className="text-slate-500 text-xs font-bold flex-shrink-0">
                      {holder.stock} units
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/track"
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm transition shadow"
          >
            <Search size={15} />
            Verify Another Medicine
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 py-3 text-sm font-medium transition"
          >
            <Home size={14} />
            Back to Home
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Scan ID Footer */}
        <p className="text-center text-slate-300 text-[9px] font-mono break-all pb-4">
          SCAN ID: {id}
        </p>
      </div>
    </div>
  );
}
