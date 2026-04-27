import { Clock3, RadioTower, ShieldCheck } from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { GuestSosForm } from "@/features/incidents/components/guest-sos-form";
import { escalationTimeline } from "@/features/incidents/constants";

export default function SosPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <SectionCard
          eyebrow="Guest Experience"
          title="Emergency assistance in a few taps"
          description="This route is intentionally narrow: identify the emergency, capture the room, and dispatch without distracting the guest."
          className="bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,246,244,0.9))]"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-white/72 p-4">
              <RadioTower className="h-5 w-5 text-[var(--accent-strong)]" />
              <div className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
                Direct signal
              </div>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                Guest input posts to the incident route handler immediately.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/72 p-4">
              <Clock3 className="h-5 w-5 text-[var(--accent-strong)]" />
              <div className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
                Escalation timer
              </div>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                Acknowledge windows are short so critical incidents do not stall.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/72 p-4">
              <ShieldCheck className="h-5 w-5 text-[var(--accent-strong)]" />
              <div className="mt-3 text-sm font-semibold text-[var(--ink-strong)]">
                Audit friendly
              </div>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                Incident creation is separated from UI so it can be logged and expanded.
              </p>
            </div>
          </div>
        </SectionCard>

        <GuestSosForm />
      </div>

      <SectionCard
        eyebrow="Escalation Map"
        title="How the emergency flow unfolds"
        description="The interface is organized to support the no-human-touch workflow from the README."
        className="bg-[rgba(11,29,38,0.88)] text-white"
      >
        <div className="space-y-4">
          {escalationTimeline.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/6 p-4"
            >
              <div className="text-sm uppercase tracking-[0.22em] text-white/50">
                {step.time}
              </div>
              <h2 className="mt-2 text-lg font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-white/72">{step.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
