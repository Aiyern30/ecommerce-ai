"use client";

import { usePathname } from "next/navigation";
import { CustomerLayout } from "@/components/Layout";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = pathname.startsWith("/Staff");

  return isStaffRoute ? (
    <>{children}</>
  ) : (
    <CustomerLayout>{children}</CustomerLayout>
  );
}
