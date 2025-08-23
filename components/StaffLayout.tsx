"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";
import { Toaster } from "@/components/ui";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardLayout from "./Dashboard/DashboardLayout";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: LayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/401");
      } else if (
        user.user_metadata?.banned_at ||
        user.app_metadata?.ban_info?.banned_at
      ) {
        // User is banned, pass ban info via query string
        const reason =
          user.app_metadata?.ban_info?.reason ||
          user.user_metadata?.ban_reason ||
          "No reason provided";
        const bannedByName = user.app_metadata?.ban_info?.banned_by_name || "";
        const bannedByEmail =
          user.app_metadata?.ban_info?.banned_by_email || "";
        const bannedUntil = user.app_metadata?.ban_info?.banned_until || "";
        router.replace(
          `/403?banned=1` +
            `&reason=${encodeURIComponent(reason)}` +
            `&banned_by_name=${encodeURIComponent(bannedByName)}` +
            `&banned_by_email=${encodeURIComponent(bannedByEmail)}` +
            `&banned_until=${encodeURIComponent(bannedUntil)}`
        );
      } else if (user.app_metadata?.role !== "staff") {
        // Logged in but not staff
        router.replace("/403");
      } else {
        // Logged in and authorized
        setIsAuthorized(true);
      }
    };

    checkUser();
  }, [router]);

  if (isAuthorized === null) {
    return null;
  }

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
