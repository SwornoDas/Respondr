import type { IncidentRecord, StaffMember } from "./types";

const now = Date.now();

export const seedIncidents: IncidentRecord[] = [
  {
    id: "INC-401",
    category: "Fire",
    roomNumber: "304",
    description: "Smoke reported near the bathroom vent.",
    status: "REPORTED",
    priority: "Critical",
    createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
    assignedStaffId: null,
  },
  {
    id: "INC-398",
    category: "Medical",
    roomNumber: "122",
    description: "Guest reports dizziness and chest tightness.",
    status: "ACKNOWLEDGED",
    priority: "High",
    createdAt: new Date(now - 9 * 60 * 1000).toISOString(),
    assignedStaffId: "staff-03",
  },
  {
    id: "INC-390",
    category: "Security",
    roomNumber: "Lobby",
    description: "Unidentified visitor refusing to leave the concierge desk.",
    status: "IN_PROGRESS",
    priority: "Moderate",
    createdAt: new Date(now - 18 * 60 * 1000).toISOString(),
    assignedStaffId: "staff-01",
  },
];

export const seedStaff: StaffMember[] = [
  {
    id: "staff-01",
    name: "Amara Singh",
    role: "Security Lead",
    phoneNumber: "+1 202 555 0108",
    isOnline: true,
    currentAssignment: "INC-390",
    responseWindowSeconds: 30,
  },
  {
    id: "staff-02",
    name: "Diego Alvarez",
    role: "Duty Manager",
    phoneNumber: "+1 202 555 0114",
    isOnline: true,
    responseWindowSeconds: 45,
  },
  {
    id: "staff-03",
    name: "Nina Patel",
    role: "Medical Response",
    phoneNumber: "+1 202 555 0141",
    isOnline: true,
    currentAssignment: "INC-398",
    responseWindowSeconds: 20,
  },
  {
    id: "staff-04",
    name: "Theo Campbell",
    role: "Facilities",
    phoneNumber: "+1 202 555 0155",
    isOnline: false,
    responseWindowSeconds: 30,
  },
];
