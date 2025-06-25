"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/CustomerLayout";
import StaffLayout from "./StaffLayout";
import { supabase } from "@/lib/supabase/browserClient";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isStaffRoute = pathname.startsWith("/Staff");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/login");
        return;
      }

      const userRole = data.user.user_metadata?.role || "customer";

      if (isStaffRoute && userRole !== "staff") {
        router.push("/unauthorized");
      }

      setLoading(false);
    }

    fetchUserRole();
  }, [isStaffRoute, router]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  return isStaffRoute ? (
    <StaffLayout>{children}</StaffLayout>
  ) : (
    <CustomerLayout>{children}</CustomerLayout>
  );
}
