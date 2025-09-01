"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToCart() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        router.replace(`/cart`);
      } else {
        router.replace("/login");
      }
    }
    redirectToCart();
  }, [router]);

  return null;
}
