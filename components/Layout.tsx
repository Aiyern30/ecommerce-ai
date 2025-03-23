"use client";

import { usePathname } from "next/navigation";
import { CustomerLayout } from "@/components/CustomerLayout";
import StaffLayout from "./StaffLayout";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = pathname.startsWith("/Staff");

  return isStaffRoute ? (
    <>
      <StaffLayout>{children}</StaffLayout>
    </>
  ) : (
    <CustomerLayout>{children}</CustomerLayout>
  );
}
