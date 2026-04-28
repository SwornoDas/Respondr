import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  className?: string;
  tone?: "light" | "dark";
  children?: ReactNode;
};

export function SectionCard({
  title,
  description,
  eyebrow,
  className = "",
  tone = "light",
  children,
}: SectionCardProps) {
  const isDark = tone === "dark";

  return (
    <section
      className={`rounded-[32px] border border-white/70 bg-white/84 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-md md:p-7 ${className}`}
    >
      {eyebrow ? (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.24em] ${
            isDark ? "text-white/50" : "text-slate-500"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <div className={eyebrow ? "mt-3" : ""}>
        <h1
          className={`text-2xl font-semibold tracking-tight md:text-3xl ${
            isDark ? "text-white" : "text-slate-950"
          }`}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={`mt-3 max-w-3xl text-sm leading-6 md:text-base ${
              isDark ? "text-white/68" : "text-slate-600"
            }`}
          >
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
