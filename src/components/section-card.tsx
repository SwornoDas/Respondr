import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  className?: string;
  children?: ReactNode;
};

export function SectionCard({
  title,
  description,
  eyebrow,
  className = "",
  children,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-[28px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[0_20px_80px_rgba(9,23,30,0.08)] md:p-7 ${className}`}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-ink)]">
          {eyebrow}
        </p>
      ) : null}
      <div className={eyebrow ? "mt-3" : ""}>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink-strong)] md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-ink)] md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
