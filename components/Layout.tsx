"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@supabase/auth-helpers-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import StaffLayout from "./StaffLayout";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  const isStaffRoute = pathname.startsWith("/Staff");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for session to load
    if (session === undefined) return;

    const user = session?.user;

    // Not logged in
    if (!user) {
      router.push("/login");
      setLoading(false); // <== STOP loading even after redirect
      return;
    }

    const role = user.user_metadata?.role;

    // Missing role
    if (!role) {
      router.push("/unauthorized");
      setLoading(false);
      return;
    }

    // Staff route, but user is not staff
    if (isStaffRoute && role !== "staff") {
      router.push("/unauthorized");
      setLoading(false);
      return;
    }

    // All good
    setLoading(false);
  }, [session, isStaffRoute, router]);

  if (loading || session === undefined) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  return isStaffRoute ? (
    <StaffLayout>{children}</StaffLayout>
  ) : (
    <CustomerLayout>{children}</CustomerLayout>
  );
}
