"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Flame,
  HeartPulse,
  ShieldAlert,
  Siren,
} from "lucide-react";

import { SectionCard } from "@/components/section-card";

import { categoryCopy } from "../constants";
import type { IncidentCategory, IncidentRecord } from "../types";

const categories = [
  {
    value: "Medical" as const,
    icon: HeartPulse,
    tone: "from-rose-500 to-red-600",
  },
  {
    value: "Fire" as const,
    icon: Flame,
    tone: "from-orange-500 to-red-500",
  },
  {
    value: "Security" as const,
    icon: ShieldAlert,
    tone: "from-sky-600 to-cyan-500",
  },
];

export function GuestSosForm() {
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | null>(
    null,
  );
  const [roomNumber, setRoomNumber] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportedIncident, setReportedIncident] = useState<IncidentRecord | null>(
    null,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCategory || !roomNumber.trim()) {
      setErrorMessage("Choose a category and enter the room number first.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          roomNumber,
          guestPhone,
          description,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "Unable to dispatch the alert.");
      }

      const incident = (await response.json()) as IncidentRecord;
      setReportedIncident(incident);
      setRoomNumber("");
      setGuestPhone("");
      setDescription("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to dispatch the alert.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (reportedIncident) {
    return (
      <SectionCard
        eyebrow="Incident Created"
        title="Help is on the way"
        description={`Incident ${reportedIncident.id} for room ${reportedIncident.roomNumber} has been reported. Staff dashboards can now pick it up immediately.`}
        className="bg-[linear-gradient(180deg,rgba(184,50,38,0.95),rgba(243,115,53,0.92))] text-white"
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/82">
            Stay where it is safest. If the situation changes, create another alert with the
            latest details.
          </div>
          <button
            type="button"
            onClick={() => {
              setReportedIncident(null);
              setSelectedCategory(null);
              setErrorMessage("");
            }}
            className="w-full rounded-2xl border border-white/15 bg-white/12 px-5 py-4 text-sm font-semibold transition hover:bg-white/18"
          >
            Report another emergency
          </button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      eyebrow="Live Intake"
      title="Trigger a response"
      description="This form is wired to the internal incident route handler so the project already has a clean handoff between UI and server logic."
      className="bg-[rgba(11,29,38,0.9)] text-white"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const selected = selectedCategory === category.value;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`rounded-[26px] border p-5 text-left transition ${
                  selected
                    ? "border-white/40 bg-white/14"
                    : "border-white/10 bg-white/6 hover:bg-white/10"
                }`}
              >
                <div
                  className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${category.tone}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">
                  {categoryCopy[category.value].headline}
                </h2>
                <p className="mt-2 text-sm text-white/68">
                  {categoryCopy[category.value].supporting}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-white/78">Room or location</span>
            <input
              required
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
              placeholder="Room 304 or Pool Deck"
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none transition placeholder:text-white/36 focus:border-white/30"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-white/78">Guest phone</span>
            <input
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
              placeholder="+1 202 555 0124"
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none transition placeholder:text-white/36 focus:border-white/30"
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm">
          <span className="font-medium text-white/78">What is happening?</span>
          <textarea
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Share anything the response team should know right now."
            className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-white outline-none transition placeholder:text-white/36 focus:border-white/30"
          />
        </label>

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,#b83226,#f37335)] px-5 py-4 text-base font-semibold text-white shadow-[0_16px_40px_rgba(184,50,38,0.34)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Siren className="h-5 w-5" />
          {isSubmitting ? "Dispatching alert..." : "Trigger emergency response"}
        </button>
      </form>
    </SectionCard>
  );
}
