"use client";

import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  redirectTo = "/login",
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      Loading...
    </div>
  ),
}: AuthGuardProps) {
  const user = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If user is undefined, still loading
      if (user === undefined) {
        return;
      }

      // If user is null, double-check with Supabase session
      if (user === null) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          console.log("No authentication found, redirecting...");
          router.push(redirectTo);
          return;
        }
      }

      // User is authenticated or still loading
      setIsChecking(false);
    };

    checkAuth();
  }, [user, router, redirectTo]);

  // Show fallback while checking authentication
  if (user === undefined || (user === null && isChecking)) {
    return <>{fallback}</>;
  }

  // If no user after checking, don't render children (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
