"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
} from "@/components/ui";
import { supabase } from "@/lib/supabase/browserClient";

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormValues) {
    const { email, password, name } = data;
    setLoading(true);
    setServerError("");
    setSuccessMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          avatar_url:
            "https://api.dicebear.com/6.x/initials/svg?seed=" +
            encodeURIComponent(name),
        },
      },
    });

    setLoading(false);

    if (error) {
      const lowerMsg = error.message.toLowerCase();
      if (
        lowerMsg.includes("user already registered") ||
        lowerMsg.includes("email already") ||
        lowerMsg.includes("duplicate")
      ) {
        setServerError(
          "This email is already registered. Please sign in instead."
        );
      } else {
        setServerError(error.message);
      }
    } else {
      setSuccessMessage(
        "Sign up successful! Please check your email for confirmation."
      );
      form.reset();
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert("Google sign-in failed: " + error.message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)]">
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md p-8">
          <div className="mb-8">
            <h3 className="text-xl font-medium text-[#ff7a5c]">Logo Here</h3>
          </div>

          <p className="text-sm text-gray-500">Join us today!</p>
          <h1 className="mb-6 mt-2 text-4xl font-bold">Sign up</h1>

          {/* Message Display */}
          {serverError && (
            <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">
              {serverError}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-600">
              {successMessage}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="test@gmail.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-40 items-center justify-center gap-2 rounded-full bg-[#ff7a5c] hover:bg-[#ff6a4c] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing Up..." : "SIGN UP"}
                {!loading && <ArrowRight size={16} />}
              </Button>
            </form>
          </Form>

          <div className="my-6 flex items-center justify-center gap-2">
            <span className="h-px w-full bg-gray-300" />
            <span className="text-sm text-gray-500">OR</span>
            <span className="h-px w-full bg-gray-300" />
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#ff7a5c] bg-white text-[#ff7a5c] hover:bg-[#fff5f3]"
          >
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
            Sign up with Google
          </Button>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?
            <Link href="/login" className="ml-1 text-[#ff7a5c] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

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
