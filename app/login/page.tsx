import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Login Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md p-8">
          <div className="mb-8">
            <h3 className="text-xl font-medium text-[#ff7a5c]">Logo Here</h3>
          </div>

          <p className="text-sm text-gray-500">Welcome back !!!</p>
          <h1 className="mb-6 mt-2 text-4xl font-bold">Sing in</h1>

          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="test@gmail.com"
                className="w-full rounded-md bg-[#fff5f3] p-3 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-gray-400 hover:text-[#ff7a5c]"
                >
                  Forgot Password ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                className="w-full rounded-md bg-[#fff5f3] p-3 text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex w-40 items-center justify-center gap-2 rounded-full bg-[#ff7a5c] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#ff6a4c]"
            >
              SING IN
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            I don&apos;t have an account :
            <Link href="#" className="ml-1 text-[#ff7a5c] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden bg-[#fff0e8] lg:block lg:w-1/2">
        <div className="flex h-full items-center justify-center p-16">
          <div className="relative h-full w-full">
            <Image
              src="/Login.png"
              alt="Shopping illustration"
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
