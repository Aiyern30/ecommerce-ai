"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";
import { CustomerLayout } from "@/components/CustomerLayout";
import StaffLayout from "./StaffLayout";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isStaffRoute = pathname.startsWith("/Staff");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();

      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      let role = user.user_metadata?.role;

      // Auto-assign role if missing
      if (!role) {
        await supabase.auth.updateUser({
          data: { role: "customer" },
        });

        // Re-fetch session
        const { data: refetched } = await supabase.auth.getSession();
        role = refetched.session?.user.user_metadata?.role ?? "customer";
      }

      if (isStaffRoute && role !== "staff") {
        router.push("/unauthorized");
        return;
      }

      setLoading(false);
    }

    init();
  }, [isStaffRoute, router]);

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

  return isStaffRoute ? (
    <StaffLayout>{children}</StaffLayout>
  ) : (
    <CustomerLayout>{children}</CustomerLayout>
  );
}
