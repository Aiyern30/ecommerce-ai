"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  Mail,
  Phone,
} from "lucide-react";
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
  Skeleton,
} from "@/components/ui/";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { FeatureCard } from "@/components/FeatureCards";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

function ContactFormSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
      <Skeleton className="h-6 w-1/3 mb-6" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(values);
      toast.success("Message sent successfully! We'll get back to you soon.");
      form.reset();
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
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
                    {...field}
                  />
                </FormControl>
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
                    {...field}
                  />
                </FormControl>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function ContactPage() {
  const [loading] = useState(false);

  const features = [
    {
      icon: Clock,
      title: "Online Payment Only",
      description:
        "We accept only online payments for a seamless shopping experience.",
    },
    {
      icon: Package,
      title: "New Stock and Sales",
      description:
        "Stay updated with our latest stock arrivals and exclusive discounts.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assurance",
      description:
        "All our products go through strict quality control to ensure customer satisfaction.",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description:
        "Get your orders delivered within an hour in selected areas.",
    },
  ];

  return (
    <div className="container mx-auto mb-4">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Get in Touch with Us
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Have questions or need support? Reach out to us through our contact
          form, or visit our headquarters for direct assistance.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Left Column - Office Information */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Our Office
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Reach out to our headquarters for any inquiries or assistance.
            </p>

            <div className="space-y-6">
              {/* YTL Cement Office */}
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center gap-3 text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>YTL Cement Sdn Bhd</span>
                </div>
                <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                  Headquarters
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p className="text-sm">
                    Menara YTL, Bukit Bintang, Kuala Lumpur, Malaysia
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">+60 3-1234 5678</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Link
                      href="mailto:info@ytlcement.com"
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      info@ytlcement.com
                    </Link>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <p className="text-sm mb-4 text-gray-700 dark:text-gray-300 font-medium">
                  Follow us on social media:
                </p>
                <div className="flex gap-3">
                  <Link
                    href="#"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Facebook className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </Link>
                  <Link
                    href="#"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </Link>
                  <Link
                    href="#"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Instagram className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </Link>
                  <Link
                    href="#"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="lg:sticky lg:top-24 h-fit">
          {loading ? <ContactFormSkeleton /> : <ContactForm />}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
}
