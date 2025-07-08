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

      if (error || !user || user.user_metadata.role !== "staff") {
        router.replace("/401");
      } else {
        setIsAuthorized(true);
      }
    };

    checkUser();
  }, [router]);

  if (isAuthorized === null) {
    return null; // Or loading spinner
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
