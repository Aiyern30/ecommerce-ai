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
import { ArrowLeft } from "lucide-react";
import { Combobox } from "@/components/ui/Combobox";

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
      const [{ data: sectionData }, { data: faqData, error: faqError }] =
        await Promise.all([
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
      if (sectionData) setSections(sectionData.map((s) => s.name));
      if (faqData) {
        form.reset({
          question: faqData.question || "",
          answer: faqData.answer || "",
          status: faqData.status || "draft",
          section: faqData.faq_sections?.name || "",
        });
      } else if (faqError) {
        toast.error("Failed to load FAQ: " + faqError.message);
      }
      setLoading(false);
    };
    if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (data: FaqFormData) => {
    setIsSubmitting(true);
    try {
      let sectionId: string | null = null;
      const existing = sections.find(
        (s) => s.toLowerCase() === data.section.toLowerCase()
      );
      if (existing) {
        const { data: sectionData, error } = await supabase
          .from("faq_sections")
          .select("id")
          .eq("name", existing)
          .single();
        if (error || !sectionData) {
          toast.error("Failed to find selected section.");
          setIsSubmitting(false);
          return;
        }
        sectionId = sectionData.id;
      } else {
        const { data: newSection, error } = await supabase
          .from("faq_sections")
          .insert({ name: data.section })
          .select()
          .single();
        if (error || !newSection) {
          toast.error("Failed to create new section: " + error?.message);
          setIsSubmitting(false);
          return;
        }
        sectionId = newSection.id;
        setSections((prev) => [newSection.name, ...prev]);
      }
      const { error: updateError } = await supabase
        .from("faq")
        .update({
          question: data.question,
          answer: data.answer,
          section_id: sectionId,
          status: data.status,
        })
        .eq("id", id);

      if (updateError) {
        toast.error("Failed to update FAQ: " + updateError.message);
      } else {
        toast.success(
          data.status === "draft"
            ? "Draft updated successfully."
            : "FAQ updated and published successfully."
        );
        router.push("/staff/faqs");
      }
    } catch (e) {
      console.error(e);
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
                        disabled={loading}
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
                        disabled={loading}
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
