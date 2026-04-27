"use client";

import { startTransition, useDeferredValue, useState, type ComponentType } from "react";
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
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.error('Audio alert failed:', e);
      }
    };

    const reportedIncidents = incidents.filter(i => i.status === 'REPORTED');
    const prevCount = localStorage.getItem('lastReportedCount');
    const currentCount = reportedIncidents.length;

    if (prevCount !== null && currentCount > parseInt(prevCount)) {
      playAlertSound();
    }
    localStorage.setItem('lastReportedCount', currentCount.toString());
  }, [incidents]);

  const filteredIncidents = incidents.filter((incident) => {
    if (statusFilter !== "ALL" && incident.status !== statusFilter) {
      return false;
    }

    if (!deferredSearch) {
      return true;
    }

    return [incident.roomNumber, incident.description, incident.category, incident.id]
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

  async function updateStatus(incident: IncidentRecord, nextStatus: IncidentStatus) {
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
    <div className="space-y-6">
      <SectionCard
        eyebrow="Admin Command"
        title="Coordinate every active incident from one place"
        description="This dashboard keeps triage, acknowledgement, and resolution behavior in a dedicated operations experience rather than in the guest page."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Active incidents"
            value={String(activeCount)}
            icon={BellRing}
            accent="bg-rose-100 text-rose-800"
          />
          <MetricCard
            title="Awaiting acknowledgement"
            value={String(unclaimedCount)}
            icon={Clock3}
            accent="bg-amber-100 text-amber-800"
          />
          <MetricCard
            title="In progress"
            value={String(inFlightCount)}
            icon={ShieldCheck}
            accent="bg-sky-100 text-sky-800"
          />
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Response Queue"
        title="Incident feed"
        description="Search across room numbers, incident types, and descriptions while the socket hook stays ready for live events."
        className="bg-[rgba(11,29,38,0.9)] text-white"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search incidents by room, id, or description"
              className="w-full rounded-2xl border border-white/10 bg-white/8 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/36 focus:border-white/30"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {statusFilterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === option
                    ? "bg-white text-slate-900"
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
                    <p className="mt-2 max-w-3xl text-sm text-white/70">
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
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
      <div className={`inline-flex rounded-2xl p-3 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-3xl font-semibold text-[var(--ink-strong)]">{value}</div>
      <p className="mt-2 text-sm text-[var(--muted-ink)]">{title}</p>
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
