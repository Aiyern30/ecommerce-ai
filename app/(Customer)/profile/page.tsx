"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";

export default function CustomerProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        router.replace(`/profile/${user.id}`);
      } else {
        router.replace("/login");
      }
    }
    redirectToProfile();
  }, [router]);

  return null;
}
