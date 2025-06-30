"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardLayout from "./Dashboard/DashboardLayout";

interface LayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: LayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <DashboardLayout>{children}</DashboardLayout>
        <Toaster richColors />
      </SessionProvider>
    </ThemeProvider>
  );
}
