"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/";
import Link from "next/link";
import Image from "next/image";

export function AuthStatus() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user.image && (
            <Image
              src={session.user.image || "/placeholder.svg"}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-sm font-medium">{session.user.name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    </div>
  );
}
