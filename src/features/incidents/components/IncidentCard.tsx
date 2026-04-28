"use client";

import { motion } from "framer-motion";
import { Clock3, MapPin, UserRound, Zap } from "lucide-react";

import type { IncidentRecord } from "../types";
import {
  formatRelativeTime,
  getPriorityClasses,
  getStatusClasses,
} from "../utils";

type IncidentCardProps = {
  incident: IncidentRecord;
  assignedStaffName?: string;
  highlighted?: boolean;
  pending?: boolean;
  theme?: "dark" | "light";
  onAssign: (incident: IncidentRecord) => void;
  onMarkInProgress: (incident: IncidentRecord) => void;
  onResolve: (incident: IncidentRecord) => void;
};

const statusDots: Record<IncidentRecord["status"], string> = {
  REPORTED: "bg-red-400",
  ACKNOWLEDGED: "bg-sky-400",
  IN_PROGRESS: "bg-amber-400",
  RESOLVED: "bg-emerald-400",
};

export function IncidentCard({
  incident,
  assignedStaffName,
  highlighted,
  pending = false,
  theme = "dark",
  onAssign,
  onMarkInProgress,
  onResolve,
}: IncidentCardProps) {
  const isUrgent = incident.priority === "Critical";
  const isLight = theme === "light";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.99 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
        highlighted
          ? isLight
            ? "border-rose-300 bg-rose-50/90 shadow-[0_0_25px_rgba(244,63,94,0.15)]"
            : "border-rose-400/30 bg-rose-500/5 shadow-[0_0_40px_rgba(225,29,72,0.08)]"
          : isUrgent
            ? isLight
              ? "border-red-300/70 bg-white hover:border-red-400/80"
              : "border-red-500/20 bg-white/[0.03] hover:border-red-500/30"
            : isLight
              ? "border-slate-200 bg-white hover:border-slate-300"
              : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12]"
      }`}
    >
      {isUrgent && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-rose-500 via-orange-500 to-transparent" />
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          {/* Status + Priority badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${getStatusClasses(incident.status)}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${statusDots[incident.status]} ${incident.status === "REPORTED" ? "animate-pulse" : ""}`}
              />
              {incident.status === "REPORTED"
                ? "Reported"
                : incident.status === "ACKNOWLEDGED"
                  ? "Acknowledged"
                  : incident.status === "IN_PROGRESS"
                    ? "In Progress"
                    : "Resolved"}
            </span>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(incident.priority)}`}
            >
              {incident.priority}
            </span>
          </div>

          {/* Category + Room */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400/80">
              {incident.category}
            </p>
            <h3
              className={`mt-0.5 text-xl font-bold tracking-tight ${
                isLight ? "text-slate-900" : "text-white/90"
              }`}
            >
              Room {incident.roomNumber}
            </h3>
          </div>

          <p
            className={`max-w-xl text-sm leading-relaxed ${
              isLight ? "text-slate-600" : "text-white/45"
            }`}
          >
            {incident.description || "No description provided."}
          </p>

          {/* Meta pills */}
          <div
            className={`flex flex-wrap gap-2 text-xs ${
              isLight ? "text-slate-500" : "text-white/40"
            }`}
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${
                isLight
                  ? "border-slate-200 bg-slate-50"
                  : "border-white/[0.06] bg-white/[0.03]"
              }`}
            >
              <Clock3
                className={`h-3 w-3 ${isLight ? "text-slate-400" : "text-white/25"}`}
              />
              {formatRelativeTime(incident.createdAt)}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${
                isLight
                  ? "border-slate-200 bg-slate-50"
                  : "border-white/[0.06] bg-white/[0.03]"
              }`}
            >
              <MapPin
                className={`h-3 w-3 ${isLight ? "text-slate-400" : "text-white/25"}`}
              />
              {incident.roomNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${
                isLight
                  ? "border-slate-200 bg-slate-50"
                  : "border-white/[0.06] bg-white/[0.03]"
              }`}
            >
              <UserRound
                className={`h-3 w-3 ${isLight ? "text-slate-400" : "text-white/25"}`}
              />
              {assignedStaffName ?? "Unassigned"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2 lg:flex-col">
          <ActionButton
            label="Assign Staff"
            tone="rose"
            pending={pending}
            theme={theme}
            onClick={() => onAssign(incident)}
          />
          <ActionButton
            label="Start Response"
            tone="amber"
            pending={pending}
            theme={theme}
            disabled={
              incident.status === "IN_PROGRESS" ||
              incident.status === "RESOLVED"
            }
            onClick={() => onMarkInProgress(incident)}
          />
          <ActionButton
            label="Mark Resolved"
            tone="emerald"
            pending={pending}
            theme={theme}
            disabled={incident.status === "RESOLVED"}
            onClick={() => onResolve(incident)}
          />
        </div>
      </div>

      <div
        className={`mt-4 flex items-center justify-between border-t pt-3 text-[11px] ${
          isLight
            ? "border-slate-200 text-slate-500"
            : "border-white/[0.05] text-white/25"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-rose-500/50" />
          Priority queue active
        </span>
        <span>{pending ? "Updating..." : "Live"}</span>
      </div>
    </motion.article>
  );
}

function ActionButton({
  label,
  tone,
  pending,
  theme,
  disabled,
  onClick,
}: {
  label: string;
  tone: "rose" | "amber" | "emerald";
  pending: boolean;
  theme: "dark" | "light";
  disabled?: boolean;
  onClick: () => void;
}) {
  const toneClasses =
    theme === "light"
      ? {
          rose: "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-400",
          amber:
            "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-400",
          emerald:
            "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400",
        }[tone]
      : {
          rose: "border-rose-500/20 bg-rose-500/8 text-rose-300 hover:bg-rose-500/15 hover:border-rose-500/35",
          amber:
            "border-amber-500/20 bg-amber-500/8 text-amber-300 hover:bg-amber-500/15 hover:border-amber-500/35",
          emerald:
            "border-emerald-500/20 bg-emerald-500/8 text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-500/35",
        }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ${
        theme === "light"
          ? "focus-visible:ring-slate-300"
          : "focus-visible:ring-white/20"
      } ${toneClasses} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {label}
    </button>
  );
}
