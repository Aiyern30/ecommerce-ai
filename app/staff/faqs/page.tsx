/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, FileText, Plus } from "lucide-react";
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
  Badge,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { Faq } from "@/type/faqs";
import Link from "next/link";
import { useDeviceType } from "@/utils/useDeviceTypes";

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
              <TableHead className="min-w-[100px]">Status</TableHead>
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

function NoFaqResultsState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No matching FAQs</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        No FAQs match your current search criteria. Try adjusting your filters
        or search terms.
      </TypographyP>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
        <Link href="/staff/faqs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New FAQ
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function FaqsPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { isMobile } = useDeviceType();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");

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

  // Filter logic: add status filter
  const filteredFaqs = faqs.filter((faq) => {
    if (status !== "all" && faq.status !== status) {
      return false;
    }
    if (!search) return true;
    return (
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Group FAQs by section name
  const faqsBySection: { [section: string]: Faq[] } = {};
  filteredFaqs.forEach((faq) => {
    const section = faq.section?.name || "Uncategorized";
    if (!faqsBySection[section]) faqsBySection[section] = [];
    faqsBySection[section].push(faq);
  });

  const clearAllFilters = () => {
    setSearch("");
    setStatus("all");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">FAQs</TypographyH2>
        <div className="flex items-center gap-2">
          <Link href="/staff/faqs/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add FAQs
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Controls */}
      {isMobile ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 w-full h-9"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Search className="h-4 w-4" />
            Filters
          </Button>
          <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filter FAQs</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-4">
                <Input
                  type="search"
                  placeholder="Search FAQs by question or answer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as "all" | "draft" | "published")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatus("all");
                      setMobileFilterOpen(false);
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <DrawerClose asChild>
                    <Button size="sm" className="flex-1">
                      Apply
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search FAQs by question or answer..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as "all" | "draft" | "published")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <FaqTableSkeleton />
      ) : faqs.length === 0 ? (
        <EmptyFaqsState />
      ) : filteredFaqs.length === 0 ? (
        <NoFaqResultsState onClearFilters={clearAllFilters} />
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
              <AccordionTrigger className="px-4">
                <div className="flex items-center justify-between w-full">
                  <span>{section}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({faqsInSection.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-background rounded-b-lg py-0">
                <div className="overflow-x-auto">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px] text-left">
                          Question
                        </TableHead>
                        <TableHead className="min-w-[200px] text-left">
                          Answer
                        </TableHead>
                        <TableHead className="w-[110px] min-w-[90px] max-w-[120px] text-left">
                          Status
                        </TableHead>
                        <TableHead className="w-[90px] min-w-[80px] max-w-[100px] text-left">
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
                            className="min-w-[200px] font-medium truncate"
                            title={faq.question}
                          >
                            {faq.question}
                          </TableCell>
                          <TableCell
                            className="min-w-[200px] truncate text-gray-600 dark:text-gray-300"
                            title={faq.answer}
                          >
                            {faq.answer}
                          </TableCell>
                          <TableCell className="w-[110px] min-w-[90px] max-w-[120px]">
                            <Badge
                              variant={
                                faq.status === "published"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                faq.status === "published"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }
                            >
                              {faq.status === "published"
                                ? "Published"
                                : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[90px] min-w-[80px] max-w-[100px]">
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
