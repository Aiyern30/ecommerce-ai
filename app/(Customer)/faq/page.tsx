/* eslint-disable react/no-unescaped-entities */
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
      <div className="space-y-4 max-w-4xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <Skeleton className="h-5 w-1/3" />
            </div>
            <div className="p-6 space-y-4">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Skeleton className="h-4 w-4 mt-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-3 w-5/6 ml-6" />
                  <Skeleton className="h-3 w-4/6 ml-6" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-0 pb-4">
      <div className="max-w-4xl mx-auto">
        <TypographyH1 className="my-8 text-center">
          Frequently Asked Questions
        </TypographyH1>
        <TypographyP className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-center mb-12">
          Find answers to common questions about our services, policies, and
          more. If you need further help, feel free to contact us.
        </TypographyP>

        {loading ? (
          <FaqSkeleton />
        ) : (
          <Accordion
            type="multiple"
            defaultValue={Object.keys(grouped)}
            className="space-y-6"
          >
            {Object.entries(grouped).map(([section, items]) => (
              <AccordionItem
                key={section}
                value={section}
                className="border rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {section}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                      {items.length}{" "}
                      {items.length === 1 ? "question" : "questions"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-gray-50 dark:bg-slate-900/50 rounded-b-xl border-t border-gray-200 dark:border-slate-700">
                  <div className="p-6 space-y-6">
                    {items.map((faq, index) => (
                      <div key={faq.id} className="space-y-3">
                        <TypographyH6 className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                            {faq.question}
                          </span>
                        </TypographyH6>
                        <TypographyP className="text-gray-600 dark:text-gray-300 ml-9 leading-relaxed">
                          {faq.answer}
                        </TypographyP>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {!loading && Object.keys(grouped).length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❓</span>
            </div>
            <TypographyH6 className="text-gray-900 dark:text-gray-100 mb-2">
              No FAQs Available
            </TypographyH6>
            <TypographyP className="text-gray-500 dark:text-gray-400">
              We're working on adding frequently asked questions. Check back
              soon!
            </TypographyP>
          </div>
        )}
      </div>
    </div>
  );
}
