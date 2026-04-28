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
  onAssign,
  onMarkInProgress,
  onResolve,
}: IncidentCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={`rounded-[28px] border bg-[#121821] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition ${
        highlighted
          ? "border-blue-400/35 ring-1 ring-blue-400/30 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_18px_60px_rgba(0,0,0,0.28)]"
          : "border-[#1F2A37] hover:border-[#2C3948]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(incident.status)}`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${statusDots[incident.status]}`}
              />
              {incident.status === "REPORTED"
                ? "Emergency reported"
                : incident.status === "ACKNOWLEDGED"
                  ? "Acknowledged"
                  : incident.status === "IN_PROGRESS"
                    ? "In progress"
                    : "Resolved"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClasses(incident.priority)}`}
            >
              {incident.priority}
            </span>
            <span className="rounded-full border border-[#1F2A37] bg-[#0B0F14] px-3 py-1 text-xs font-medium text-[#9CA3AF]">
              {incident.id}
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8B5CF6]">
              {incident.category}
            </p>
            <h3 className="mt-1 text-3xl font-semibold tracking-tight text-[#E5E7EB]">
              Room {incident.roomNumber}
            </h3>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-[#9CA3AF]">
            {incident.description || "No description provided."}
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-[#9CA3AF]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#0B0F14] px-3 py-2">
              <Clock3 className="h-4 w-4 text-[#6B7280]" />
              {formatRelativeTime(incident.createdAt)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#0B0F14] px-3 py-2">
              <MapPin className="h-4 w-4 text-[#6B7280]" />
              {incident.roomNumber}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#0B0F14] px-3 py-2">
              <UserRound className="h-4 w-4 text-[#6B7280]" />
              {assignedStaffName ?? "Unassigned"}
            </span>
          </div>
        </div>

        <div className="flex min-w-[220px] flex-col gap-3">
          <ActionButton
            label="Assign"
            tone="blue"
            pending={pending}
            onClick={() => onAssign(incident)}
          />
          <ActionButton
            label="Mark In Progress"
            tone="amber"
            pending={pending}
            disabled={
              incident.status === "IN_PROGRESS" ||
              incident.status === "RESOLVED"
            }
            onClick={() => onMarkInProgress(incident)}
          />
          <ActionButton
            label="Resolve"
            tone="emerald"
            pending={pending}
            disabled={incident.status === "RESOLVED"}
            onClick={() => onResolve(incident)}
          />
        </div>
      </div>

      <div className="mt-4 h-px bg-[#1F2A37]" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B7280]">
        <span className="inline-flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-[#3B82F6]" />
          New incidents stay pinned to the top.
        </span>
        <span>{pending ? "Saving changes..." : "Live synced"}</span>
      </div>
    </motion.article>
  );
}

function ActionButton({
  label,
  tone,
  pending,
  disabled,
  onClick,
}: {
  label: string;
  tone: "blue" | "amber" | "emerald";
  pending: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const toneClasses = {
    blue: "border-[#2563EB]/30 bg-[#3B82F6]/12 text-[#BFDBFE] hover:border-[#3B82F6]/55 hover:bg-[#3B82F6]/18",
    amber:
      "border-[#F59E0B]/25 bg-[#F59E0B]/12 text-[#FDE68A] hover:border-[#F59E0B]/55 hover:bg-[#F59E0B]/18",
    emerald:
      "border-[#10B981]/25 bg-[#10B981]/12 text-[#A7F3D0] hover:border-[#10B981]/55 hover:bg-[#10B981]/18",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${toneClasses} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label}
    </button>
  );
}
