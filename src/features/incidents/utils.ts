import { priorityStyles, statusStyles } from "./constants";
import type { IncidentCategory, IncidentPriority, IncidentRecord, IncidentStatus } from "./types";

export function sortIncidentsByNewest(incidents: IncidentRecord[]) {
  return [...incidents].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function mergeIncident(
  incidents: IncidentRecord[],
  incident: IncidentRecord,
) {
  const remaining = incidents.filter((item) => item.id !== incident.id);
  return sortIncidentsByNewest([incident, ...remaining]);
}

export function formatIncidentStatus(status: IncidentStatus) {
  return status.toLowerCase().replaceAll("_", " ");
}

export function formatRelativeTime(value: string) {
  const difference = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(difference / 60000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function getStatusClasses(status: IncidentStatus) {
  return statusStyles[status];
}

export function getPriorityClasses(priority: IncidentPriority) {
  return priorityStyles[priority];
}

export function getPriorityForIncident(
  category: IncidentCategory,
  description: string,
): IncidentPriority {
  const lowered = description.toLowerCase();

  if (
    category === "Fire" ||
    lowered.includes("smoke") ||
    lowered.includes("unconscious") ||
    lowered.includes("collapse")
  ) {
    return "Critical";
  }

  if (category === "Medical") {
    return "High";
  }

  return "Moderate";
}
