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
  Textarea,
  Button,
  Skeleton,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Enquiry } from "@/type/enquiries";

export default function EnquiryEditPage() {
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
  const [form, setForm] = useState({
    staff_reply: "",
    status: "open",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchEnquiry() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/enquiries/select");
        const json = await res.json();
        if (res.ok && json.enquiries) {
          const found = json.enquiries.find((e: Enquiry) => e.id === id);
          setEnquiry(found || null);
          if (found) {
            setForm({
              staff_reply: found.staff_reply || "",
              status: found.status || "open",
            });
          }
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

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/enquiries/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          staff_reply: form.staff_reply,
          status: form.status,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert("Failed to update enquiry: " + result.error);
      } else {
        router.push(`/staff/enquiries/${id}`);
      }
    } catch {
      alert("An unexpected error occurred while updating the enquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <BreadcrumbNav
        customItems={[
          { label: "Dashboard", href: "/staff/dashboard" },
          { label: "Enquiries", href: "/staff/enquiries" },
          { label: "Edit Enquiry" },
        ]}
      />
      <div className="flex items-center justify-between">
        <TypographyH2>Edit Enquiry</TypographyH2>
        <Link href="/staff/enquiries">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Enquiries
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enquiry Details</CardTitle>
          <CardDescription>
            <TypographyP>
              Update the staff reply and status for this enquiry.
            </TypographyP>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          ) : enquiry ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={enquiry.name || ""} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={enquiry.email || ""} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <Input value={enquiry.subject || ""} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Textarea value={enquiry.message || ""} disabled rows={4} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Staff Reply
                </label>
                <Textarea
                  value={form.staff_reply}
                  onChange={(e) => handleChange("staff_reply", e.target.value)}
                  rows={4}
                  placeholder="Enter your reply to the user..."
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Enquiry"}
              </Button>
            </form>
          ) : (
            <div className="text-center text-gray-500">Enquiry not found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
