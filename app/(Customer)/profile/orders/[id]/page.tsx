"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
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
  Skeleton,
} from "@/components/ui";
import { TypographyH1, TypographyP } from "@/components/ui/Typography";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Order } from "@/type/order";
import { getPaymentStatusConfig } from "@/lib/utils/format";

function OrderDetailsSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-40 w-full mb-6" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
    </div>
  );
}

export default function CustomerOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const user = useUser();
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

  useEffect(() => {
    async function fetchOrderDetails() {
      setLoading(true);
      try {
        // Fetch order with addresses and order_items for this user and orderId
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
          .eq("user_id", user?.id)
          .single();

        if (error || !data) {
          setOrder(null);
        } else {
          // Merge additional_services for compatibility
          setOrder({
            ...data,
            additional_services: data.order_additional_services || [],
          });
        }
      } catch {
        setOrder(null);
      }
      setLoading(false);
    }
    if (orderId && user?.id) fetchOrderDetails();
  }, [orderId, user?.id]);

  if (loading) return <OrderDetailsSkeleton />;

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <TypographyH1>Order not found</TypographyH1>
        <TypographyP className="mb-6">
          Unable to find order with ID: {orderId}
        </TypographyP>
        <Button
          variant="outline"
          onClick={() => router.push("/profile/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <TypographyH1>Order Details</TypographyH1>
        <Button
          variant="outline"
          onClick={() => router.push("/profile/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Order #{order.id.slice(-8)}
            <Badge className="ml-3">{order.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <TypographyP className="font-semibold mb-1">Customer</TypographyP>
              <div className="mb-2">
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
              <TypographyP className="font-semibold mb-1">Address</TypographyP>
              <div className="text-xs text-gray-700 dark:text-gray-300 mb-2">
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
                {order.created_at}
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
            </div>
            <div>
              <TypographyP className="font-semibold mb-1">
                Order Notes
              </TypographyP>
              <div className="text-xs text-gray-700 mb-2">
                {order.notes || "-"}
              </div>
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
              <TypographyP className="font-semibold mt-4 mb-1">
                Totals
              </TypographyP>
              <div className="space-y-1 text-xs">
                <div>
                  Subtotal:{" "}
                  <span className="font-medium">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div>
                  Shipping:{" "}
                  <span className="font-medium">
                    {formatCurrency(order.shipping_cost)}
                  </span>
                </div>
                <div>
                  Tax:{" "}
                  <span className="font-medium">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
                <div>
                  Total:{" "}
                  <span className="font-bold text-blue-700">
                    {formatCurrency(order.total)}
                  </span>
                </div>
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
                    <TableCell colSpan={6} className="text-right font-semibold">
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
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="font-bold text-blue-700">
                      RM
                      {order.additional_services
                        .reduce((sum, s) => sum + Number(s.total_price || 0), 0)
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
    </div>
  );
}
