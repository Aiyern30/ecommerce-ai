"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Badge,
  Button,
} from "@/components/ui/";
import { formatDate } from "@/lib/utils/format";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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

  if (loading) {
    return (
      <Card className="max-w-lg mx-auto mt-10 p-6">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-1/2 mb-2" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-4 w-40 mb-2" />
        </CardContent>
      </Card>
    );
  }

  if (!customer) {
    return (
      <Card className="max-w-lg mx-auto mt-10 p-6">
        <CardHeader>
          <CardTitle>Customer Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto mt-10 p-6">
      <CardHeader>
        <CardTitle>Customer Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={customer.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>
              {customer.full_name?.charAt(0) || customer.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-lg">
              {customer.full_name || "No name"}
            </div>
            <div className="text-muted-foreground">{customer.email}</div>
            <Badge className="mt-2">{customer.status}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Role:</span> {customer.role}
          </div>
          {customer.providers && (
            <div>
              <span className="font-medium">Providers:</span>{" "}
              {customer.providers.join(", ")}
            </div>
          )}
          {customer.provider_id && (
            <div>
              <span className="font-medium">Provider ID:</span>{" "}
              {customer.provider_id}
            </div>
          )}
          {customer.phone && (
            <div>
              <span className="font-medium">Phone:</span> {customer.phone}
            </div>
          )}
          {customer.location && (
            <div>
              <span className="font-medium">Location:</span> {customer.location}
            </div>
          )}
          <div>
            <span className="font-medium">Email Confirmed:</span>{" "}
            {customer.email_confirmed_at
              ? formatDate(customer.email_confirmed_at)
              : "No"}
          </div>
          <div>
            <span className="font-medium">Phone Confirmed:</span>{" "}
            {customer.phone_confirmed_at
              ? formatDate(customer.phone_confirmed_at)
              : "No"}
          </div>
          <div>
            <span className="font-medium">Email Verified:</span>{" "}
            {customer.email_verified ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Phone Verified:</span>{" "}
            {customer.phone_verified ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Joined:</span>{" "}
            {formatDate(customer.created_at)}
          </div>
          <div>
            <span className="font-medium">Updated:</span>{" "}
            {formatDate(customer.updated_at)}
          </div>
          {customer.last_sign_in_at && (
            <div>
              <span className="font-medium">Last Seen:</span>{" "}
              {formatDate(customer.last_sign_in_at)}
            </div>
          )}
          {customer.banned_until && (
            <div>
              <span className="font-medium">Banned Until:</span>{" "}
              {formatDate(customer.banned_until)}
            </div>
          )}
          {customer.deleted_at && (
            <div>
              <span className="font-medium">Deleted At:</span>{" "}
              {formatDate(customer.deleted_at)}
            </div>
          )}
          <div>
            <span className="font-medium">Super Admin:</span>{" "}
            {customer.is_super_admin ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">SSO User:</span>{" "}
            {customer.is_sso_user ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-medium">Anonymous:</span>{" "}
            {customer.is_anonymous ? "Yes" : "No"}
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardContent>
    </Card>
  );
}
