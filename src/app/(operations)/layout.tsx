import type { ReactNode } from "react";
import Link from "next/link";
import { BellRing } from "lucide-react";

import { experienceLinks } from "@/lib/navigation";

export default function OperationsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const links = experienceLinks.filter((item) => item.href !== "/");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef5f8_100%)]">
      <header className="sticky top-0 z-20 border-b border-slate-900/10 bg-[rgba(248,250,252,0.84)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-500 to-orange-500 p-2 text-white shadow-[0_12px_30px_rgba(225,29,72,0.18)]">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">
                Respondr
              </div>
              <div className="text-base font-semibold text-slate-900">
                Emergency operations
              </div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}
