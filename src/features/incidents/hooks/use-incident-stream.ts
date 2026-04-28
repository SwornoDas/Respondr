"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { IncidentRecord } from "../types";
import {
  mergeIncident,
  sortIncidentsByNewest,
  getPriorityForIncident,
} from "../utils";

type SocketPayload =
  | IncidentRecord
  | {
      incident?: IncidentRecord;
      data?: IncidentRecord;
      payload?: IncidentRecord;
      record?: IncidentRecord;
    }
  | Record<string, unknown>;

const realtimeEvents = [
  "new_incident",
  "status_updated",
  "assignment_done",
  "incident_assigned",
] as const;

function normalizeIncidentPayload(
  payload: SocketPayload,
): IncidentRecord | null {
  if (
    payload &&
    "id" in payload &&
    "category" in payload &&
    "roomNumber" in payload
  ) {
    return payload as IncidentRecord;
  }

  const candidate =
    (payload && "incident" in payload && payload.incident) ||
    (payload && "data" in payload && payload.data) ||
    (payload && "payload" in payload && payload.payload) ||
    (payload && "record" in payload && payload.record) ||
    null;

  if (
    candidate &&
    typeof candidate === "object" &&
    "id" in candidate &&
    "category" in candidate &&
    "roomNumber" in candidate
  ) {
    return candidate as IncidentRecord;
  }

  return null;
}

export function useIncidentStream(initialIncidents: IncidentRecord[]) {
  const [incidents, setIncidents] = useState(() =>
    sortIncidentsByNewest(initialIncidents),
  );
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "disconnected"
  >(() =>
    process.env.NEXT_PUBLIC_SOCKET_URL?.trim() ? "connecting" : "disconnected",
  );
  const socketRef = useRef<Socket | null>(null);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || "";

  const emitIncidentEvent = (
    eventName: (typeof realtimeEvents)[number],
    payload: IncidentRecord,
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, payload);
    }
  };

  useEffect(() => {
    if (!socketUrl) {
      return;
    }

    const socket = io(socketUrl, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const handleConnect = () => setConnectionState("connected");
    const handleDisconnect = () => setConnectionState("disconnected");
    const handleIncoming = (payload: SocketPayload) => {
      const record = normalizeIncidentPayload(payload);
      if (!record) return;

      const updatedIncident: IncidentRecord = {
        ...record,
        priority:
          record.priority ??
          getPriorityForIncident(record.category, record.description),
      };

      setIncidents((current) => mergeIncident(current, updatedIncident));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    for (const eventName of realtimeEvents) {
      socket.on(eventName, handleIncoming);
    }

    return () => {
      for (const eventName of realtimeEvents) {
        socket.off(eventName, handleIncoming);
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl]);

  return { incidents, setIncidents, connectionState, emitIncidentEvent };
}
