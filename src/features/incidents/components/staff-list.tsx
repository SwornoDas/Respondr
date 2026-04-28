import { type ReactNode } from "react";
import {
  CheckCircle2,
  Circle,
  LoaderCircle,
  MapPin,
  UserRound,
} from "lucide-react";

import type { StaffMember } from "../types";

export type StaffListItem = StaffMember & {
  assignedRoom?: string | null;
  assignedStatus?: string | null;
  isBusy?: boolean;
};

type StaffListProps = {
  title: string;
  helperText?: string;
  items: StaffListItem[];
  emptyMessage: string;
  onAction?: (item: StaffListItem) => void;
  actionLabel?: string;
  footer?: ReactNode;
};

export function StaffList({
  title,
  helperText,
  items,
  emptyMessage,
  onAction,
  actionLabel = "Assign",
  footer,
}: StaffListProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white/80">{title}</h3>
          {helperText ? (
            <p className="mt-1 text-xs leading-5 text-white/35">
              {helperText}
            </p>
          ) : null}
        </div>
        <span className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-white/40">
          {items.length}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/30">
            {emptyMessage}
          </div>
        ) : (
          items.map((item) => {
            const availabilityTone = item.isBusy
              ? "bg-amber-500/10 text-amber-300 border-amber-500/15"
              : item.isOnline
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/15"
                : "bg-rose-500/10 text-rose-300 border-rose-500/15";

            return (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/[0.1]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-gradient-to-br from-rose-500/10 to-orange-500/10 text-xs font-bold text-white/70">
                      {item.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                        {item.name}
                      </div>
                      <p className="text-[11px] text-white/35">{item.role}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${availabilityTone}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.isBusy ? "bg-amber-400" : item.isOnline ? "bg-emerald-400" : "bg-rose-400"}`}
                    />
                    {item.isBusy
                      ? "Busy"
                      : item.isOnline
                        ? "Available"
                        : "Offline"}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-white/30">
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1">
                    <Circle className="h-2.5 w-2.5" />
                    {item.phoneNumber}
                  </span>
                  {item.assignedRoom ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1">
                      <MapPin className="h-2.5 w-2.5" />
                      Room {item.assignedRoom}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Ready
                    </span>
                  )}
                </div>

                {onAction ? (
                  <button
                    type="button"
                    onClick={() => onAction(item)}
                    disabled={!item.isOnline || item.isBusy}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <LoaderCircle className="h-3.5 w-3.5" />
                    {actionLabel}
                  </button>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
