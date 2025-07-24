"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase/browserClient";
import Image from "next/image";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

import { BreadcrumbNav } from "@/components/BreadcrumbNav";

interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_type?: string;
  image_url?: string;
}

interface Order {
  id: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
  notes?: string;
  payment_intent_id?: string;
  shipping_address: ShippingAddress;
  order_items: OrderItem[];
}

const statusIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: ArrowLeft,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  processing: "bg-blue-100 text-blue-800 border-blue-300",
  shipped: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const paymentStatusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800 border-green-300",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  failed: "bg-red-100 text-red-800 border-red-300",
  refunded: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = params.orderId as string;

  useEffect(() => {
    if (user === undefined) return; // Still loading

    if (!user) {
      router.push("/login");
      return;
    }

    const loadOrderData = async () => {
      if (!user?.id || !orderId) return;

      try {
        const { data: order, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            order_items (*)
          `
          )
          .eq("id", orderId)
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error loading order:", error);
          toast.error("Failed to load order details");
          router.push("/profile/orders");
          return;
        }

        setOrder(order);
      } catch (error) {
        console.error("Error loading order:", error);
        toast.error("Failed to load order details");
        router.push("/profile/orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [user, orderId, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status.toLowerCase()] || Package;
    return <IconComponent className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    return (
      statusColors[status.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    return (
      paymentStatusColors[paymentStatus.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-300"
    );
  };

  if (user === undefined || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Order not found</h1>
            <p className="text-gray-600">
              The order you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </p>
            <Link href="/profile/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav
          customItems={[
            { label: "Home", href: "/" },
            { label: "Profile", href: "/profile" },
            { label: "Orders", href: "/profile/orders" },
            { label: `Order #${order.id.slice(-8).toUpperCase()}` },
          ]}
        />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Status & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(
                      order.status
                    )} flex items-center gap-1`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getPaymentStatusColor(order.payment_status)}
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    {order.payment_status.charAt(0).toUpperCase() +
                      order.payment_status.slice(1)}
                  </Badge>
                </div>

                {/* Order Timeline */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Order Progress</h4>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="space-y-6">
                      {/* Order Placed */}
                      <div className="relative flex items-center">
                        <div className="absolute left-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-12">
                          <p className="font-medium">Order Placed</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Payment Confirmed */}
                      {order.payment_status === "paid" && (
                        <div className="relative flex items-center">
                          <div className="absolute left-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="ml-12">
                            <p className="font-medium">Payment Confirmed</p>
                            <p className="text-sm text-gray-600">
                              Payment processed successfully
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Processing */}
                      {["processing", "shipped", "delivered"].includes(
                        order.status
                      ) && (
                        <div className="relative flex items-center">
                          <div className="absolute left-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="ml-12">
                            <p className="font-medium">Order Processing</p>
                            <p className="text-sm text-gray-600">
                              Your order is being prepared
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Shipped */}
                      {["shipped", "delivered"].includes(order.status) && (
                        <div className="relative flex items-center">
                          <div className="absolute left-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="ml-12">
                            <p className="font-medium">Order Shipped</p>
                            <p className="text-sm text-gray-600">
                              Your order is on its way
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Delivered */}
                      {order.status === "delivered" && (
                        <div className="relative flex items-center">
                          <div className="absolute left-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="ml-12">
                            <p className="font-medium">Order Delivered</p>
                            <p className="text-sm text-gray-600">
                              Your order has been delivered
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Pending states */}
                      {order.status === "pending" && (
                        <div className="relative flex items-center">
                          <div className="absolute left-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="ml-12">
                            <p className="font-medium">Awaiting Processing</p>
                            <p className="text-sm text-gray-600">
                              Your order will be processed soon
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.order_items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{item.name}</h5>
                        {item.variant_type && (
                          <p className="text-sm text-gray-600">
                            Variant: {item.variant_type}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-3">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>
                      {order.shipping_address.first_name}{" "}
                      {order.shipping_address.last_name}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p>{order.shipping_address.address_line_1}</p>
                      {order.shipping_address.address_line_2 && (
                        <p>{order.shipping_address.address_line_2}</p>
                      )}
                      <p>
                        {order.shipping_address.city},{" "}
                        {order.shipping_address.state}{" "}
                        {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{order.shipping_address.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{order.shipping_address.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {order.payment_intent_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-xs">
                        {order.payment_intent_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge
                        variant="outline"
                        className={getPaymentStatusColor(order.payment_status)}
                      >
                        {order.payment_status.charAt(0).toUpperCase() +
                          order.payment_status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span>Credit Card</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile/orders">
            <Button variant="outline" className="w-full sm:w-auto">
              Back to All Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button className="w-full sm:w-auto">Continue Shopping</Button>
          </Link>
          {order.status === "delivered" && (
            <Button variant="outline" className="w-full sm:w-auto">
              Write a Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
