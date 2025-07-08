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
      } else if (user.user_metadata?.role !== "staff") {
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
