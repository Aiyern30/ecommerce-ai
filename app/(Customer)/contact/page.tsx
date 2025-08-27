"use client";

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
  Youtube,
} from "lucide-react";
import { Skeleton } from "@/components/ui/";
import { FeatureCard } from "@/components/FeatureCards";
import { useUser } from "@supabase/auth-helpers-react";
import ContactForm from "@/components/ContactForm";

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

export default function ContactPage() {
  const [loading] = useState(false);
  const user = useUser();

  const features = [
    {
      icon: Clock,
      title: "Secure Online Payment",
      description:
        "We accept secure online payments for a seamless shopping experience.",
    },
    {
      icon: Package,
      title: "Fresh Inventory & Promotions",
      description:
        "Stay updated with our latest inventory arrivals and exclusive promotions.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assurance",
      description:
        "All our products undergo rigorous quality control to ensure customer satisfaction.",
    },
    {
      icon: Clock,
      title: "Express Delivery",
      description:
        "Get your orders delivered promptly within selected service areas.",
    },
  ];

  // Get user data for auto-filling form
  const userName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const userEmail = user?.email || "";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Get in Touch with Us
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Have questions or need support? Reach out to us through our contact
          form, or visit our headquarters for direct assistance.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Our Office
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Reach out to our headquarters for any inquiries or assistance.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center gap-3 text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>YTL Cement Berhad</span>
                </div>
                <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                  Corporate Headquarters
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p className="text-sm">
                    11th Floor, Yeoh Tiong Lay Plaza, 55 Jalan Bukit Bintang,
                    55100 Kuala Lumpur, Malaysia
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">+60 3-2117 0088</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Link
                      href="mailto:enquiry@ytl.com.my"
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      enquiry@ytl.com.my
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Business Hours: Monday - Friday, 9:00 AM - 6:00 PM (GMT+8)
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm mb-4 text-gray-700 dark:text-gray-300 font-medium">
                  Follow YTL Community on social media:
                </p>
                <div className="flex gap-3">
                  <Link
                    href="https://www.facebook.com/ytlcommunity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors group"
                    title="YTL Community Facebook"
                  >
                    <Facebook className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </Link>
                  <Link
                    href="https://x.com/ytlcommunity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors group"
                    title="YTL Community Twitter/X"
                  >
                    <Twitter className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </Link>
                  <Link
                    href="https://www.instagram.com/ytlcommunity/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors group"
                    title="YTL Community Instagram"
                  >
                    <Instagram className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400" />
                  </Link>
                  <Link
                    href="https://my.linkedin.com/company/ytl-corporation-bhd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors group"
                    title="YTL Corporation LinkedIn"
                  >
                    <Linkedin className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </Link>
                  <Link
                    href="https://www.youtube.com/ytlcommunity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group"
                    title="YTL Community YouTube"
                  >
                    <Youtube className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400" />
                  </Link>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <Link
                    href="https://www.ytl.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 underline"
                  >
                    Visit our official website: www.ytl.com
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          {loading ? (
            <ContactFormSkeleton />
          ) : (
            <ContactForm defaultName={userName} defaultEmail={userEmail} />
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
}
