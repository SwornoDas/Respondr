import { type LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "blue" | "amber" | "emerald" | "violet";
};

export function StatsCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "blue",
}: StatsCardProps) {
  const toneStyles = {
    blue: "border-[#1F2A37] bg-[linear-gradient(180deg,rgba(11,15,20,0.96),rgba(18,24,33,0.96))]",
    amber:
      "border-[#1F2A37] bg-[linear-gradient(180deg,rgba(11,15,20,0.96),rgba(20,19,12,0.96))]",
    emerald:
      "border-[#1F2A37] bg-[linear-gradient(180deg,rgba(11,15,20,0.96),rgba(10,18,15,0.96))]",
    violet:
      "border-[#1F2A37] bg-[linear-gradient(180deg,rgba(11,15,20,0.96),rgba(17,15,31,0.96))]",
  }[tone];

  const iconStyles = {
    blue: "border-[#3B82F6]/20 bg-[#3B82F6]/12 text-[#93C5FD]",
    amber: "border-[#F59E0B]/20 bg-[#F59E0B]/12 text-[#FCD34D]",
    emerald: "border-[#10B981]/20 bg-[#10B981]/12 text-[#6EE7B7]",
    violet: "border-[#8B5CF6]/20 bg-[#8B5CF6]/12 text-[#C4B5FD]",
  }[tone];

  return (
    <div
      className={`rounded-[24px] border p-4 shadow-[0_16px_45px_rgba(0,0,0,0.18)] ${toneStyles}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
            {title}
          </p>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-[#E5E7EB]">
            {value}
          </div>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconStyles}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#9CA3AF]">{helper}</p>
    </div>
  );
}
