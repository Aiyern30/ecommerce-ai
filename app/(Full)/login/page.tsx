"use client";
import { supabase } from "@/lib/supabase/browserClient";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

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
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

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
    setIsLoading(true);
    const { email, password } = data;

    const { data: userData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      form.setError("email", {
        message: "Invalid email or password",
      });
      form.setError("password", {
        message: "Invalid email or password",
      });
      console.error("Login error:", error.message);
    } else if (userData?.user) {
      const user = userData.user;

      if (!user.user_metadata?.avatar_url) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            avatar_url:
              "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(user.email ?? "User"),
          },
        });

        if (updateError) {
          console.error("Failed to update avatar:", updateError.message);
        }
      }

      window.location.href = "/";
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
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
              {/* Email Field */}
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

              {/* Password Field */}
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

          {/* Divider */}
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

          {/* Google Sign In Button */}
          <GoogleAuthButton
            mode="signin"
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />

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

      {/* Right Side Illustration */}
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
