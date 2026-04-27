"use client";

import { startTransition, useState } from "react";
import { CheckCircle2, PhoneCall, Timer, UserRound } from "lucide-react";

import { SectionCard } from "@/components/section-card";

import { useIncidentStream } from "../hooks/use-incident-stream";
import type { IncidentRecord, StaffMember } from "../types";
import {
  formatRelativeTime,
  formatIncidentStatus,
  getPriorityClasses,
  getStatusClasses,
  mergeIncident,
} from "../utils";

export function StaffBoard({
  initialIncidents,
  onlineStaff,
}: {
  initialIncidents: IncidentRecord[];
  onlineStaff: StaffMember[];
}) {
  const { incidents, setIncidents } = useIncidentStream(initialIncidents);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true); // Mocking initial state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const actionableIncidents = incidents.filter(
    (incident) => incident.status !== "RESOLVED",
  );

  async function toggleOnlineStatus() {
    setIsUpdatingStatus(true);
    const nextState = !isOnline;
    
    try {
      const response = await fetch('/api/staff/online', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'staff@hotel.com', // Mock staff identity
          isOnline: nextState,
        }),
      });

      if (response.ok) {
        setIsOnline(nextState);
      }
    } catch (error) {
      console.error('Failed to update online status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function updateStatus(incident: IncidentRecord, nextStatus: IncidentRecord["status"]) {
    const snapshot = incidents;
    setPendingId(incident.id);

    startTransition(() => {
      setIncidents((current) =>
        current.map((item) =>
          item.id === incident.id ? { ...item, status: nextStatus } : item,
        ),
      );
    });

    try {
      const response = await fetch(`/api/incidents/${incident.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          assignedStaffId: onlineStaff[0]?.id ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update incident.");
      }

      const updatedIncident = (await response.json()) as IncidentRecord;

      startTransition(() => {
        setIncidents((current) => mergeIncident(current, updatedIncident));
      });
    } catch {
      startTransition(() => {
        setIncidents(snapshot);
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <SectionCard
        eyebrow="Responders"
        title="Team availability"
        description="Toggle your status to receive active incident alerts and appear on the admin command board."
      >
        <div className="space-y-4">
          {/* Status Toggle Card */}
          <div className="rounded-[24px] border border-[var(--accent-line)] bg-[var(--accent-surface)] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[var(--ink-strong)]">Your Status</h3>
                <p className="text-xs text-[var(--muted-ink)]">{isOnline ? 'Active and receiving alerts' : 'Offline'}</p>
              </div>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={toggleOnlineStatus}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {onlineStaff.map((member) => (
            <div
              key={member.id}
              className="rounded-[24px] border border-[var(--line)] bg-white/72 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[var(--ink-strong)]">
                    <UserRound className="h-4 w-4 text-[var(--accent-strong)]" />
                    <span className="font-semibold">{member.name}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted-ink)]">{member.role}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Online
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-[var(--muted-ink)]">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4" />
                  <span>{member.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span>{member.responseWindowSeconds}s response target</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Task Queue"
        title="Active response board"
        description="Responders see only the tasks that still need action, with quick status progression from acknowledge to resolution."
        className="bg-[rgba(11,29,38,0.9)] text-white"
      >
        <div className="grid gap-4">
          {actionableIncidents.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/6 p-6 text-sm text-white/60">
              No active incidents right now.
            </div>
          ) : (
            actionableIncidents.map((incident) => (
              <article
                key={incident.id}
                className="rounded-[26px] border border-white/10 bg-white/6 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(incident.status)}`}
                      >
                        {formatIncidentStatus(incident.status)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClasses(incident.priority)}`}
                      >
                        {incident.priority}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold">
                      {incident.category} in {incident.roomNumber}
                    </h2>
                    <p className="mt-2 text-sm text-white/70">
                      {incident.description || "No description provided."}
                    </p>
                  </div>

                  <div className="text-right text-sm text-white/58">
                    <div>{incident.id}</div>
                    <div className="mt-1">{formatRelativeTime(incident.createdAt)}</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {incident.status === "REPORTED" ? (
                    <ActionChip
                      label="Claim incident"
                      disabled={pendingId === incident.id}
                      onClick={() => updateStatus(incident, "ACKNOWLEDGED")}
                    />
                  ) : null}
                  {incident.status === "ACKNOWLEDGED" ? (
                    <ActionChip
                      label="Start response"
                      disabled={pendingId === incident.id}
                      onClick={() => updateStatus(incident, "IN_PROGRESS")}
                    />
                  ) : null}
                  {incident.status === "IN_PROGRESS" ? (
                    <ActionChip
                      label="Mark resolved"
                      disabled={pendingId === incident.id}
                      onClick={() => updateStatus(incident, "RESOLVED")}
                    />
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/68">
          Staff view intentionally stays narrower than admin view. It focuses on assignment,
          acknowledgement, and completion rather than system-wide triage.
        </div>
      </SectionCard>
    </div>
  );
}

function ActionChip({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/88 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <CheckCircle2 className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
