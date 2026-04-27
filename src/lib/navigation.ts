import type { LucideIcon } from "lucide-react";
import { BellRing, LayoutDashboard, LifeBuoy, Smartphone } from "lucide-react";

export const experienceLinks: Array<{
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    href: "/",
    label: "Overview",
    description: "Project direction and architecture map.",
    icon: LayoutDashboard,
  },
  {
    href: "/sos",
    label: "Guest SOS",
    description: "Emergency intake for guests and visitors.",
    icon: LifeBuoy,
  },
  {
    href: "/admin",
    label: "Admin",
    description: "Command center for hotel operations.",
    icon: BellRing,
  },
  {
    href: "/staff",
    label: "Staff",
    description: "Responder-first mobile task board.",
    icon: Smartphone,
  },
];

export const repositoryLayers = [
  {
    path: "src/app",
    description:
      "Public routes and route handlers, using route groups to organize guest, admin, and staff experiences.",
  },
  {
    path: "src/features/incidents",
    description:
      "Incident domain: types, constants, mock data, client components, hooks, and server utilities.",
  },
  {
    path: "src/components",
    description:
      "Shared UI primitives that keep feature pages smaller and easier to scan.",
  },
  {
    path: "src/lib",
    description:
      "Cross-cutting app metadata and navigation helpers that are not tied to one feature.",
  },
  {
    path: "supabase/schema.sql",
    description:
      "The durable data contract for the incident model once the mock server store is replaced.",
  },
];
