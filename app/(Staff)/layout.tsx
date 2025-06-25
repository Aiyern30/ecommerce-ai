"use client";

import { useSession } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffLayout from "@/components/StaffLayout";

export default function StaffLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === undefined) return;
    const role = session?.user?.user_metadata?.role;

    if (!session?.user) {
      router.push("/login");
    } else if (role !== "staff") {
      router.push("/unauthorized");
    }
  }, [router, session]);

  return <StaffLayout>{children}</StaffLayout>;
}
