/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { Button, Skeleton } from "@/components/ui";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Truck,
  Mail,
  CreditCard,
  MapPin,
  Clock,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import { Order } from "@/type/order";
import { getOrderById } from "@/lib/order/api";
import { formatDate, getPaymentStatusColor } from "@/lib/utils/format";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const user = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams?.get("orderId");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const foundOrder = await getOrderById(orderId, user.id);
        if (foundOrder) {
          console.log("Found order:", foundOrder);
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">ORDER SUCCESS</TypographyH1>
        <div className="mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex flex-col items-center mb-8">
              <Skeleton className="w-16 h-16 rounded-full mb-4" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Skeleton className="h-12 w-40 rounded-lg" />
              <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">ORDER NOT FOUND</TypographyH1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-red-600" />
            </div>
            <TypographyH3 className="text-gray-900 dark:text-white mb-4">
              Order Not Found
            </TypographyH3>
            <TypographyP className="text-gray-600 dark:text-gray-400 mb-8">
              We couldn't find the order you're looking for. Please check your
              order confirmation email or contact support.
            </TypographyP>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile/orders">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                >
                  View All Orders
                </Button>
              </Link>
              <Link href="/products">
                <Button className="w-full sm:w-auto">
                  Continue Shopping
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get address data from the JOIN
  const shippingAddress = order.addresses;

  if (!shippingAddress) {
    return (
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">ADDRESS ERROR</TypographyH1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-10 h-10 text-yellow-600" />
            </div>
            <TypographyH3 className="text-gray-900 dark:text-white mb-4">
              Address Not Found
            </TypographyH3>
            <TypographyP className="text-gray-600 dark:text-gray-400 mb-8">
              The shipping address for this order could not be found. Please
              contact support.
            </TypographyP>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile/orders">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                >
                  View All Orders
                </Button>
              </Link>
              <Link href="/products">
                <Button className="w-full sm:w-auto">
                  Continue Shopping
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "processing":
        return "text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
      case "shipped":
        return "text-purple-700 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400";
      case "delivered":
        return "text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="container mx-auto px-4 pt-0 pb-4">
      <TypographyH1 className="my-8">ORDER SUCCESS</TypographyH1>

      {/* Success Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <TypographyH3 className="text-green-900 dark:text-green-100 mb-4">
          Order Placed Successfully!
        </TypographyH3>
        <TypographyP className="text-green-700 dark:text-green-300 mb-6">
          Thank you for your order. We've received your payment and will process
          your order shortly.
        </TypographyP>

        {/* Order Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <TypographyP className="text-sm text-gray-600 dark:text-gray-400 mb-1 !mt-0">
              Order ID
            </TypographyP>
            <TypographyP className="text-lg font-bold text-blue-600 !mt-0">
              {order.id}
            </TypographyP>
            <TypographyP className="text-xs text-gray-500 mt-1 !mt-0">
              Placed on {formatDate(order.created_at)}
            </TypographyP>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <TypographyP className="text-sm text-gray-600 dark:text-gray-400 mb-2 !mt-0">
              Status
            </TypographyP>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <TypographyP className="text-sm text-gray-600 dark:text-gray-400 mb-2 !mt-0">
              Payment
            </TypographyP>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPaymentStatusColor(
                order.payment_status
              )}`}
            >
              {order.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Order Items */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-gray-600" />
              <TypographyH3 className="!mt-0">
                Order Items ({order.order_items?.length || 0})
              </TypographyH3>
            </div>

            <div className="space-y-4">
              {order.order_items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <TypographyP className="font-medium line-clamp-2 !mt-0">
                      {item.name}
                    </TypographyP>
                    <TypographyP className="text-sm text-gray-500 dark:text-gray-400 !mt-1">
                      Qty: {item.quantity} × RM{item.price.toFixed(2)}
                    </TypographyP>
                    {item.variant_type && (
                      <TypographyP className="text-xs text-gray-400 !mt-1">
                        Variant: {item.variant_type}
                      </TypographyP>
                    )}
                  </div>
                  <div className="text-right">
                    <TypographyP className="font-bold text-lg !mt-0">
                      RM{(item.price * item.quantity).toFixed(2)}
                    </TypographyP>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-medium">
                    RM{order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shipping
                  </span>
                  <span className="font-medium">
                    RM{order.shipping_cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax (SST 6%)
                  </span>
                  <span className="font-medium">RM{order.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      RM{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Address & Payment Info */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <TypographyH3 className="!mt-0">Shipping Address</TypographyH3>
            </div>
            <div className="space-y-2">
              <TypographyP className="font-medium !mt-0">
                {shippingAddress.full_name}
              </TypographyP>
              <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-0">
                {shippingAddress.address_line1}
              </TypographyP>
              {shippingAddress.address_line2 && (
                <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-0">
                  {shippingAddress.address_line2}
                </TypographyP>
              )}
              <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-0">
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.postal_code}
              </TypographyP>
              <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-0">
                {shippingAddress.country}
              </TypographyP>
              {shippingAddress.phone && (
                <TypographyP className="text-sm text-gray-600 dark:text-gray-400 mt-3 !mt-3">
                  <strong>Phone:</strong> {shippingAddress.phone}
                </TypographyP>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <TypographyH3 className="!mt-0">Payment Information</TypographyH3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Payment Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPaymentStatusColor(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status}
                </span>
              </div>
              {order.payment_intent_id && (
                <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-0">
                  <strong>Payment ID:</strong>{" "}
                  {order.payment_intent_id.slice(-8)}
                </TypographyP>
              )}
              {order.payment_status === "paid" && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <TypographyP className="text-sm font-medium !mt-0">
                    Payment Confirmed
                  </TypographyP>
                </div>
              )}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <TypographyH3 className="mb-3 !mt-0">Order Notes</TypographyH3>
              <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-0">
                {order.notes}
              </TypographyP>
            </div>
          )}
        </div>
      </div>

      {/* What's Next Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
        <TypographyH3 className="mb-6 !mt-0">What's Next?</TypographyH3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <TypographyP className="font-medium !mt-0">
                Order Confirmation
              </TypographyP>
              <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-1">
                Email confirmation sent within 5 minutes
              </TypographyP>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <TypographyP className="font-medium !mt-0">
                Processing & Shipping
              </TypographyP>
              <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-1">
                Processed within 1-2 business days
              </TypographyP>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <TypographyP className="font-medium !mt-0">Delivery</TypographyP>
              <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-1">
                Estimated: 3-5 business days
              </TypographyP>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Link href="/profile/orders">
          <Button variant="outline" className="w-full sm:w-auto bg-transparent">
            <Clock className="mr-2 w-4 h-4" />
            Track Your Order
          </Button>
        </Link>
        <Link href="/products">
          <Button className="w-full sm:w-auto">
            <ShoppingBag className="mr-2 w-4 h-4" />
            Continue Shopping
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Contact Info */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
        <TypographyP className="text-sm text-gray-600 dark:text-gray-400 !mt-0">
          Questions about your order? Contact us at{" "}
          <a
            href="mailto:support@cementproducts.com"
            className="text-blue-600 hover:underline font-medium"
          >
            support@cementproducts.com
          </a>
        </TypographyP>
      </div>
    </div>
  );
}
