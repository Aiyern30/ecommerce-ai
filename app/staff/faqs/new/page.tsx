"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Define Zod schema
const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  status: z.enum(["draft", "published"]).optional(),
});

type FaqFormData = z.infer<typeof faqSchema>;

export default function NewFaqPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      status: "draft",
    },
  });

  const onSubmit = async (data: FaqFormData) => {
    setIsSubmitting(true);

    const { error } = await supabase.from("faqs").insert(data);

    if (error) {
      toast.error("Failed to save FAQ: " + error.message);
    } else {
      toast.success(
        data.status === "draft"
          ? "Draft saved successfully."
          : "FAQ published successfully."
      );
      router.push("/staff/faqs");
    }

    setIsSubmitting(false);
  };

  const handleSaveDraft = () => {
    form.setValue("status", "draft");
    form.handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    form.setValue("status", "published");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <BreadcrumbNav
        customItems={[
          { label: "Dashboard", href: "/staff/dashboard" },
          { label: "FAQs", href: "/staff/faqs" },
          { label: "New FAQ" },
        ]}
      />

      <div className="flex items-center justify-between">
        <TypographyH2>Create New FAQ</TypographyH2>
        <Link href="/staff/faqs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to FAQs
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Details</CardTitle>
              <CardDescription>
                <TypographyP>
                  Fill in the question and answer for this FAQ item.
                </TypographyP>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. What is your return policy?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Provide a detailed answer..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              type="submit"
              onClick={handlePublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Publish FAQ"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
