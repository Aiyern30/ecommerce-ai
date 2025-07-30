"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Skeleton,
} from "@/components/ui/";
import {
  TypographyH1,
  TypographyH6,
  TypographyP,
} from "@/components/ui/Typography";
import { supabase } from "@/lib/supabase/client";
import ContactForm from "@/components/ContactForm";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  section: { name: string } | null;
};

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("faq")
        .select("id, question, answer, section:faq_sections(name)")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to fetch FAQs:", error);
        setFaqs([]);
      } else {
        setFaqs(
          (data || []).map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
            section: Array.isArray(item.section)
              ? item.section[0] || null
              : item.section,
          }))
        );
      }
      setLoading(false);
    };

    fetchFaqs();
  }, []);

  // Group by section name or "Uncategorized"
  const grouped = faqs.reduce<Record<string, FaqItem[]>>((acc, faq) => {
    const sectionName = faq.section?.name || "Uncategorized";
    acc[sectionName] = acc[sectionName] || [];
    acc[sectionName].push(faq);
    return acc;
  }, {});

  function FaqSkeleton() {
    return (
      <Accordion type="multiple" className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <AccordionItem
            key={i}
            value={`skeleton-${i}`}
            className="border rounded-lg bg-card shadow-sm"
          >
            <AccordionTrigger className="px-4">
              <Skeleton className="h-4 w-1/3" />
            </AccordionTrigger>
            <AccordionContent className="bg-background rounded-b-lg py-4 space-y-4">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="space-y-2 px-6">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-4" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-3 w-5/6 ml-4" />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  function ContactFormSkeleton() {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-0">
      <TypographyH1 className="my-8">Frequently Asked Questions</TypographyH1>
      <TypographyP className="text-gray-600 max-w-2xl mb-8">
        Find answers to common questions about our services, policies, and more.
        If you need further help, feel free to contact us.
      </TypographyP>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Left: FAQ */}
        <div className="space-y-4">
          {loading ? (
            <FaqSkeleton />
          ) : (
            <Accordion
              type="multiple"
              defaultValue={Object.keys(grouped)}
              className="space-y-4"
            >
              {Object.entries(grouped).map(([section, items]) => (
                <AccordionItem
                  key={section}
                  value={section}
                  className="border rounded-lg bg-card shadow-sm"
                >
                  <AccordionTrigger className="px-4 capitalize">
                    <div className="flex justify-between items-center w-full">
                      <span>{section}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({items.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-background rounded-b-lg py-4 space-y-4">
                    {items.map((faq, index) => (
                      <div key={faq.id} className="space-y-2 px-6">
                        <TypographyH6 className="flex items-start">
                          <span className="font-semibold mr-2">
                            {index + 1}.
                          </span>
                          <span className="font-medium">{faq.question}</span>
                        </TypographyH6>
                        <TypographyP className="text-gray-600 ml-4">
                          {faq.answer}
                        </TypographyP>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Right: Contact form */}
        {loading ? <ContactFormSkeleton /> : <ContactForm />}
      </div>
    </div>
  );
}
