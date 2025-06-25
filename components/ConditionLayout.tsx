"use client";

import { usePathname } from "next/navigation";
import { Layout } from "@/components/Layout";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/SignUp");

  if (isAuthPage) return <>{children}</>;

  return <Layout>{children}</Layout>;
}
