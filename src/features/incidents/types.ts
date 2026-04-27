export const incidentCategories = ["Medical", "Fire", "Security"] as const;
export const incidentStatuses = [
  "REPORTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
] as const;
export const incidentPriorities = ["Critical", "High", "Moderate"] as const;

export type IncidentCategory = (typeof incidentCategories)[number];
export type IncidentStatus = (typeof incidentStatuses)[number];
export type IncidentPriority = (typeof incidentPriorities)[number];

export type IncidentRecord = {
  id: string;
  category: IncidentCategory;
  roomNumber: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  createdAt: string;
  guestPhone?: string;
  assignedStaffId?: string | null;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  phoneNumber: string;
  isOnline: boolean;
  currentAssignment?: string | null;
  responseWindowSeconds: number;
};

export type CreateIncidentInput = {
  category: IncidentCategory;
  roomNumber: string;
  description: string;
  guestPhone?: string;
};

export type UpdateIncidentStatusInput = {
  status: IncidentStatus;
  assignedStaffId?: string | null;
};
