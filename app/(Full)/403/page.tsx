/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ForbiddenContent() {
  const searchParams = useSearchParams();
  const isBanned = searchParams?.get("banned") === "1";
  const banReason = searchParams?.get("reason");
  const bannedBy = searchParams?.get("banned_by_name");
  const bannedByEmail = searchParams?.get("banned_by_email");
  const bannedUntil = searchParams?.get("banned_until");

  return (
    <div className="max-w-md w-full text-center space-y-6">
      {/* Top Image */}
      <div className="relative w-full h-96 mx-auto">
        <Image
          src="/403.svg"
          alt="Forbidden"
          fill
          className="object-contain rounded-lg"
          priority
        />
      </div>

      {/* Text Content */}
      {isBanned ? (
        <>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            You have been banned
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Reason:</span> {banReason}
          </p>
          {bannedUntil && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Banned Until:</span>{" "}
              {new Date(bannedUntil).toLocaleString()}
            </p>
          )}
          {bannedBy && (
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Banned By:</span> {bannedBy}
              {bannedByEmail && (
                <span>
                  {" "}
                  (
                  <a href={`mailto:${bannedByEmail}`} className="underline">
                    {bannedByEmail}
                  </a>
                  )
                </span>
              )}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400">
            If you believe this is a mistake, please contact support.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            403 - Forbidden
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have access to this page. Please check your permissions or
            return to the homepage.
          </p>
        </>
      )}

      {/* Button */}
      <Link href="/">
        <Button className="bg-[#ff7a5c] hover:bg-[#ff6a4c] text-white">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 px-4">
      <Suspense>
        <ForbiddenContent />
      </Suspense>
    </div>
  );
}
