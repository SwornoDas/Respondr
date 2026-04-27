import { NextResponse } from "next/server";

import { createIncident, listIncidents } from "@/features/incidents/server/store";
import { incidentCategories } from "@/features/incidents/types";

export async function GET() {
  const incidents = await listIncidents();
  return NextResponse.json(incidents);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      category?: string;
      roomNumber?: string;
      description?: string;
      guestPhone?: string;
    };

    const category = body.category;
    const roomNumber = body.roomNumber?.trim();

    if (
      !category ||
      !incidentCategories.includes(category as (typeof incidentCategories)[number])
    ) {
      return NextResponse.json(
        { message: "A valid incident category is required." },
        { status: 400 },
      );
    }

    if (!roomNumber) {
      return NextResponse.json(
        { message: "Room number is required." },
        { status: 400 },
      );
    }

    const incident = await createIncident({
      category: category as (typeof incidentCategories)[number],
      roomNumber,
      description: body.description?.trim() ?? "",
      guestPhone: body.guestPhone?.trim() || undefined,
    });

    return NextResponse.json(incident, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to create incident." },
      { status: 500 },
    );
  }
}
