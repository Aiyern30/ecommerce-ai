"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Home, MessageSquare, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/";
import { Progress } from "@/components/ui/";
import ErrorIllustration from "./ErrorIllustration";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [progress, setProgress] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-[#f83d92] h-2" />

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <ErrorIllustration width={160} height={160} />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
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
                  <Button onClick={handleRetry} className="gap-2 ">
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

              <div className="border-t border-gray-200 pt-4 mt-2">
                <p className="text-sm text-gray-500 mb-4">You can also:</p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/Contact"
                    className="text-[#f83d92] hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                  </Link>
                  <Link
                    href="/Product"
                    className="text-[#f83d92] hover:underline flex items-center gap-1"
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

      <div className="mt-6 text-sm text-gray-400">
        Error Reference: {generateErrorReference()}
      </div>
    </div>
  );
}

// Generate a random error reference code for support
function generateErrorReference() {
  return `ERR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}
