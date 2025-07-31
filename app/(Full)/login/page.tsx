"use client";
import { AllAuthProviders } from "@/components/AuthProviderButtons";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Side */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md px-6 py-12 lg:px-8 lg:py-20">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center rounded-2xl">
              <Image
                src="/favicon.svg"
                alt="YTL Concrete Hub Logo"
                width={80}
                height={80}
              />
            </div>
            <TypographyH3 className="text-[#ff7a5c] mb-2">
              YTL CONCRETE HUB
            </TypographyH3>
            <TypographyP className="text-gray-600 dark:text-gray-400">
              Your trusted concrete management platform
            </TypographyP>
          </div>

          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <TypographyH1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back!
            </TypographyH1>
            <TypographyP className="text-gray-600 dark:text-gray-400">
              Sign in to access your dashboard and manage your concrete projects
            </TypographyP>
          </div>

          {/* Auth Button */}
          <div className="mb-10">
            <AllAuthProviders
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              mode="signin"
              providers={["google"]}
            />
          </div>

          {/* Terms and Privacy */}
          <div className="mb-6 text-center">
            <TypographyP className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="font-medium text-[#ff7a5c] hover:text-[#ff6a4c] transition-colors underline-offset-2 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-[#ff7a5c] hover:text-[#ff6a4c] transition-colors underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
            </TypographyP>
          </div>

          {/* Support Link */}
          <div className="text-center">
            <TypographyP className="text-sm text-gray-500 dark:text-gray-400">
              Need help?{" "}
              <Link
                href="/support"
                className="font-medium text-[#ff7a5c] hover:text-[#ff6a4c] transition-colors underline-offset-2 hover:underline"
              >
                Contact Support
              </Link>
            </TypographyP>
          </div>
        </div>
      </div>

      {/* Right Side Illustration */}
      <div className="hidden bg-gradient-to-br from-[#fff5f3] to-[#fff0e8] dark:from-gray-800 dark:to-gray-700 lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        <div className="relative h-full w-full max-w-lg p-16">
          {/* Decorative elements */}
          <div className="absolute top-16 right-16 h-20 w-20 rounded-full bg-[#ff7a5c]/10 blur-xl"></div>
          <div className="absolute bottom-24 left-12 h-32 w-32 rounded-full bg-[#ff6a4c]/10 blur-2xl"></div>

          {/* Main illustration */}
          <div className="relative z-10 h-full w-full">
            <Image
              src="/Login.png"
              alt="Concrete management illustration"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Bottom info card */}
          <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-xl dark:bg-gray-800/80">
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
              Streamline Your Operations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage concrete projects, track deliveries, and optimize your
              workflow all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
