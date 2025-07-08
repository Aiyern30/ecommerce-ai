/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Top Image */}
        <div className="relative w-full h-40 mx-auto">
          <Image
            src="/403.png"
            alt="Forbidden"
            fill
            className="object-contain rounded-lg"
            priority
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-[#ff7a5c] dark:bg-yellow-600 p-4 rounded-full">
            <Lock className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          403 - Forbidden
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have access to this page. Please check your permissions or
          return to the homepage.
        </p>

        {/* Button */}
        <Link href="/">
          <Button className="bg-[#ff7a5c] hover:bg-[#ff6a4c] text-white">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
