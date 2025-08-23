"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { ArrowLeft, FileText } from "lucide-react";
import { Combobox } from "@/components/ui/Combobox";
import { Faq } from "@/type/faqs";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  status: z.enum(["draft", "published"]).optional(),
  section: z.string().min(1, "Section name is required"),
});

type FaqFormData = z.infer<typeof faqSchema>;

export default function EditFaqPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqData, setFaqData] = useState<Faq | null>(null); // Add state to track FAQ data

  const form = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      status: "draft",
      section: "",
    },
  });

  // Fetch sections and FAQ data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Add validation for ID
      if (!id) {
        toast.error("No FAQ ID provided");
        setLoading(false);
        return;
      }

      console.log("Fetching FAQ with ID:", id); // Debug log

      try {
        const [
          { data: sectionData, error: sectionError },
          { data: faqData, error: faqError },
        ] = await Promise.all([
          supabase
            .from("faq_sections")
            .select("name")
            .order("created_at", { ascending: false }),
          supabase
            .from("faq")
            .select("*, faq_sections(name)")
            .eq("id", id)
            .single(),
        ]);

        // Better error handling for sections
        if (sectionError) {
          console.error("Section fetch error:", sectionError);
          toast.error("Failed to load sections: " + sectionError.message);
        } else if (sectionData) {
          setSections(sectionData.map((s) => s.name));
          console.log(
            "Loaded sections:",
            sectionData.map((s) => s.name)
          ); // Debug log
        }

        // Better error handling for FAQ data
        if (faqError) {
          console.error("FAQ fetch error:", faqError);
          toast.error("Failed to load FAQ: " + faqError.message);
          // Don't return early, still set loading to false
        } else if (faqData) {
          console.log("Loaded FAQ data:", faqData); // Debug log
          setFaqData(faqData); // Store the original data

          form.reset({
            question: faqData.question || "",
            answer: faqData.answer || "",
            status: (faqData.status as "draft" | "published") || "draft",
            section: faqData.faq_sections?.name || "",
          });

          console.log("Form reset with:", {
            question: faqData.question || "",
            answer: faqData.answer || "",
            status: faqData.status || "draft",
            section: faqData.faq_sections?.name || "",
          }); // Debug log
        } else {
          toast.error("FAQ not found");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [id, form]);

  const onSubmit = async (data: FaqFormData) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/faqs/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          question: data.question,
          answer: data.answer,
          section: data.section,
          status: data.status,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Update failed:", result.error);
        toast.error("Failed to update FAQ: " + result.error);
        return;
      }

      toast.success(
        data.status === "draft"
          ? "Draft updated successfully."
          : "FAQ updated and published successfully."
      );

      router.push("/staff/faqs");
    } catch (error) {
      console.error("Unexpected error during submission:", error);
      toast.error("Unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    form.setValue("status", "draft");
    form.handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    form.setValue("status", "published");
    form.handleSubmit(onSubmit)();
  };

  // Add loading state display
  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "FAQs", href: "/staff/faqs" },
            { label: "Edit FAQ" },
          ]}
        />
        <div className="flex items-center justify-center p-8">
          <p>Loading FAQ data...</p>
        </div>
      </div>
    );
  }

  // Add error state if FAQ not found
  if (!faqData && !loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "FAQs", href: "/staff/faqs" },
            { label: "Edit FAQ" },
          ]}
        />
        <div className="flex items-center justify-between">
          <TypographyH2 className="border-none pb-0">
            FAQs Not Found
          </TypographyH2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/staff/faqs")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to FAQs
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
            The FAQ you are looking for does not exist or has been deleted.
          </TypographyP>
          <Link href="/staff/faqs">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to FAQs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <BreadcrumbNav
        customItems={[
          { label: "Dashboard", href: "/staff/dashboard" },
          { label: "FAQs", href: "/staff/faqs" },
          { label: "Edit FAQ" },
        ]}
      />
      <div className="flex items-center justify-between">
        <TypographyH2>Edit FAQ</TypographyH2>
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
                  Edit the question, answer, and section.
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
                        disabled={loading || isSubmitting}
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
                        disabled={loading || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section *</FormLabel>
                    <FormControl>
                      <Combobox
                        options={sections}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select or add new section..."
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
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="submit"
              onClick={handlePublish}
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? "Publishing..." : "Publish FAQ"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
