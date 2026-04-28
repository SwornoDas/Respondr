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
    <div className="rounded-[28px] border border-[#1F2A37] bg-[#121821] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#E5E7EB]">{title}</h3>
          {helperText ? (
            <p className="mt-1 text-sm leading-6 text-[#9CA3AF]">
              {helperText}
            </p>
          ) : null}
        </div>
        <span className="rounded-full border border-[#1F2A37] bg-[#0B0F14] px-3 py-1 text-xs font-semibold text-[#9CA3AF]">
          {items.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1F2A37] bg-[#0B0F14] p-5 text-sm text-[#6B7280]">
            {emptyMessage}
          </div>
        ) : (
          items.map((item) => {
            const availabilityTone = item.isBusy
              ? "bg-amber-500/15 text-amber-100 border-amber-400/20"
              : item.isOnline
                ? "bg-emerald-500/15 text-emerald-100 border-emerald-400/20"
                : "bg-rose-500/15 text-rose-100 border-rose-400/20";

            return (
              <div
                key={item.id}
                className="rounded-[22px] border border-[#1F2A37] bg-[#0B0F14] p-4 transition hover:border-[#2C3948]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1F2A37] bg-[#121821] text-sm font-semibold text-[#E5E7EB]">
                      {item.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[#E5E7EB]">
                        <UserRound className="h-4 w-4 text-[#6B7280]" />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#9CA3AF]">{item.role}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${availabilityTone}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${item.isBusy ? "bg-amber-400" : item.isOnline ? "bg-emerald-400" : "bg-rose-400"}`}
                    />
                    {item.isBusy
                      ? "Busy"
                      : item.isOnline
                        ? "Available"
                        : "Offline"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#9CA3AF]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#121821] px-3 py-2">
                    <Circle className="h-3 w-3 text-[#6B7280]" />
                    {item.phoneNumber}
                  </span>
                  {item.assignedRoom ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#121821] px-3 py-2">
                      <MapPin className="h-3 w-3 text-[#6B7280]" />
                      Room {item.assignedRoom}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#121821] px-3 py-2">
                      <CheckCircle2 className="h-3 w-3 text-[#6B7280]" />
                      Ready for assignment
                    </span>
                  )}
                </div>

                {onAction ? (
                  <button
                    type="button"
                    onClick={() => onAction(item)}
                    disabled={!item.isOnline || item.isBusy}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/12 px-4 py-2.5 text-sm font-semibold text-[#BFDBFE] transition hover:border-[#3B82F6]/55 hover:bg-[#3B82F6]/18 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <LoaderCircle className="h-4 w-4" />
                    {actionLabel}
                  </button>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
