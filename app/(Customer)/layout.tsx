"use client";

import { useSession } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/CustomerLayout";

export default function CustomerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === undefined) return;
    if (!session?.user) {
      router.push("/login");
    }
  }, [router, session]);

  return <CustomerLayout>{children}</CustomerLayout>;
}
