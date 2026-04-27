import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BrainCircuit,
  Building2,
  LifeBuoy,
  ShieldCheck,
  Smartphone,
  TimerReset,
} from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { experienceLinks, repositoryLayers } from "@/lib/navigation";

const architectureHighlights = [
  {
    title: "Rapid intake",
    description:
      "Guest SOS flows stay focused on speed, with category-first entry and room capture.",
    icon: LifeBuoy,
  },
  {
    title: "AI-assisted triage",
    description:
      "Incident services are separated so we can classify urgency and route responders without bloating the page layer.",
    icon: BrainCircuit,
  },
  {
    title: "Escalation-ready delivery",
    description:
      "Admin and staff experiences sit beside API routes so real-time notifications and fallback escalation can plug in cleanly.",
    icon: BellRing,
  },
  {
    title: "Operations visibility",
    description:
      "Shared incident types, mock data, and server utilities make the transition to Supabase and Twilio predictable.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-8 lg:px-12">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          eyebrow="Project Direction"
          title="Respondr is now organized around the real product, not the starter template."
          description="The app is split into guest, admin, and staff experiences, with shared incident domain logic and Next route handlers ready to become the backend-for-frontend layer."
          className="overflow-hidden bg-[linear-gradient(135deg,rgba(184,50,38,0.96),rgba(243,115,53,0.9))] text-white"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {experienceLinks
              .filter((item) => item.href !== "/")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/20 bg-white/10 p-4 transition hover:bg-white/16"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <item.icon className="h-5 w-5" />
                    <ArrowRight className="h-4 w-4 opacity-75" />
                  </div>
                  <h2 className="text-lg font-semibold">{item.label}</h2>
                  <p className="mt-2 text-sm text-white/80">{item.description}</p>
                </Link>
              ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Operational Shape"
          title="What changed"
          description="Instead of keeping everything in one client page, the repo now separates route concerns, feature logic, and server-side incident services."
        >
          <ul className="space-y-3 text-sm text-[var(--muted-ink)]">
            <li className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 text-[var(--accent-strong)]" />
              <span>`src/app` owns routes and route handlers.</span>
            </li>
            <li className="flex items-start gap-3">
              <Smartphone className="mt-0.5 h-4 w-4 text-[var(--accent-strong)]" />
              <span>`src/features/incidents` owns the emergency domain.</span>
            </li>
            <li className="flex items-start gap-3">
              <TimerReset className="mt-0.5 h-4 w-4 text-[var(--accent-strong)]" />
              <span>`src/lib` and `src/components` hold shared navigation and UI primitives.</span>
            </li>
          </ul>
        </SectionCard>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {architectureHighlights.map((item) => (
          <SectionCard
            key={item.title}
            title={item.title}
            description={item.description}
            className="bg-white/78"
          >
            <item.icon className="h-5 w-5 text-[var(--accent-strong)]" />
          </SectionCard>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          eyebrow="Repository Layers"
          title="Current structure"
          description="This layout stays close to Next 16 conventions while matching the crisis-response workflow from the README."
        >
          <div className="space-y-3">
            {repositoryLayers.map((layer) => (
              <div
                key={layer.path}
                className="rounded-2xl border border-[var(--line)] bg-white/70 p-4"
              >
                <div className="text-sm font-semibold text-[var(--ink-strong)]">
                  {layer.path}
                </div>
                <p className="mt-2 text-sm text-[var(--muted-ink)]">
                  {layer.description}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Next Build-Out"
          title="Best next implementation steps"
          description="The structure is ready for real integrations without forcing a premature split into a separate Express backend."
          className="bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(246,232,221,0.88))]"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] p-4">
              <h3 className="font-semibold text-[var(--ink-strong)]">Data layer</h3>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                Replace the in-memory incident store with Supabase tables and policies from
                `supabase/schema.sql`.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] p-4">
              <h3 className="font-semibold text-[var(--ink-strong)]">Realtime</h3>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                Point `NEXT_PUBLIC_SOCKET_URL` at a websocket service and the dashboards will
                start listening without changing route structure.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] p-4">
              <h3 className="font-semibold text-[var(--ink-strong)]">Escalation</h3>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                Add Twilio orchestration under server services, not inside pages, so retries
                and audit logs stay testable.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] p-4">
              <h3 className="font-semibold text-[var(--ink-strong)]">Auth and roles</h3>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                Gate `/admin` and `/staff` through Supabase Auth while leaving `/sos` open for
                guests.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
