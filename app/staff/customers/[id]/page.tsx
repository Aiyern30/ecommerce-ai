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
} from "@/components/ui/";
import { TypographyH2 } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { ChevronLeft } from "lucide-react";
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
          {/* Uncomment if you want an Edit button */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/staff/customers/${customer?.id}/edit`)}
            className="flex items-center gap-2"
            disabled={!customer}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button> */}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">
          Customer Details
        </TypographyH2>
      </div>
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
                    {customer.full_name?.charAt(0) || customer.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">
                    {customer.full_name || "No name"}
                  </div>
                  <div className="text-muted-foreground">{customer.email}</div>
                  {/* Status Badge: show banned if ban_info.banned_until exists and is in future */}
                  {customer.ban_info?.banned_until &&
                  new Date(customer.ban_info.banned_until) > new Date() ? (
                    <Badge className="mt-2 capitalize bg-orange-600 text-white">
                      Banned
                    </Badge>
                  ) : (
                    <Badge className="mt-2 capitalize">{customer.status}</Badge>
                  )}
                  {/* Show banned reason if banned */}
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
                <label className="block text-sm font-medium mb-1">Phone</label>
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
                <label className="block text-sm font-medium mb-1">Joined</label>
                <Input
                  value={
                    customer.created_at ? formatDate(customer.created_at) : "-"
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
              {/* Ban Info Section */}
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
              {/* Ban History Table */}
              {customer.ban_info?.previous_bans &&
                customer.ban_info.previous_bans.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">
                      Ban History
                    </label>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border rounded bg-muted">
                        <thead>
                          <tr>
                            <th className="px-2 py-1 text-left">Reason</th>
                            <th className="px-2 py-1 text-left">Banned At</th>
                            <th className="px-2 py-1 text-left">Banned By</th>
                            <th className="px-2 py-1 text-left">
                              Banned Until
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {customer.ban_info.previous_bans.map((ban, idx) => (
                            <tr key={idx}>
                              <td className="px-2 py-1">{ban.reason || "-"}</td>
                              <td className="px-2 py-1">
                                {ban.banned_at
                                  ? formatDate(ban.banned_at)
                                  : "-"}
                              </td>
                              <td className="px-2 py-1">
                                {ban.banned_by_name || ban.banned_by || "-"}
                              </td>
                              <td className="px-2 py-1">
                                {ban.banned_until
                                  ? formatDate(ban.banned_until)
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="text-center text-gray-500">Customer not found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
