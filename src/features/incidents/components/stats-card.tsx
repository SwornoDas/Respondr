import { type LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "rose" | "amber" | "emerald" | "violet";
};

export function StatsCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "rose",
}: StatsCardProps) {
  const toneMap = {
    rose: {
      card: "border-rose-500/15 bg-gradient-to-br from-rose-500/8 to-transparent",
      icon: "border-rose-500/20 bg-rose-500/10 text-rose-400",
      value: "text-rose-50",
    },
    amber: {
      card: "border-amber-500/15 bg-gradient-to-br from-amber-500/8 to-transparent",
      icon: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      value: "text-amber-50",
    },
    emerald: {
      card: "border-emerald-500/15 bg-gradient-to-br from-emerald-500/8 to-transparent",
      icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      value: "text-emerald-50",
    },
    violet: {
      card: "border-violet-500/15 bg-gradient-to-br from-violet-500/8 to-transparent",
      icon: "border-violet-500/20 bg-violet-500/10 text-violet-400",
      value: "text-violet-50",
    },
  };

  const styles = toneMap[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${styles.card}`}
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            {title}
          </p>
          <div className={`text-3xl font-bold tracking-tight ${styles.value}`}>
            {value}
          </div>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/35">{helper}</p>
    </div>
  );
}
