export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

import { incidentStatuses } from "@/features/incidents/types";
import { updateIncidentStatus } from "@/features/incidents/server/store";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: string;
      assignedStaffId?: string | null;
    };

    if (
      !body.status ||
      !incidentStatuses.includes(body.status as (typeof incidentStatuses)[number])
    ) {
      return NextResponse.json(
        { message: "A valid incident status is required." },
        { status: 400 },
      );
    }

    const incident = await updateIncidentStatus(id, {
      status: body.status as (typeof incidentStatuses)[number],
      assignedStaffId: body.assignedStaffId ?? undefined,
    });

    if (!incident) {
      return NextResponse.json({ message: "Incident not found." }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch {
    return NextResponse.json(
      { message: "Unable to update incident." },
      { status: 500 },
    );
  }
}
