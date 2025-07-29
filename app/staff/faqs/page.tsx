/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { Faq } from "@/type/faqs";

function EmptyFaqsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No FAQs available</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        We haven't published any frequently asked questions yet. Please check
        back later.
      </TypographyP>
    </div>
  );
}

function FaqTableSkeleton() {
  return (
    <div className="w-full border rounded-md bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Question</TableHead>
              <TableHead className="min-w-[250px]">Answer</TableHead>
              <TableHead className="min-w-[100px]">Created</TableHead>
              <TableHead className="text-right min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[300px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-12 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function FaqsPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    // Join section name from faq_sections
    const { data, error } = await supabase
      .from("faq")
      .select("*, section:faq_sections(name)")
      .order("created_at", { ascending: false });
    if (!error) {
      setFaqs(data || []);
    } else {
      setFaqs([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Group FAQs by section name
  const filteredFaqs = faqs.filter((faq) => {
    if (!search) return true;
    return (
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
    );
  });

  const faqsBySection: { [section: string]: Faq[] } = {};
  filteredFaqs.forEach((faq) => {
    const section = faq.section?.name || "Uncategorized";
    if (!faqsBySection[section]) faqsBySection[section] = [];
    faqsBySection[section].push(faq);
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">FAQs</TypographyH2>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search FAQs by question or answer..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>
      {loading ? (
        <FaqTableSkeleton />
      ) : faqs.length === 0 ? (
        <EmptyFaqsState />
      ) : filteredFaqs.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
          No matching FAQs found.
        </div>
      ) : (
        <Accordion
          type="multiple"
          className="w-full space-y-2"
          defaultValue={Object.keys(faqsBySection)}
        >
          {Object.entries(faqsBySection).map(([section, faqsInSection]) => (
            <AccordionItem
              key={section}
              value={section}
              className="border rounded-lg bg-card shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 text-base sm:text-lg font-semibold bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                <div className="flex items-center justify-between w-full">
                  <span>{section}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({faqsInSection.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-background rounded-b-lg py-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px]">
                          Question
                        </TableHead>
                        <TableHead className="min-w-[300px]">Answer</TableHead>
                        <TableHead className="min-w-[120px]">Created</TableHead>
                        <TableHead className="text-right min-w-[80px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqsInSection.map((faq) => (
                        <TableRow
                          key={faq.id}
                          onClick={() => router.push(`/staff/faqs/${faq.id}`)}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <TableCell
                            className="font-medium max-w-xs truncate"
                            title={faq.question}
                          >
                            {faq.question}
                          </TableCell>
                          <TableCell
                            className="max-w-md truncate text-gray-600 dark:text-gray-300"
                            title={faq.answer}
                          >
                            {faq.answer}
                          </TableCell>
                          <TableCell>
                            {faq.created_at
                              ? new Date(faq.created_at).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/staff/faqs/${faq.id}/edit`);
                              }}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
