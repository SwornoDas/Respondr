export const dynamic = 'force-dynamic';
import { StaffBoard } from "@/features/incidents/components/staff-board";
import { listIncidents, listOnlineStaff } from "@/features/incidents/server/store";

export default async function StaffPage() {
  const [incidents, onlineStaff] = await Promise.all([
    listIncidents(),
    listOnlineStaff(),
  ]);

  return <StaffBoard initialIncidents={incidents} onlineStaff={onlineStaff} />;
}
