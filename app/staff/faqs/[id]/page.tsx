"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Edit, Trash2 } from "lucide-react";
import { Faq } from "@/type/faqs";

export default function FaqViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [faq, setFaq] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <BreadcrumbNav
            customItems={[
              { label: "Dashboard", href: "/staff/dashboard" },
              { label: "FAQs", href: "/staff/faqs" },
              { label: faq?.question || "FAQ Details" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/staff/faqs/${faq?.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this FAQ? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    setIsDeleting(true);
                    const { error } = await supabase
                      .from("faq")
                      .delete()
                      .eq("id", id);
                    setIsDeleting(false);
                    setIsDeleteDialogOpen(false);
                    if (!error) {
                      router.push("/staff/faqs");
                    } else {
                      alert("Failed to delete FAQ: " + error.message);
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete FAQ"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">FAQ Details</TypographyH2>
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
