export const dynamic = "force-dynamic";
import { IncidentDashboard } from "@/features/incidents/components/IncidentDashboard";
import { seedIncidents, seedStaff } from "@/features/incidents/mock-data";
import {
  listIncidents,
  listOnlineStaff,
} from "@/features/incidents/server/store";

export default async function AdminPage() {
  const [incidents, onlineStaff] = await Promise.all([
    listIncidents(),
    listOnlineStaff(),
  ]);

  const initialIncidents = incidents.length > 0 ? incidents : seedIncidents;
  const initialStaff = onlineStaff.length > 0 ? onlineStaff : seedStaff;

  return (
    <IncidentDashboard
      initialIncidents={initialIncidents}
      initialStaff={initialStaff}
    />
  );
}
