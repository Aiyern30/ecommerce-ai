"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
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
} from "@/components/ui/";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

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

export default function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle form submission
  }

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
        <h1 className="text-4xl font-bold mb-4">Get in Touch with Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have questions or need support? Reach out to us through our contact
          form, or visit our headquarters for direct assistance.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Left Column - Office Information */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Office</h2>
          <p className="text-gray-600 mb-8">
            Reach out to our headquarters for any inquiries or assistance.
          </p>

          <div className="space-y-8">
            {/* YTL Cement Office */}
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                <MapPin className="h-5 w-5" />
                <span>YTL Cement Sdn Bhd</span>
              </div>
              <h3 className="font-medium mb-1">Headquarters</h3>
              <p className="text-gray-600 text-sm mb-1">
                Menara YTL, Bukit Bintang, Kuala Lumpur, Malaysia
              </p>
              <p className="text-gray-600 text-sm mb-1">+60 3-1234 5678</p>
              <Link
                href="mailto:info@ytlcement.com"
                className="text-blue-600 text-sm hover:underline"
              >
                info@ytlcement.com
              </Link>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-sm mb-2">Follow us:</p>
              <div className="flex gap-2">
                <Link
                  href="#"
                  className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
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
                    <FormLabel>Your email *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
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
                    <FormLabel>Subject *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject" {...field} />
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
                    <FormLabel>Your message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your message"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
