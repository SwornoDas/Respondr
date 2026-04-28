"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  BellRing,
  Building2,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";

import { useIncidentStream } from "../hooks/use-incident-stream";
import type { IncidentRecord, IncidentStatus, StaffMember } from "../types";
import { formatRelativeTime, mergeIncident } from "../utils";
import { IncidentCard } from "./IncidentCard";
import { StaffList, type StaffListItem } from "./StaffList";
import { StatsCard } from "./StatsCard";

type IncidentDashboardProps = {
  initialIncidents: IncidentRecord[];
  initialStaff: StaffMember[];
};

const socketEvents = {
  assignment: "incident_assigned",
  status: "status_updated",
} as const;

const sidebarNav = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BellRing, label: "Incidents", active: false },
  { icon: Users, label: "Staff", active: false },
  { icon: Activity, label: "Analytics", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function IncidentDashboard({
  initialIncidents,
  initialStaff,
}: IncidentDashboardProps) {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "ALL">(
    "ALL",
  );
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

  const filteredIncidents = useMemo(() => {
    if (filterStatus === "ALL") return incidents;
    return incidents.filter((i) => i.status === filterStatus);
  }, [incidents, filterStatus]);

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

  const reportedCount = incidents.filter((i) => i.status === "REPORTED").length;
  const inProgressCount = incidents.filter(
    (i) => i.status === "IN_PROGRESS",
  ).length;

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          assignedStaffId: incident.assignedStaffId ?? null,
        }),
      });

      if (!response.ok) throw new Error("Unable to update the incident.");

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: incident.status,
          assignedStaffId: staff.id,
        }),
      });

      if (!response.ok) throw new Error("Unable to assign the incident.");

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
    : "No incidents";

  return (
    <div className="flex h-screen overflow-hidden bg-[#080b10] text-white/80">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.04] bg-[#0a0e14] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/[0.04] px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/20">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              Respondr
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-400/60">
              Command Center
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-white/30 hover:bg-white/5 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarNav.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                item.active
                  ? "bg-gradient-to-r from-rose-500/10 to-orange-500/5 text-white border border-rose-500/15"
                  : "text-white/35 hover:bg-white/[0.04] hover:text-white/60"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/15 to-orange-500/15 text-xs font-bold text-rose-300">
              OH
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/70 truncate">
                Olivia Hart
              </p>
              <p className="text-[10px] text-white/30">Administrator</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="rounded-lg p-2 text-white/25 transition hover:bg-white/5 hover:text-rose-400"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 border-b border-white/[0.04] bg-[#0a0e14]/80 px-4 py-3 backdrop-blur-xl lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              placeholder="Search incidents, rooms, staff..."
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 pl-9 pr-4 text-sm text-white/70 outline-none transition placeholder:text-white/20 focus:border-rose-500/25 focus:bg-white/[0.05]"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Connection badge */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold ${
                connectionState === "connected"
                  ? "border-emerald-500/15 bg-emerald-500/8 text-emerald-400"
                  : "border-amber-500/15 bg-amber-500/8 text-amber-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connectionState === "connected"
                    ? "bg-emerald-400"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              {connectionState === "connected" ? "Live" : "Connecting"}
            </span>

            {/* Time */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/40">
              <Clock3 className="h-3 w-3" />
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>

            {/* Notification bell */}
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
              className="relative rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-white/40 transition hover:text-rose-400"
            >
              <BellRing className="h-4 w-4" />
              {reportedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {reportedCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Page title */}
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white/90">
                Incident Command Center
              </h2>
              <p className="mt-0.5 text-xs text-white/35">
                Real-time emergency coordination for your property
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-white/35">
                <Building2 className="h-3 w-3" />
                Property HQ
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-white/35">
                <Sparkles className="h-3 w-3 text-rose-400/60" />
                {latestElapsed}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            <StatsCard
              title="Active Incidents"
              value={String(totalActive)}
              helper="Open incidents requiring attention"
              icon={BellRing}
              tone="rose"
            />
            <StatsCard
              title="Avg Response"
              value={`${avgResponseMinutes}m`}
              helper="Average response time active"
              icon={Clock3}
              tone="amber"
            />
            <StatsCard
              title="Resolved Today"
              value={String(resolvedToday)}
              helper="Successfully resolved incidents"
              icon={ShieldCheck}
              tone="emerald"
            />
            <StatsCard
              title="Staff Online"
              value={String(staffRoster.filter((s) => s.isOnline).length)}
              helper="Available responders on duty"
              icon={Users}
              tone="violet"
            />
          </div>

          {errorMessage ? (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          {/* Main grid */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
            {/* Incident feed */}
            <section className="space-y-4">
              {/* Filter tabs */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
                  {(
                    [
                      { key: "ALL", label: "All" },
                      { key: "REPORTED", label: "Reported" },
                      { key: "IN_PROGRESS", label: "Active" },
                      { key: "RESOLVED", label: "Resolved" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterStatus(tab.key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        filterStatus === tab.key
                          ? "bg-rose-500/12 text-rose-300 border border-rose-500/20"
                          : "text-white/30 hover:text-white/50 border border-transparent"
                      }`}
                    >
                      {tab.label}
                      {tab.key === "REPORTED" && reportedCount > 0 && (
                        <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-[9px] text-rose-300">
                          {reportedCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-white/25">
                  {filteredIncidents.length} incident
                  {filteredIncidents.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Incident list */}
              <div className="space-y-3">
                {filteredIncidents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.02] p-10 text-center text-sm text-white/25">
                    No incidents match this filter.
                  </div>
                ) : (
                  filteredIncidents.map((incident) => (
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
            </section>

            {/* Right sidebar panels */}
            <aside className="space-y-4">
              {/* Situation summary */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">
                  Situation Overview
                </h3>
                <div className="mt-4 space-y-2">
                  <SummaryRow
                    label="Reported"
                    value={reportedCount}
                    tone="red"
                  />
                  <SummaryRow
                    label="In Progress"
                    value={inProgressCount}
                    tone="amber"
                  />
                  <SummaryRow
                    label="Resolved"
                    value={resolvedToday}
                    tone="emerald"
                  />
                </div>
                <div className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-xs text-white/35">
                  Latest:{" "}
                  <span className="text-white/60">
                    {latestIncident
                      ? `${latestIncident.category} / Room ${latestIncident.roomNumber}`
                      : "None"}
                  </span>
                </div>
              </div>

              {/* Active responders */}
              <StaffList
                title="Active Responders"
                helperText="Staff handling incidents"
                items={activeResponderItems}
                emptyMessage="No responders assigned."
                footer={
                  <p className="text-[10px] leading-4 text-white/20">
                    Auto-updates when incidents are assigned or resolved.
                  </p>
                }
              />
            </aside>
          </div>
        </main>
      </div>

      {/* ── Assignment Panel (slide-over) ── */}
      {selectedIncident ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 w-full max-w-md border-l border-white/[0.06] bg-[#0a0e14] shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.04] p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400/60">
                    Assignment panel
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-white/90">
                    Assign Responder
                  </h2>
                  <p className="mt-1 text-xs text-white/35">
                    {selectedIncident.category} — Room{" "}
                    {selectedIncident.roomNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIncidentId(null)}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-white/40 transition hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-white/60">
                      Room {selectedIncident.roomNumber}
                    </span>
                    <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-white/40">
                      {selectedIncident.category}
                    </span>
                    <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-white/40">
                      {selectedIncident.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/40">
                    {selectedIncident.description}
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/25">
                    Available Staff
                  </p>
                  {staffRoster.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] p-5 text-xs text-white/25">
                      No staff available.
                    </div>
                  ) : (
                    <StaffList
                      title="Staff Roster"
                      helperText="Select a responder for this incident"
                      items={staffRoster}
                      emptyMessage="No staff available."
                      actionLabel="Assign Now"
                      onAction={(staff) =>
                        assignIncident(selectedIncident, staff)
                      }
                    />
                  )}
                </div>
              </div>
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
    red: "border-red-500/15 bg-red-500/5 text-red-300",
    amber: "border-amber-500/15 bg-amber-500/5 text-amber-300",
    emerald: "border-emerald-500/15 bg-emerald-500/5 text-emerald-300",
  }[tone];

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${toneStyles}`}
    >
      <span className="text-xs font-medium">{label}</span>
      <span className="text-sm font-bold">{value}</span>
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
