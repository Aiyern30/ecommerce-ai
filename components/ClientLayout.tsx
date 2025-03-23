"use client";

import { usePathname } from "next/navigation";
import { Layout } from "@/components/Layout";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = pathname.startsWith("/Staff");

  return isStaffRoute ? <>{children}</> : <Layout>{children}</Layout>;
}
