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
  providers?: string[];
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  is_super_admin?: boolean;
  is_sso_user?: boolean;
  is_anonymous?: boolean;
  banned_until?: string | null;
  deleted_at?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  provider_id?: string;
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
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
                  <Badge className="mt-2 capitalize">{customer.status}</Badge>
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Confirmed
                </label>
                <Input
                  value={
                    customer.email_confirmed_at
                      ? formatDate(customer.email_confirmed_at)
                      : "No"
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Confirmed
                </label>
                <Input
                  value={
                    customer.phone_confirmed_at
                      ? formatDate(customer.phone_confirmed_at)
                      : "No"
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Verified
                </label>
                <Input
                  value={customer.email_verified ? "Yes" : "No"}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Verified
                </label>
                <Input
                  value={customer.phone_verified ? "Yes" : "No"}
                  disabled
                  className="bg-muted"
                />
              </div>
              {customer.banned_until && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Banned Until
                  </label>
                  <Input
                    value={formatDate(customer.banned_until)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
              {customer.deleted_at && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deleted At
                  </label>
                  <Input
                    value={formatDate(customer.deleted_at)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Super Admin
                </label>
                <Input
                  value={customer.is_super_admin ? "Yes" : "No"}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  SSO User
                </label>
                <Input
                  value={customer.is_sso_user ? "Yes" : "No"}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Anonymous
                </label>
                <Input
                  value={customer.is_anonymous ? "Yes" : "No"}
                  disabled
                  className="bg-muted"
                />
              </div>
              {customer.providers && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Providers
                  </label>
                  <Input
                    value={customer.providers.join(", ")}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
              {customer.provider_id && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Provider ID
                  </label>
                  <Input
                    value={customer.provider_id}
                    disabled
                    className="bg-muted"
                  />
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
