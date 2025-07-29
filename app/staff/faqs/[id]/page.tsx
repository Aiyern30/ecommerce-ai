"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Skeleton,
  Badge,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Faq } from "@/type/faqs";

export default function FaqViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [faq, setFaq] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("faq")
      .select("*, section:faq_sections(name)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setFaq(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <BreadcrumbNav
        customItems={[
          { label: "Dashboard", href: "/staff/dashboard" },
          { label: "FAQs", href: "/staff/faqs" },
          { label: faq?.question || "FAQ Details" },
        ]}
      />

      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">FAQ Details</TypographyH2>
        <Link href="/staff/faqs">
          <button className="inline-flex items-center px-3 py-2 border rounded text-sm font-medium bg-background hover:bg-muted transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to FAQs
          </button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ Information</CardTitle>
          <CardDescription>
            <TypographyP className="!mt-0">
              View the details of this FAQ. All fields are read-only.
            </TypographyP>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          ) : faq ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Question
                </label>
                <Input value={faq.question} disabled className="bg-muted" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <Textarea
                  value={faq.answer}
                  disabled
                  className="bg-muted resize-none"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Section
                </label>
                <Input
                  value={faq.section?.name || "-"}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <div>
                  <Badge
                    variant={
                      faq.status === "published" ? "default" : "secondary"
                    }
                    className={
                      faq.status === "published"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }
                  >
                    {faq.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Created At
                </label>
                <Input
                  value={
                    faq.created_at
                      ? new Date(faq.created_at).toLocaleString()
                      : "-"
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">FAQ not found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
