"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 dark:text-white">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8 relative h-40 w-full">
          <Image
            src="404.svg"
            alt="404 Not Found"
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-4xl font-bold text-[#2a3990] dark:text-[#f83d92] mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
          We can&apos;t seem to find the page you&apos;re looking for. It might
          have been moved, deleted, or perhaps never existed.
        </p>

        {/* Navigation options */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Button
            asChild
            variant="outline"
            className="gap-2 dark:border-gray-600 dark:text-white"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2 dark:border-gray-600 dark:text-white"
          >
            <Link href="/products">
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
