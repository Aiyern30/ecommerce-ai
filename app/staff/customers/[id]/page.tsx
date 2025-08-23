"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Badge,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { ChevronLeft, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

interface Customer {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  status: "active" | "inactive" | "banned";
  role: "customer" | "admin" | "staff";
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  ban_info?: {
    reason?: string;
    banned_at?: string;
    banned_by?: string;
    banned_by_email?: string;
    banned_by_name?: string;
    banned_until?: string;
    previous_bans?: {
      reason?: string;
      banned_at?: string;
      banned_by?: string;
      banned_by_email?: string;
      banned_by_name?: string;
      banned_until?: string;
    }[];
    unbanned_at?: string;
    unbanned_by?: string;
    unbanned_by_email?: string;
    unbanned_by_name?: string;
  };
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  console.log(customer);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      setLoading(true);
      const res = await fetch(`/api/customer/${customerId}`);
      if (!res.ok) {
        setCustomer(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCustomer(data.customer || null);
      setLoading(false);
    }
    if (customerId) fetchCustomer();
  }, [customerId]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <BreadcrumbNav
            customItems={[
              { label: "Dashboard", href: "/staff/dashboard" },
              { label: "Customers", href: "/staff/customers" },
              {
                label:
                  customer?.full_name || customer?.email || "Customer Details",
              },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">
          Customer Details
        </TypographyH2>
      </div>
      {/* Customer Not Found UI */}
      {!loading && !customer && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <TypographyH2 className="mb-2">Customer Not Found</TypographyH2>
          <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
            The customer you are looking for does not exist or has been deleted.
          </TypographyP>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/staff/customers")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      )}
      {customer && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
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
            ) : customer ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={customer.avatar_url || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {customer.full_name?.charAt(0) ||
                        customer.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">
                      {customer.full_name || "No name"}
                    </div>
                    <div className="text-muted-foreground">
                      {customer.email}
                    </div>
                    {customer.ban_info?.banned_until &&
                    new Date(customer.ban_info.banned_until) > new Date() ? (
                      <Badge className="mt-2 capitalize bg-orange-600 text-white">
                        Banned
                      </Badge>
                    ) : (
                      <Badge className="mt-2 capitalize">
                        {customer.status}
                      </Badge>
                    )}
                    {customer.ban_info?.banned_until &&
                      new Date(customer.ban_info.banned_until) > new Date() &&
                      customer.ban_info?.reason && (
                        <div className="text-xs text-orange-600 mt-2">
                          Reason: {customer.ban_info.reason}
                        </div>
                      )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Input value={customer.role} disabled className="bg-muted" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    value={customer.phone || "-"}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <Input
                    value={customer.location || "-"}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Joined
                  </label>
                  <Input
                    value={
                      customer.created_at
                        ? formatDate(customer.created_at)
                        : "-"
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Seen
                  </label>
                  <Input
                    value={
                      customer.last_sign_in_at
                        ? formatDate(customer.last_sign_in_at)
                        : "-"
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
                {customer.ban_info?.banned_until && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-1">
                      Ban Information
                    </label>
                    <Input
                      value={
                        customer.ban_info.banned_until
                          ? formatDate(customer.ban_info.banned_until)
                          : "-"
                      }
                      disabled
                      className="bg-muted"
                    />
                    {customer.ban_info.reason && (
                      <Input
                        value={`Reason: ${customer.ban_info.reason}`}
                        disabled
                        className="bg-muted mt-1"
                      />
                    )}
                    {customer.ban_info.banned_by_name && (
                      <Input
                        value={`Banned By: ${customer.ban_info.banned_by_name}`}
                        disabled
                        className="bg-muted mt-1"
                      />
                    )}
                    {customer.ban_info.banned_at && (
                      <Input
                        value={`Banned At: ${formatDate(
                          customer.ban_info.banned_at
                        )}`}
                        disabled
                        className="bg-muted mt-1"
                      />
                    )}
                    {customer.ban_info.unbanned_at && (
                      <Input
                        value={`Unbanned At: ${formatDate(
                          customer.ban_info.unbanned_at
                        )}`}
                        disabled
                        className="bg-muted mt-1"
                      />
                    )}
                    {customer.ban_info.unbanned_by_name && (
                      <Input
                        value={`Unbanned By: ${customer.ban_info.unbanned_by_name}`}
                        disabled
                        className="bg-muted mt-1"
                      />
                    )}
                  </div>
                )}
                {customer?.ban_info?.previous_bans &&
                  customer.ban_info.previous_bans.length > 0 && (
                    <div className="mt-8">
                      <label className="block text-sm font-medium mb-2">
                        Ban History
                      </label>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reason</TableHead>
                            <TableHead>Banned At</TableHead>
                            <TableHead>Banned By</TableHead>
                            <TableHead>Banned Until</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customer.ban_info.previous_bans.map((ban, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{ban.reason || "-"}</TableCell>
                              <TableCell>
                                {ban.banned_at
                                  ? formatDate(ban.banned_at)
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {ban.banned_by_name || ban.banned_by || "-"}
                              </TableCell>
                              <TableCell>
                                {ban.banned_until
                                  ? formatDate(ban.banned_until)
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
