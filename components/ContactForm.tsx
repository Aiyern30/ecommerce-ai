"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
  Input,
  Button,
} from "@/components/ui/";
import { toast } from "sonner";
import { insertEnquiry } from "@/lib/enquiry/insertEnquiry";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Enter a valid email address." }),
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
});

interface ContactFormProps {
  defaultName?: string;
  defaultEmail?: string;
  className?: string;
}

export default function ContactForm({
  defaultName = "",
  defaultEmail = "",
  className = "",
}: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      subject: "",
      message: "",
    },
  });

  // Update form values when props change
  useEffect(() => {
    form.setValue("name", defaultName);
    form.setValue("email", defaultEmail);
  }, [defaultName, defaultEmail, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await insertEnquiry(values);
      toast.success("Your enquiry has been sent! ✅");
      // Only reset subject and message, keep user info if provided
      form.setValue("subject", "");
      form.setValue("message", "");

      // If no default values provided, reset all fields
      if (!defaultName && !defaultEmail) {
        form.reset();
      }
    } catch {
      toast.error("Failed to send enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasDefaultValues = defaultName || defaultEmail;

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 ${className}`}
    >
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Send us a Message
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Your name *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    className="border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                    disabled={!!defaultName}
                    {...field}
                  />
                </FormControl>
                {defaultName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Auto-filled from your account
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Your email *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    className="border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                    disabled={!!defaultEmail}
                    {...field}
                  />
                </FormControl>
                {defaultEmail && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Auto-filled from your account
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Subject *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter subject"
                    className="border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Your message *
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your message"
                    className="min-h-[120px] border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>

          {!hasDefaultValues && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              <a
                href="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in
              </a>{" "}
              to auto-fill your contact information
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
