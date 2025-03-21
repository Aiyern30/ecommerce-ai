"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Home, MessageSquare, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import ErrorIllustration from "./ErrorIllustration";
import { useTheme } from "next-themes";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [progress, setProgress] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { theme } = useTheme();

  const handleRetry = () => {
    setIsRetrying(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          reset();
          setIsRetrying(false);
          return 0;
        }
        return prev + 5;
      });
    }, 100);
  };

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-2xl w-full rounded-xl shadow-lg overflow-hidden transition-colors ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="bg-gradient-to-r from-red-500 to-[#f83d92] h-2" />

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <ErrorIllustration width={160} height={160} />
            </div>

            <div className="flex-1">
              <h1
                className={`text-2xl font-bold mb-2 transition-colors ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Something went wrong
              </h1>
              <p
                className={`mb-6 transition-colors ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                We&apos;re sorry, but we encountered an unexpected error while
                processing your request. Our team has been notified and is
                working to fix the issue.
              </p>

              {isRetrying ? (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Retrying...</p>
                  <Progress value={progress} className="h-2" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button onClick={handleRetry} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href="/">
                      <Home className="h-4 w-4" />
                      Go to Homepage
                    </Link>
                  </Button>
                </div>
              )}

              <div
                className={`border-t pt-4 mt-2 transition-colors ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <p className="text-sm text-gray-500 mb-4">You can also:</p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/Contact"
                    className={`flex items-center gap-1 transition-colors ${
                      theme === "dark"
                        ? "text-[#f83d92] hover:text-[#ff9ecb]"
                        : "text-[#f83d92] hover:underline"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                  </Link>
                  <Link
                    href="/Product"
                    className={`flex items-center gap-1 transition-colors ${
                      theme === "dark"
                        ? "text-[#f83d92] hover:text-[#ff9ecb]"
                        : "text-[#f83d92] hover:underline"
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mt-6 text-sm transition-colors ${
          theme === "dark" ? "text-gray-500" : "text-gray-400"
        }`}
      >
        Error Reference: {generateErrorReference()}
      </div>
    </div>
  );
}

// Generate a random error reference code for support
function generateErrorReference() {
  return `ERR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}
