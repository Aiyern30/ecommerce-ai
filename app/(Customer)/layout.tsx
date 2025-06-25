"use client";

import { CustomerLayout } from "@/components/CustomerLayout";

export default function CustomerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayout>{children}</CustomerLayout>;
}
