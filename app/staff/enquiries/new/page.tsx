"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui/";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const enquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

export default function NewEnquiryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: EnquiryFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("enquiries").insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });

      if (error) {
        toast.error("Failed to submit enquiry: " + error.message);
        return;
      }

      toast.success("Enquiry submitted successfully!");
      router.push("/staff/enquiries");
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Enquiries", href: "/staff/enquiries" },
            { label: "New Enquiry" },
          ]}
        />

        <div className="flex items-center justify-between">
          <TypographyH2>Create New Enquiry</TypographyH2>
          <Link href="/staff/enquiries">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Enquiries
            </Button>
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enquiry Details</CardTitle>
              <CardDescription>
                <TypographyP>Fill out the enquiry information.</TypographyP>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
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
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
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
                      <Input placeholder="Enquiry about pricing" {...field} />
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
                    <FormLabel>Message *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your message here..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
