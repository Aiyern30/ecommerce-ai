"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui/";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    console.log(data);
    // You would implement email/password login here
    // This is just a placeholder since we're focusing on Google auth
  }

  async function handleGoogleLogin() {
    try {
      setIsLoading(true);
      // This will redirect to Google's login page
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-70px)]">
      <div className="flex w-full items-center justify-center lg:w-1/2 dark:bg-gray-900">
        <div className="w-full max-w-md p-8">
          <div className="mb-8">
            <h3 className="text-xl font-medium text-[#ff7a5c]">SHOPYTL</h3>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back !!!
          </p>
          <h1 className="mb-6 mt-2 text-4xl font-bold dark:text-white">
            Sign in
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="dark:text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="test@gmail.com"
                        {...field}
                        className="bg-[#fff5f3] dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="dark:text-gray-300">
                        Password
                      </FormLabel>
                      <Link
                        href="#"
                        className="text-xs text-gray-400 hover:text-[#ff7a5c] dark:text-gray-500 dark:hover:text-[#ff7a5c]"
                      >
                        Forgot Password ?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          {...field}
                          className="bg-[#fff5f3] pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff7a5c] hover:bg-[#ff6a4c] text-white cursor-pointer dark:bg-[#ff7a5c] dark:hover:bg-[#ff6a4c] dark:text-white"
              >
                SIGN IN
                <ArrowRight size={16} />
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-6 hover:bg-gray-50 cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-[#ff7a5c]"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="24px"
                height="24px"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
            )}
            <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
          </Button>

          <p className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
            I don&apos;t have an account :
            <Link
              href="/SignUp"
              className="ml-1 text-[#ff7a5c] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden bg-[#fff0e8] dark:bg-gray-800 lg:block lg:w-1/2">
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
