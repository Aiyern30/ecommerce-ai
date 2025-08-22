"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, FileText } from "lucide-react";
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
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { Enquiry } from "@/type/enquiries";

function EmptyEnquiriesState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No enquiries yet</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        No one has submitted any enquiries yet.
      </TypographyP>
    </div>
  );
}

function EnquiryTableSkeleton() {
  return (
    <div className="w-full border rounded-md bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Subject</TableHead>
              <TableHead className="min-w-[300px]">Message</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="min-w-[200px]">Staff Reply</TableHead>
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
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[300px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[200px]" />
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

function NoEnquiryResultsState({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No matching enquiries</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        No enquiries match your current search criteria. Try adjusting your
        filters or search terms.
      </TypographyP>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<"all" | "open" | "pending" | "closed">(
    "all"
  );
  const itemsPerPage = 10;

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/enquiries/select");
      const json = await res.json();
      if (!res.ok) {
        setEnquiries([]);
      } else {
        setEnquiries(json.enquiries || []);
      }
    } catch {
      setEnquiries([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Add status filter to filteredEnquiries
  const filteredEnquiries = enquiries.filter((enq) => {
    if (status !== "all" && enq.status !== status) {
      return false;
    }
    if (!search) return true;
    return (
      enq.name.toLowerCase().includes(search.toLowerCase()) ||
      enq.subject.toLowerCase().includes(search.toLowerCase()) ||
      enq.message.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Helper for badge color
  const getStatusBadge = (status: string | null) => {
    if (status === "closed") {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 border-green-200"
        >
          Closed
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 border-yellow-200"
        >
          Pending
        </Badge>
      );
    }
    // Default to open
    return (
      <Badge
        variant="secondary"
        className="bg-blue-100 text-blue-800 border-blue-200"
      >
        Open
      </Badge>
    );
  };

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const currentPageData = filteredEnquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatus("all");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">Enquiries</TypographyH2>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search enquiries by name, subject, or message..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as "all" | "open" | "pending" | "closed")
          }
        >
          <SelectTrigger className="w-full sm:w-[180px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <EnquiryTableSkeleton />
      ) : enquiries.length === 0 ? (
        <EmptyEnquiriesState />
      ) : filteredEnquiries.length === 0 ? (
        <NoEnquiryResultsState onClearFilters={clearAllFilters} />
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Staff Reply</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.map((enq) => (
                <TableRow
                  key={enq.id}
                  onClick={() => router.push(`/staff/enquiries/${enq.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium max-w-xs truncate">
                    {enq.name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {enq.subject}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {enq.message}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {getStatusBadge(enq.status)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {enq.staff_reply || "-"}
                  </TableCell>
                  <TableCell>
                    {enq.created_at
                      ? new Date(enq.created_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/staff/enquiries/${enq.id}/edit`);
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
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
