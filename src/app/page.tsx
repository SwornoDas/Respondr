import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
} from "lucide-react";

import { experienceLinks } from "@/lib/navigation";

const features = [
  {
    title: "Instant SOS Intake",
    description:
      "One-tap emergency trigger for guests with instant room identification and category triage.",
    icon: Zap,
  },
  {
    title: "Centralized Response",
    description:
      "Real-time command center for hotel admin to track, manage, and escalate every incident.",
    icon: BellRing,
  },
  {
    title: "Mobile First Staff",
    description:
      "Dedicated mobile view for responders to receive tasks, navigate, and report status instantly.",
    icon: Smartphone,
  },
  {
    title: "Enterprise Security",
    description:
      "Secure, role-based access control with comprehensive audit logs for safety compliance.",
    icon: Lock,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card px-6 py-4 flex items-center justify-between mx-auto w-[95%] max-w-7xl mt-4 rounded-3xl">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Respondr"
            width={32}
            height={32}
            className="rounded-lg"
            style={{ width: "auto", height: "auto" }}
          />
          <span className="text-xl font-bold tracking-tight text-ink-strong">
            Respondr
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="#features"
            className="hover:text-accent transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="hover:text-accent transition-colors"
          >
            How it Works
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sos"
            className="bg-accent text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-accent-hover transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
          >
            Guest SOS
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Next-Gen Hospitality Safety</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-ink-strong leading-[1.1] mb-6">
              Emergency Response, <br />
              <span className="text-gradient">Simplified.</span>
            </h1>
            <p className="text-xl text-muted leading-relaxed mb-10 max-w-xl">
              Connect guests, staff, and admin in critical moments. Respondr
              provides real-time emergency coordination for modern hotels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sos"
                className="flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-accent-hover transition-all hover:translate-y-[-2px] shadow-xl shadow-accent/20"
              >
                Trigger Guest SOS
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:border-slate-300 transition-all hover:translate-y-[-2px]"
              >
                Admin Dashboard
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>PWA Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Real-time Triage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Twilio Integrated</span>
              </div>
            </div>
          </div>
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl animate-pulse" />
            <div className="relative animate-float">
              <Image
                src="/hero.png"
                alt="Emergency Response Platform"
                width={500}
                height={600}
                className="rounded-[40px] shadow-2xl"
                priority
                style={{ width: "100%", height: "auto", maxWidth: "500px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section id="how-it-works" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ink-strong mb-4">
              One Platform, Three Experiences
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Seamless coordination between every stakeholder in the hotel
              ecosystem during an emergency.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {experienceLinks
              .filter((l) => l.href !== "/")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative glass-card p-8 rounded-[32px] transition-all hover:scale-[1.02] hover:shadow-2xl border-transparent hover:border-accent/20"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                    <item.icon className="w-7 h-7 text-ink group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-muted leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Enter Portal
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-ink-strong mb-8 leading-tight">
                Everything you need to <br />
                <span className="text-gradient">Protect your Guests.</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {features.map((f, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <f.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h4 className="font-bold text-lg">{f.title}</h4>
                    <p className="text-sm text-muted leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
                <div className="h-48 rounded-3xl bg-accent/5" />
              </div>
              <div className="space-y-4">
                <div className="h-48 rounded-3xl bg-ink/5" />
                <div className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Image 
              src="/logo.png" 
              alt="Respondr" 
              width={24} 
              height={24} 
              style={{ width: "auto", height: "auto" }}
            />
            <span className="font-bold">Respondr</span>
            <span className="text-xs ml-2">© 2026 Hospitality Safety Inc.</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted">
            <Link href="#" className="hover:text-accent">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-accent">
              Terms of Service
            </Link>
            <Link
              href="#"
              className="hover:text-accent flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              English
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
