"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { IncidentRecord } from "../types";
import { mergeIncident, sortIncidentsByNewest, getPriorityForIncident } from "../utils";

export function useIncidentStream(initialIncidents: IncidentRecord[]) {
  const [incidents, setIncidents] = useState(() =>
    sortIncidentsByNewest(initialIncidents),
  );

  useEffect(() => {
    const channel = supabase
      .channel('public:incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        (payload) => {
          const record = payload.new as {
            id: string;
            type: IncidentRecord['category'];
            room: string;
            description: string;
            status: IncidentRecord['status'];
            timestamp: string;
            assigned_to: string | null;
          };
          if (!record) return;

          const updatedIncident: IncidentRecord = {
            id: record.id,
            category: record.type,
            roomNumber: record.room,
            description: record.description,
            status: record.status,
            priority: getPriorityForIncident(record.type, record.description),
            createdAt: record.timestamp,
            guestPhone: '',
            assignedStaffId: record.assigned_to,
          };

          setIncidents((current) => mergeIncident(current, updatedIncident));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { incidents, setIncidents };
}
