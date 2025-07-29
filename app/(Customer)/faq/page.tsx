"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/";
import { TypographyH1, TypographyP } from "@/components/ui/Typography";
import { getFaqs } from "@/lib/faq/getFaqs";
import ContactForm from "@/components/ContactForm";

type FaqItem = {
  id: string;
  section: string;
  question: string;
  answer: string;
};

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getFaqs();
      setFaqs(data);
    })();
  }, []);

  // Group by section
  const grouped = faqs.reduce<Record<string, FaqItem[]>>((acc, faq) => {
    acc[faq.section] = acc[faq.section] || [];
    acc[faq.section].push(faq);
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
        <div className="space-y-6">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section}>
              <h2 className="text-xl font-semibold mb-2 capitalize">
                {section}
              </h2>
              <Accordion type="multiple">
                {items.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Right: Contact form */}
        <ContactForm />
      </div>
    </div>
  );
}
