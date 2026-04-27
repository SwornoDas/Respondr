import type { IncidentCategory, IncidentPriority, IncidentStatus } from "./types";

export const categoryCopy: Record<
  IncidentCategory,
  { headline: string; supporting: string }
> = {
  Medical: {
    headline: "Medical assistance",
    supporting: "Route urgent injuries, illness, and wellness escalations immediately.",
  },
  Fire: {
    headline: "Fire or smoke",
    supporting: "Trigger the fastest possible path to responders and command staff.",
  },
  Security: {
    headline: "Security threat",
    supporting: "Coordinate security, guest communication, and management visibility.",
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
  REPORTED: "bg-amber-100 text-amber-800 border border-amber-200",
  ACKNOWLEDGED: "bg-sky-100 text-sky-800 border border-sky-200",
  IN_PROGRESS: "bg-violet-100 text-violet-800 border border-violet-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

export const priorityStyles: Record<IncidentPriority, string> = {
  Critical: "bg-rose-100 text-rose-800 border border-rose-200",
  High: "bg-orange-100 text-orange-800 border border-orange-200",
  Moderate: "bg-slate-100 text-slate-700 border border-slate-200",
};
