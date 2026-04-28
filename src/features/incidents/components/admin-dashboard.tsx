"use client";

import {
  useEffect,
  startTransition,
  useDeferredValue,
  useState,
  type ComponentType,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  BellRing,
  Clock3,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { SectionCard } from "@/components/section-card";

import { useIncidentStream } from "../hooks/use-incident-stream";
import type { IncidentRecord, IncidentStatus } from "../types";
import {
  formatIncidentStatus,
  formatRelativeTime,
  getPriorityClasses,
  getStatusClasses,
  mergeIncident,
} from "../utils";

const statusFilterOptions = [
  "ALL",
  "REPORTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
] as const;

export function AdminDashboard({
  initialIncidents,
}: {
  initialIncidents: IncidentRecord[];
}) {
  const { incidents, setIncidents } = useIncidentStream(initialIncidents);
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusFilterOptions)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  // Audio alert logic
  useEffect(() => {
    const playAlertSound = () => {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioContextClass) return;

        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.error("Audio alert failed:", e);
      }
    };

    const reportedIncidents = incidents.filter((i) => i.status === "REPORTED");
    const prevCount = localStorage.getItem("lastReportedCount");
    const currentCount = reportedIncidents.length;

    if (prevCount !== null && currentCount > parseInt(prevCount)) {
      playAlertSound();
    }
    localStorage.setItem("lastReportedCount", currentCount.toString());
  }, [incidents]);

  const filteredIncidents = incidents.filter((incident) => {
    if (statusFilter !== "ALL" && incident.status !== statusFilter) {
      return false;
    }

    if (!deferredSearch) {
      return true;
    }

    return [
      incident.roomNumber,
      incident.description,
      incident.category,
      incident.id,
    ]
      .join(" ")
      .toLowerCase()
      .includes(deferredSearch);
  });

  const activeCount = incidents.filter(
    (incident) => incident.status !== "RESOLVED",
  ).length;
  const unclaimedCount = incidents.filter(
    (incident) => incident.status === "REPORTED",
  ).length;
  const inFlightCount = incidents.filter(
    (incident) =>
      incident.status === "ACKNOWLEDGED" || incident.status === "IN_PROGRESS",
  ).length;
  const resolvedCount = incidents.filter(
    (incident) => incident.status === "RESOLVED",
  ).length;
  const totalCount = incidents.length;
  const responseRate =
    totalCount === 0 ? 0 : Math.round((resolvedCount / totalCount) * 100);
  const latestIncident = incidents[0];

  async function updateStatus(
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

  return (
    <div className="space-y-6 md:space-y-7">
      <SectionCard
        eyebrow="Admin Command"
        title="Coordinate every active incident from one place"
        description="A focused operations console for triage, acknowledgement, and resolution. The layout keeps the critical queue visible first, then moves into the individual incident worklist."
        className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(9,23,30,0.98),rgba(13,34,44,0.95))] text-white shadow-[0_28px_90px_rgba(2,6,23,0.22)]"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-24 top-0 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
                  Live operations
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/65">
                  {totalCount} incidents tracked
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Command the queue without losing the signal.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                Triage stays fast when the most important details are surfaced
                first: current load, response progress, and the newest
                escalation.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-[1.1fr_1fr_1fr]">
            <MetricCard
              title="Active incidents"
              value={String(activeCount)}
              icon={BellRing}
              accent="bg-rose-500/15 text-rose-100 ring-1 ring-inset ring-rose-400/20"
              tone="text-white"
              helper="Require triage now"
            />
            <MetricCard
              title="Awaiting acknowledgement"
              value={String(unclaimedCount)}
              icon={Clock3}
              accent="bg-amber-400/15 text-amber-100 ring-1 ring-inset ring-amber-300/20"
              tone="text-white"
              helper="Still waiting on a responder"
            />
            <MetricCard
              title="Response completion"
              value={`${responseRate}%`}
              icon={ShieldCheck}
              accent="bg-emerald-400/15 text-emerald-100 ring-1 ring-inset ring-emerald-300/20"
              tone="text-white"
              helper={`${resolvedCount} resolved of ${totalCount || 0}`}
            />
          </div>

          <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/6 p-4 md:grid-cols-3">
            <SummaryChip
              label="Unclaimed"
              value={unclaimedCount}
              tone="text-amber-100"
            />
            <SummaryChip
              label="In progress"
              value={inFlightCount}
              tone="text-sky-100"
            />
            <SummaryChip
              label="Resolved"
              value={resolvedCount}
              tone="text-emerald-100"
            />
          </div>

          <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/6 p-4 md:grid-cols-[1.4fr_0.9fr] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                Latest escalation
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80">
                  {latestIncident ? latestIncident.category : "No incidents"}
                </span>
                <span className="text-sm text-white/60">
                  {latestIncident
                    ? `Room ${latestIncident.roomNumber}`
                    : "Queue is clear"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {latestIncident
                  ? latestIncident.description || "No description provided."
                  : "When a new report arrives, it will appear here with the freshest status and quickest action path."}
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                Operational snapshot
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-white/72">
                <div>
                  <div className="text-xl font-semibold text-white">
                    {totalCount}
                  </div>
                  <div className="mt-1 text-white/55">Tracked incidents</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-white">
                    {activeCount}
                  </div>
                  <div className="mt-1 text-white/55">Need attention</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Response Queue"
        title="Incident feed"
        description="Search across room numbers, incident types, and descriptions while the socket hook stays ready for live events."
        className="bg-[rgba(11,29,38,0.94)] text-white shadow-[0_24px_80px_rgba(2,6,23,0.18)]"
      >
        <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/6 p-4 md:grid-cols-[1.25fr_auto] md:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search incidents by room, id, or description"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/35 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/36 focus:border-white/30 focus:bg-slate-950/45"
            />
          </label>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {statusFilterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === option
                    ? "bg-white text-slate-900 shadow-sm"
                    : "border border-white/10 bg-white/6 text-white/74 hover:bg-white/12"
                }`}
              >
                {option === "ALL" ? "All" : formatIncidentStatus(option)}
              </button>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
            <TriangleAlert className="mt-0.5 h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {filteredIncidents.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/6 p-6 text-sm text-white/62">
              No incidents match the current filters.
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <article
                key={incident.id}
                className="rounded-[28px] border border-white/10 bg-white/7 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.18)] transition hover:border-white/18 hover:bg-white/8"
              >
                <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr] md:items-start">
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
                      <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-white/72">
                        #{incident.id}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-[1.7rem]">
                      {incident.category} in {incident.roomNumber}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
                      {incident.description || "No description provided."}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4 text-sm text-white/72 md:text-right">
                    <div className="text-white/45">Reported</div>
                    <div className="mt-1 text-base font-semibold text-white">
                      {formatRelativeTime(incident.createdAt)}
                    </div>
                    <div className="mt-3 text-white/55">
                      Incident {incident.id}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {incident.status === "REPORTED" ? (
                    <ActionButton
                      label="Acknowledge"
                      disabled={pendingId === incident.id}
                      onClick={() => updateStatus(incident, "ACKNOWLEDGED")}
                    />
                  ) : null}
                  {incident.status === "ACKNOWLEDGED" ? (
                    <ActionButton
                      label="Mark in progress"
                      disabled={pendingId === incident.id}
                      onClick={() => updateStatus(incident, "IN_PROGRESS")}
                    />
                  ) : null}
                  {incident.status === "IN_PROGRESS" ? (
                    <ActionButton
                      label="Resolve incident"
                      disabled={pendingId === incident.id}
                      onClick={() => updateStatus(incident, "RESOLVED")}
                    />
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  accent,
  tone = "text-[var(--ink-strong)]",
  helper,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  tone?: string;
  helper?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
      <div className={`inline-flex rounded-2xl p-3 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={`mt-4 text-3xl font-semibold tracking-tight ${tone}`}>
        {value}
      </div>
      <p className="mt-2 text-sm text-white/70">{title}</p>
      {helper ? (
        <p className="mt-3 text-xs leading-5 text-white/48">{helper}</p>
      ) : null}
    </div>
  );
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-slate-950/28 px-4 py-3">
      <span className="text-sm text-white/58">{label}</span>
      <span className={`text-lg font-semibold ${tone}`}>{value}</span>
    </div>
  );
}

function ActionButton({
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
      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/86 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
