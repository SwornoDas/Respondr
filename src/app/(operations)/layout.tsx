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
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/20 bg-[rgba(11,29,38,0.78)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-2">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-white/60">
                Respondr
              </div>
              <div className="text-base font-semibold">Emergency operations</div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/12 hover:text-white"
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
