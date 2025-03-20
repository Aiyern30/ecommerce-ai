import Link from "next/link";
import { ArrowRight } from "lucide-react";
function ShoppingIllustration() {
  return (
    <svg
      width="500"
      height="500"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1_2)">
        {/* Person */}
        <path
          d="M400 350 C 420 280 420 280 420 280 L 380 260 L 360 350 Z"
          fill="#ff7a5c"
        />
        <path
          d="M380 260 C 380 260 370 240 370 220 C 370 200 380 190 390 190 C 400 190 410 200 410 220 C 410 240 400 260 400 260 Z"
          fill="#f5d0c5"
        />
        <path
          d="M380 190 C 380 190 370 180 370 170 C 370 160 380 150 390 150 C 400 150 410 160 410 170 C 410 180 400 190 400 190 Z"
          fill="#333"
        />
        <path
          d="M360 350 C 360 350 360 400 360 450 C 360 460 350 470 340 470 C 330 470 320 460 320 450 L 320 350 Z"
          fill="#111"
        />
        <path
          d="M400 350 C 400 350 400 400 400 450 C 400 460 410 470 420 470 C 430 470 440 460 440 450 L 440 350 Z"
          fill="#111"
        />
        <path
          d="M380 280 C 380 280 370 290 370 300 C 370 310 380 320 390 320 C 400 320 410 310 410 300 C 410 290 400 280 400 280 Z"
          fill="#f5d0c5"
        />

        {/* Shopping Cart */}
        <path
          d="M300 450 L 350 450 L 380 350 L 270 350 Z"
          stroke="#333"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M270 350 L 240 400 L 270 450"
          stroke="#333"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="290" cy="470" r="10" fill="#333" />
        <circle cx="340" cy="470" r="10" fill="#333" />

        {/* Items in cart */}
        <rect x="280" y="370" width="40" height="30" fill="#0cf" />
        <rect x="320" y="380" width="30" height="20" fill="#00f" />
        <circle cx="310" cy="390" r="20" fill="#ff7a5c" />
      </g>
      <defs>
        <clipPath id="clip0_1_2">
          <rect width="500" height="500" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

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
        <div className="flex h-full items-center justify-center p-8">
          <ShoppingIllustration />
        </div>
      </div>
    </div>
  );
}
