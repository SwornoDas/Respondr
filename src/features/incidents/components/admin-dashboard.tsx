"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { supabase } from "@/lib/supabase";
import {
  BellRing,
  Clock3,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";

import { useIncidentStream } from "../hooks/use-incident-stream";
import type { IncidentRecord, IncidentStatus, StaffMember } from "../types";
import { formatRelativeTime, mergeIncident } from "../utils";
import { IncidentCard } from "./incident-card";
import { StaffList, type StaffListItem } from "./staff-list";
import { StatsCard } from "./stats-card";

type AdminDashboardProps = {
  initialIncidents: IncidentRecord[];
  initialStaff: StaffMember[];
};

const socketEvents = {
  assignment: "incident_assigned",
  status: "status_updated",
} as const;

export function AdminDashboard({
  initialIncidents,
  initialStaff,
}: AdminDashboardProps) {
  const { incidents, setIncidents, connectionState, emitIncidentEvent } =
    useIncidentStream(initialIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [highlightedIncidentId, setHighlightedIncidentId] = useState<
    string | null
  >(null);
  const previousTopIncidentId = useRef<string | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const topIncidentId = incidents[0]?.id ?? null;

    if (
      previousTopIncidentId.current &&
      previousTopIncidentId.current !== topIncidentId
    ) {
      const latestIncident = incidents[0];

      if (latestIncident) {
        const timeoutId = window.setTimeout(() => {
          setHighlightedIncidentId(latestIncident.id);
          playAlertTone();

          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("Respondr alert", {
              body: `${latestIncident.category} in room ${latestIncident.roomNumber}`,
              tag: latestIncident.id,
            });
          }

          const clearId = window.setTimeout(() => {
            setHighlightedIncidentId((current) =>
              current === latestIncident.id ? null : current,
            );
          }, 3000);

          alertTimeoutRef.current = clearId;
        }, 0);

        alertTimeoutRef.current = timeoutId;
      }
    }

    previousTopIncidentId.current = topIncidentId;

    return () => {
      if (alertTimeoutRef.current !== null) {
        window.clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
    };
  }, [incidents]);

  const staffRoster = useMemo<StaffListItem[]>(() => {
    return initialStaff.map((staff) => {
      const activeIncident = incidents.find(
        (incident) =>
          incident.assignedStaffId === staff.id &&
          incident.status !== "RESOLVED",
      );

      return {
        ...staff,
        assignedRoom: activeIncident?.roomNumber ?? null,
        assignedStatus: activeIncident?.status ?? null,
        isBusy: Boolean(activeIncident),
      };
    });
  }, [initialStaff, incidents]);

  const activeIncidents = useMemo(
    () => incidents.filter((incident) => incident.status !== "RESOLVED"),
    [incidents],
  );

  const activeResponderItems = useMemo<StaffListItem[]>(() => {
    return staffRoster.filter((staff) => staff.assignedRoom);
  }, [staffRoster]);

  const totalActive = activeIncidents.length;
  const resolvedToday = incidents.filter(
    (incident) => incident.status === "RESOLVED",
  ).length;
  const avgResponseMinutes =
    totalActive === 0
      ? 0
      : Math.max(
          1,
          Math.round(
            activeIncidents.reduce((total, incident) => {
              return (
                total +
                (currentTime.getTime() -
                  new Date(incident.createdAt).getTime()) /
                  60000
              );
            }, 0) / totalActive,
          ),
        );
  const latestIncident = incidents[0];
  const selectedIncident =
    incidents.find((incident) => incident.id === selectedIncidentId) ?? null;

  async function persistIncidentUpdate(
    incident: IncidentRecord,
    nextStatus: IncidentStatus,
  ) {
    const snapshot = incidents;
    setPendingId(incident.id);
    setErrorMessage("");

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
          assignedStaffId: incident.assignedStaffId ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update the incident.");
      }

      const updatedIncident = (await response.json()) as IncidentRecord;

      startTransition(() => {
        setIncidents((current) => mergeIncident(current, updatedIncident));
      });

      emitIncidentEvent(socketEvents.status, updatedIncident);
    } catch (error) {
      startTransition(() => {
        setIncidents(snapshot);
      });

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the incident.",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function assignIncident(incident: IncidentRecord, staff: StaffMember) {
    const snapshot = incidents;
    setPendingId(incident.id);
    setErrorMessage("");

    const optimisticIncident: IncidentRecord = {
      ...incident,
      assignedStaffId: staff.id,
    };

    startTransition(() => {
      setIncidents((current) => mergeIncident(current, optimisticIncident));
    });

    try {
      const response = await fetch(`/api/incidents/${incident.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: incident.status,
          assignedStaffId: staff.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to assign the incident.");
      }

      const updatedIncident = (await response.json()) as IncidentRecord;

      startTransition(() => {
        setIncidents((current) => mergeIncident(current, updatedIncident));
      });

      emitIncidentEvent(socketEvents.assignment, updatedIncident);
      setSelectedIncidentId(null);
    } catch (error) {
      startTransition(() => {
        setIncidents(snapshot);
      });

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to assign the incident.",
      );
    } finally {
      setPendingId(null);
    }
  }

  const latestElapsed = latestIncident
    ? formatRelativeTime(latestIncident.createdAt)
    : "No active incidents";

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-30 rounded-[28px] border border-[#1F2A37] bg-[rgba(11,15,20,0.92)] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1F2A37] bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.16))] text-[#BFDBFE] shadow-[0_0_0_1px_rgba(59,130,246,0.08)]">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Respondr
                  </h1>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                      connectionState === "connected"
                        ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-100"
                        : "border-amber-400/20 bg-amber-500/15 text-amber-100"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        connectionState === "connected"
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                    />
                    System Active
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#9CA3AF]">
                  Live emergency command center for hotel response teams.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#9CA3AF]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#0B0F14] px-4 py-2">
                <Clock3 className="h-4 w-4 text-[#6B7280]" />
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#0B0F14] px-4 py-2">
                <Users className="h-4 w-4 text-[#6B7280]" />
                Admin: Olivia Hart
              </div>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#121821] px-4 py-2 font-semibold text-[#E5E7EB] transition hover:border-[#3B82F6]/35 hover:bg-[#15202d]"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="mt-6 grid flex-1 gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(360px,1fr)]">
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Total Active Incidents"
                value={String(totalActive)}
                helper="Open incidents requiring immediate attention."
                icon={BellRing}
                tone="blue"
              />
              <StatsCard
                title="Avg Response Time"
                value={`${avgResponseMinutes}m`}
                helper="Average age of incidents still in motion."
                icon={Clock3}
                tone="amber"
              />
              <StatsCard
                title="Resolved Today"
                value={String(resolvedToday)}
                helper="Completed incidents cleared from the queue."
                icon={ShieldCheck}
                tone="emerald"
              />
            </div>

            <div className="rounded-[28px] border border-[#1F2A37] bg-[#121821] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                    Incident feed
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#E5E7EB]">
                    New incidents appear at the top
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9CA3AF]">
                    The queue is ordered by urgency and time. Assign responders,
                    advance status, and resolve without leaving the feed.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#1F2A37] bg-[#0B0F14] px-4 py-2 text-sm text-[#9CA3AF]">
                  <Sparkles className="h-4 w-4 text-[#3B82F6]" />
                  {latestElapsed}
                </div>
              </div>

              {errorMessage ? (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                  <TriangleAlert className="mt-0.5 h-4 w-4" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                {incidents.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-[#1F2A37] bg-[#0B0F14] p-8 text-sm text-[#9CA3AF]">
                    No incidents are currently active.
                  </div>
                ) : (
                  incidents.map((incident) => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      assignedStaffName={
                        initialStaff.find(
                          (staff) => staff.id === incident.assignedStaffId,
                        )?.name
                      }
                      highlighted={highlightedIncidentId === incident.id}
                      pending={pendingId === incident.id}
                      onAssign={(selectedIncident) =>
                        setSelectedIncidentId(selectedIncident.id)
                      }
                      onMarkInProgress={(selectedIncident) =>
                        persistIncidentUpdate(selectedIncident, "IN_PROGRESS")
                      }
                      onResolve={(selectedIncident) =>
                        persistIncidentUpdate(selectedIncident, "RESOLVED")
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[28px] border border-[#1F2A37] bg-[#121821] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                  Situation summary
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#E5E7EB]">
                  Priority in one glance
                </h2>

                <div className="mt-5 space-y-3">
                  <SummaryRow
                    label="Reported"
                    value={
                      incidents.filter(
                        (incident) => incident.status === "REPORTED",
                      ).length
                    }
                    tone="red"
                  />
                  <SummaryRow
                    label="In progress"
                    value={
                      incidents.filter(
                        (incident) => incident.status === "IN_PROGRESS",
                      ).length
                    }
                    tone="amber"
                  />
                  <SummaryRow
                    label="Resolved"
                    value={
                      incidents.filter(
                        (incident) => incident.status === "RESOLVED",
                      ).length
                    }
                    tone="emerald"
                  />
                </div>

                <div className="mt-5 rounded-[22px] border border-[#1F2A37] bg-[#0B0F14] p-4 text-sm text-[#9CA3AF]">
                  Latest event:{" "}
                  <span className="text-[#E5E7EB]">
                    {latestIncident
                      ? `${latestIncident.category} / room ${latestIncident.roomNumber}`
                      : "None"}
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#1F2A37] bg-[#121821] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                  Alert system
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#E5E7EB]">
                  Sound and notification handling
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#9CA3AF]">
                  New incidents trigger a short tone and optional browser
                  notification when permissions are enabled.
                </p>

                <button
                  type="button"
                  onClick={async () => {
                    if (
                      typeof window !== "undefined" &&
                      "Notification" in window &&
                      Notification.permission === "default"
                    ) {
                      await Notification.requestPermission();
                    }
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/12 px-4 py-2.5 text-sm font-semibold text-[#BFDBFE] transition hover:border-[#3B82F6]/55 hover:bg-[#3B82F6]/18"
                >
                  <Sparkles className="h-4 w-4" />
                  Enable notifications
                </button>
              </div>
            </div>

            <StaffList
              title="Active responders"
              helperText="Staff currently handling incidents and their live assignment status."
              items={activeResponderItems}
              emptyMessage="No responders are currently assigned."
              footer={
                <p className="text-xs leading-5 text-[#6B7280]">
                  Responders automatically update when incidents are assigned or
                  resolved.
                </p>
              }
            />
          </aside>
        </main>
      </div>

      {selectedIncident ? (
        <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 w-full max-w-xl border-l border-[#1F2A37] bg-[#0B0F14] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                  Assignment panel
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#E5E7EB]">
                  Assign a responder instantly
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">
                  {selectedIncident.category} in room{" "}
                  {selectedIncident.roomNumber} is waiting for ownership.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncidentId(null)}
                className="rounded-full border border-[#1F2A37] bg-[#121821] px-3 py-2 text-sm font-semibold text-[#E5E7EB] transition hover:border-[#3B82F6]/35"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#1F2A37] bg-[#121821] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#1F2A37] bg-[#0B0F14] px-3 py-1 text-xs font-semibold text-[#E5E7EB]">
                  Room {selectedIncident.roomNumber}
                </span>
                <span className="rounded-full border border-[#1F2A37] bg-[#0B0F14] px-3 py-1 text-xs font-semibold text-[#9CA3AF]">
                  {selectedIncident.category}
                </span>
                <span className="rounded-full border border-[#1F2A37] bg-[#0B0F14] px-3 py-1 text-xs font-semibold text-[#9CA3AF]">
                  {selectedIncident.status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#9CA3AF]">
                {selectedIncident.description}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                Available staff
              </p>
              {staffRoster.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#1F2A37] bg-[#121821] p-5 text-sm text-[#9CA3AF]">
                  No staff roster available.
                </div>
              ) : (
                <StaffList
                  title="Responder roster"
                  helperText="Choose the best available staff member for this incident."
                  items={staffRoster}
                  emptyMessage="No staff available for assignment."
                  actionLabel="Assign instantly"
                  onAction={(staff) => assignIncident(selectedIncident, staff)}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "amber" | "emerald";
}) {
  const toneStyles = {
    red: "border-red-400/20 bg-red-500/12 text-red-100",
    amber: "border-amber-400/20 bg-amber-500/12 text-amber-100",
    emerald: "border-emerald-400/20 bg-emerald-500/12 text-emerald-100",
  }[tone];

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${toneStyles}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function playAlertTone() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.28);
  } catch {
    // Ignore browser audio failures quietly.
  }
}
