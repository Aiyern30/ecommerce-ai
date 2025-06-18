"use client";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { usePathname } from "next/navigation";
import { CustomerLayout } from "@/components/CustomerLayout";
import StaffLayout from "./StaffLayout";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = pathname.startsWith("/Staff");
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return isStaffRoute ? (
    <>
      <SessionContextProvider supabaseClient={supabaseClient}>
        <StaffLayout>{children}</StaffLayout>
      </SessionContextProvider>
    </>
  ) : (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <CustomerLayout>{children}</CustomerLayout>
    </SessionContextProvider>
  );
}
