export const dynamic = 'force-dynamic';
import { AdminDashboard } from "@/features/incidents/components/admin-dashboard";
import { listIncidents } from "@/features/incidents/server/store";

export default async function AdminPage() {
  const incidents = await listIncidents();

  return <AdminDashboard initialIncidents={incidents} />;
}
