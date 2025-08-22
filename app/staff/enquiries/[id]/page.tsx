"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Button,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Edit, Trash2 } from "lucide-react";
import { Enquiry } from "@/type/enquiries";

export default function EnquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    params && params.id
      ? typeof params.id === "string"
        ? params.id
        : Array.isArray(params.id)
        ? params.id[0]
        : ""
      : "";
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchEnquiry() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/enquiries/select");
        const json = await res.json();
        if (res.ok && json.enquiries) {
          const found = json.enquiries.find((e: Enquiry) => e.id === id);
          setEnquiry(found || null);
        } else {
          setEnquiry(null);
        }
      } catch {
        setEnquiry(null);
      }
      setLoading(false);
    }
    if (id) fetchEnquiry();
  }, [id]);

  const handleDeleteEnquiry = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/enquiries/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert("Failed to delete enquiry: " + result.error);
      } else {
        router.push("/staff/enquiries");
      }
    } catch {
      alert("An unexpected error occurred while deleting the enquiry.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          {/* Breadcrumb navigation, adjust as needed */}
          <BreadcrumbNav
            customItems={[
              { label: "Dashboard", href: "/staff/dashboard" },
              { label: "Enquiries", href: "/staff/enquiries" },
              { label: enquiry?.subject || "Enquiry Details" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/staff/enquiries/${enquiry?.id}/edit`)}
            className="flex items-center gap-2"
            disabled={!enquiry}
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
                disabled={!enquiry}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this enquiry? This action
                  cannot be undone.
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
                  onClick={() => handleDeleteEnquiry(id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Enquiry"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">
          Enquiry Details
        </TypographyH2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enquiry Information</CardTitle>
          <CardDescription>
            <TypographyP className="!mt-0">
              View the details of this enquiry. All fields are read-only.
            </TypographyP>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          ) : enquiry ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={enquiry.name || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={enquiry.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <Input
                  value={enquiry.subject || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Input
                  value={enquiry.message || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Input
                  value={enquiry.status || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Staff Reply
                </label>
                <Input
                  value={enquiry.staff_reply || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Created At
                </label>
                <Input
                  value={
                    enquiry.created_at
                      ? new Date(enquiry.created_at).toLocaleString()
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Updated At
                </label>
                <Input
                  value={
                    enquiry.updated_at
                      ? new Date(enquiry.updated_at).toLocaleString()
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">Enquiry not found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
