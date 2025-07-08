import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff0e8] dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-[#ff7a5c] dark:bg-red-500 p-4 rounded-full">
            <ShieldOff className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          401 - Unauthorized
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Oops! You don’t have permission to view this page. Please contact an
          administrator if you believe this is an error.
        </p>
        <Link href="/">
          <Button className="bg-[#ff7a5c] hover:bg-[#ff6a4c] text-white">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
