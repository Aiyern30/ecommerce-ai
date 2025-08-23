/* eslint-disable react/no-unescaped-entities */
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
import {
  TypographyH1,
  TypographyH2,
  TypographyP,
} from "@/components/ui/Typography";
import { formatDate } from "@/lib/utils/format";
import { Customer } from "@/type/customer";

export default function CustomerProfilePage() {
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
    <div className="min-h-screen mb-4">
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">YOUR PROFILE</TypographyH1>
        {!loading && !customer && (
          <div className="flex flex-col items-center justify-center py-16">
            <TypographyH2 className="mb-2">Profile Not Found</TypographyH2>
            <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
              We couldn't find your profile. Please try again later.
            </TypographyP>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </div>
        )}
        {customer && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
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
                    <label className="block text-sm font-medium mb-1">
                      Role
                    </label>
                    <Input
                      value={customer.role}
                      disabled
                      className="bg-muted"
                    />
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
                        <div className="overflow-x-auto">
                          <Table className="min-w-[600px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Reason</TableHead>
                                <TableHead>Banned At</TableHead>
                                <TableHead>Banned By</TableHead>
                                <TableHead>Banned Until</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customer.ban_info.previous_bans.map(
                                (ban, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{ban.reason || "-"}</TableCell>
                                    <TableCell>
                                      {ban.banned_at
                                        ? formatDate(ban.banned_at)
                                        : "-"}
                                    </TableCell>
                                    <TableCell>
                                      {ban.banned_by_name ||
                                        ban.banned_by ||
                                        "-"}
                                    </TableCell>
                                    <TableCell>
                                      {ban.banned_until
                                        ? formatDate(ban.banned_until)
                                        : "-"}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                </>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
