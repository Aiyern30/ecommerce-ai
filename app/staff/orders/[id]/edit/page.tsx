"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Order } from "@/type/order";
import Link from "next/link";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import Image from "next/image";
import {
  formatDate,
  getPaymentStatusConfig,
  getStatusBadgeConfig,
} from "@/lib/utils/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import type { OrderStatus } from "@/type/order";
import { Skeleton } from "@/components/ui"; // Make sure Skeleton is imported

const ORDER_STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
  "refunded",
] as [OrderStatus, ...OrderStatus[]];

const FormSchema = z.object({
  status: z.enum(ORDER_STATUS_OPTIONS),
});
type FormValues = z.infer<typeof FormSchema>;

function OrderDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <BreadcrumbNav
        customItems={[
          { label: "Dashboard", href: "/staff/dashboard" },
          { label: "Orders", href: "/staff/orders" },
          { label: "Order Details" },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-5 w-40 mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-5 w-56 mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-5 w-32 mb-2" />
            </div>
            <div>
              <div className="flex items-end gap-2 mb-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-5 w-56 mb-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function StaffOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId =
    params && params.id
      ? typeof params.id === "string"
        ? params.id
        : Array.isArray(params.id)
        ? params.id[0]
        : ""
      : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: "pending",
    },
  });

  useEffect(() => {
    async function fetchOrderDetails() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            addresses (*),
            order_items (*),
            order_additional_services (*)
          `
          )
          .eq("id", orderId)
          .single();

        if (error || !data) {
          setOrder(null);
        } else {
          setOrder({
            ...data,
            additional_services: data.order_additional_services || [],
          });
          form.reset({ status: (data.status as Order["status"]) || "pending" });
        }
      } catch {
        setOrder(null);
      }
      setLoading(false);
    }
    if (orderId) fetchOrderDetails();
  }, [form, orderId]);

  const onSubmit = async (data: FormValues) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          status: data.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const result = await response.json();

      if (result.success) {
        setOrder((prev) =>
          prev ? { ...prev, status: data.status as Order["status"] } : null
        );
        toast.success("Order status updated successfully!");
      } else {
        throw new Error(result.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <OrderDetailsSkeleton />;

  if (!order) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Orders", href: "/staff/orders" },
            { label: "Order Details" },
          ]}
        />
        <div className="flex items-center justify-between">
          <TypographyH2 className="border-none pb-0">
            Order Not Found
          </TypographyH2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/staff/orders")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
            The order you are looking for does not exist or has been deleted.
          </TypographyP>
          <Link href="/staff/orders">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <BreadcrumbNav
        customItems={[
          { label: "Dashboard", href: "/staff/dashboard" },
          { label: "Orders", href: "/staff/orders" },
          { label: "Order Details" },
        ]}
      />
      <div className="flex items-center justify-between mb-6">
        <TypographyH2>Order #{order.id.slice(-8)}</TypographyH2>
        <Button variant="outline" onClick={() => router.push("/staff/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customer & Payment Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <TypographyP className="font-semibold mb-1">
                    Customer
                  </TypographyP>
                  <div className="mb-4">
                    <span className="font-medium">
                      {order.addresses?.full_name || "N/A"}
                    </span>
                    {order.addresses?.phone && (
                      <a
                        href={`tel:${order.addresses.phone}`}
                        className="ml-2 text-xs text-blue-600 underline"
                      >
                        {order.addresses.phone}
                      </a>
                    )}
                  </div>

                  <TypographyP className="font-semibold mb-1">
                    Address
                  </TypographyP>
                  <div className="text-xs text-gray-700 dark:text-gray-300 mb-4">
                    {order.addresses
                      ? [
                          order.addresses.address_line1,
                          order.addresses.address_line2,
                          order.addresses.city,
                          order.addresses.state,
                          order.addresses.postal_code,
                          order.addresses.country,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "N/A"}
                  </div>

                  <TypographyP className="font-semibold mb-1">
                    Created At
                  </TypographyP>
                  <div className="text-xs text-gray-500 mb-2">
                    {formatDate(order.created_at)}
                  </div>
                </div>

                <div className="flex flex-col item-center">
                  {/* Order Status row with button on right */}
                  <div className="flex items-end gap-2 mb-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Order Status</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {ORDER_STATUS_OPTIONS.map((opt) => {
                                  const config = getStatusBadgeConfig(opt);
                                  return (
                                    <SelectItem key={opt} value={opt}>
                                      <Badge
                                        variant={config.variant}
                                        className={config.className}
                                      >
                                        {config.label}
                                      </Badge>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size={"sm"} disabled={updating}>
                      <Save className="mr-2 h-4 w-4" />
                      {updating ? "Updating..." : "Update Status"}
                    </Button>
                  </div>

                  <TypographyP className="font-semibold mb-1">
                    Payment Status
                  </TypographyP>
                  {(() => {
                    const config = getPaymentStatusConfig(order.payment_status);
                    return (
                      <Badge
                        variant={config.variant}
                        className={`mb-4 ${config.className}`}
                      >
                        {config.label}
                      </Badge>
                    );
                  })()}

                  <TypographyP className="font-semibold mb-1">
                    Payment Intent
                  </TypographyP>
                  {order.payment_intent_id ? (
                    <a
                      href={`https://dashboard.stripe.com/payments/${order.payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 text-xs font-mono break-all"
                      title="View in Stripe"
                    >
                      {order.payment_intent_id}
                    </a>
                  ) : (
                    <span className="text-xs font-mono break-all">-</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <TypographyP className="font-semibold mb-1">
                    Subtotal
                  </TypographyP>
                  <div className="text-xs font-mono">
                    {formatCurrency(order.subtotal)}
                  </div>
                </div>
                <div>
                  <TypographyP className="font-semibold mb-1">
                    Shipping
                  </TypographyP>
                  <div className="text-xs font-mono">
                    {formatCurrency(order.shipping_cost)}
                  </div>
                </div>
                <div>
                  <TypographyP className="font-semibold mb-1">Tax</TypographyP>
                  <div className="text-xs font-mono">
                    {formatCurrency(order.tax)}
                  </div>
                </div>
                <div>
                  <TypographyP className="font-semibold mb-1">
                    Total
                  </TypographyP>
                  <div className="text-xs font-bold text-blue-700 font-mono">
                    {formatCurrency(order.total)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items && order.order_items.length > 0 ? (
                    <>
                      {order.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="w-12 h-12 relative">
                              <Image
                                src={item.image_url || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.grade}</TableCell>
                          <TableCell>{item.variant_type || "-"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-right font-semibold"
                        >
                          Total
                        </TableCell>
                        <TableCell className="font-bold text-blue-700">
                          {formatCurrency(
                            order.order_items.reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-xs text-gray-400"
                      >
                        No items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Services</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Rate (RM/m³)</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.additional_services &&
                  order.additional_services.length > 0 ? (
                    <>
                      {order.additional_services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>{service.service_name}</TableCell>
                          <TableCell>RM{service.rate_per_m3}</TableCell>
                          <TableCell>{service.quantity}</TableCell>
                          <TableCell>RM{service.total_price}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-semibold"
                        >
                          Total
                        </TableCell>
                        <TableCell className="font-bold text-blue-700">
                          RM
                          {order.additional_services
                            .reduce(
                              (sum, s) => sum + Number(s.total_price || 0),
                              0
                            )
                            .toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-xs text-gray-400"
                      >
                        No additional services.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
