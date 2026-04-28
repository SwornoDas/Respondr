import type {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
} from "./types";

export const categoryCopy: Record<
  IncidentCategory,
  { headline: string; supporting: string }
> = {
  Medical: {
    headline: "Medical assistance",
    supporting:
      "Route urgent injuries, illness, and wellness escalations immediately.",
  },
  Fire: {
    headline: "Fire or smoke",
    supporting:
      "Trigger the fastest possible path to responders and command staff.",
  },
  Security: {
    headline: "Security threat",
    supporting:
      "Coordinate security, guest communication, and management visibility.",
  },
};

export const escalationTimeline = [
  {
    time: "T = 0s",
    title: "Incident is recorded",
    description:
      "The guest report lands in the incident service and is visible to the response team right away.",
  },
  {
    time: "T = 15s",
    title: "Reminder escalation",
    description:
      "If nobody acknowledges the alert, the system can trigger the next reminder or broadcast path.",
  },
  {
    time: "T = 30s",
    title: "Escalate to voice or leadership",
    description:
      "Twilio voice, fallback managers, and high-priority flows can be layered in here without changing the guest UI.",
  },
  {
    time: "Resolution",
    title: "Close the loop",
    description:
      "Staff marks the incident resolved, creating one final source of truth for guests and operators.",
  },
];

export const statusStyles: Record<IncidentStatus, string> = {
  REPORTED: "border border-red-400/30 bg-red-500/15 text-red-100",
  ACKNOWLEDGED: "border border-sky-400/25 bg-sky-500/15 text-sky-100",
  IN_PROGRESS: "border border-amber-400/25 bg-amber-500/15 text-amber-100",
  RESOLVED: "border border-emerald-400/25 bg-emerald-500/15 text-emerald-100",
};

export const priorityStyles: Record<IncidentPriority, string> = {
  Critical: "border border-slate-500/40 bg-slate-800/70 text-slate-100",
  High: "border border-amber-400/25 bg-amber-500/12 text-amber-100",
  Moderate: "border border-slate-500/25 bg-slate-800/45 text-slate-200",
};
