"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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

  useEffect(() => {
    const fetchFaqs = async () => {
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

  return (
    <div className="container mx-auto px-4 py-6">
      <TypographyH1 className="mb-8 mt-14">
        Frequently Asked Questions
      </TypographyH1>
      <TypographyP className="text-gray-600 max-w-2xl mb-8">
        Find answers to common questions about our services, policies, and more.
        If you need further help, feel free to contact us.
      </TypographyP>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Left: FAQ */}
        <div className="space-y-4">
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
                        <span className="font-semibold mr-2">{index + 1}.</span>
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
        </div>

        {/* Right: Contact form */}
        <ContactForm />
      </div>
    </div>
  );
}
