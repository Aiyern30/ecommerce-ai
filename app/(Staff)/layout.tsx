"use client";

import StaffLayout from "@/components/StaffLayout";

export default function StaffLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}
