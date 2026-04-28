import type { ReactNode } from "react";

export const metadata = {
  title: "Respondr — Command Center",
  description:
    "Live emergency command center for incident management and response coordination.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {children}
    </div>
  );
}
