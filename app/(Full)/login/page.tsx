"use client";
import { AllAuthProviders } from "@/components/AuthProviderButtons";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="flex w-full items-center justify-center lg:w-1/2 dark:bg-gray-900">
        <div className="w-full max-w-md p-8">
          {/* Header */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-[#ff7a5c]">
              YTL CONCRETE HUB
            </h3>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back!
          </p>
          <h1 className="mb-8 mt-2 text-4xl font-bold dark:text-white">
            Sign in
          </h1>

          {/* Auth Providers */}
          <AllAuthProviders
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            mode="signin"
            providers={["google", "azure", "apple", "github"]}
          />

          {/* Terms and Privacy */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-[#ff7a5c] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#ff7a5c] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Support Link */}
          <p className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
            Need help?{" "}
            <Link href="/support" className="text-[#ff7a5c] hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side Illustration */}
      <div className="hidden bg-[#fff0e8] dark:bg-gray-800 lg:block lg:w-1/2">
        <div className="flex h-full items-center justify-center p-16">
          <div className="relative h-full w-full">
            <Image
              src="/Login.png"
              alt="Login illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
