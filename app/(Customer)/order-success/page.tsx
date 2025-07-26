/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Truck,
  Mail,
  CreditCard,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getUserOrders } from "@/lib/order/api";

// Define the order structure based on your updated API
interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_type?: string;
  image_url?: string;
}

interface Address {
  id: string;
  full_name: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_intent_id?: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  address_id: string;
  addresses?: Address; // This comes from the JOIN
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
  notes?: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const user = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const orders = await getUserOrders(user.id);
        const foundOrder = orders.find((o: Order) => o.id === orderId);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We couldn't find the order you're looking for. Please check your
              order confirmation email or contact support.
            </p>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Address Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The shipping address for this order could not be found. Please
              contact support.
            </p>
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

  const formatOrderId = (id: string) => {
    return `ORD-${id.slice(-8).toUpperCase()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "processing":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "shipped":
        return "text-purple-600 bg-purple-50 dark:bg-purple-900/20";
      case "delivered":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "cancelled":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "failed":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      case "refunded":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-50 dark:bg-green-900/20 p-8 text-center border-b">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Thank you for your order. We've received your payment and will
              process your order shortly.
            </p>

            {/* Order Info Cards */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Order ID
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {formatOrderId(order.id)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(
                      order.payment_status
                    )}`}
                  >
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Order Summary */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items ({order.order_items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {order.order_items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × RM{item.price.toFixed(2)}
                        </p>
                        {item.variant_type && (
                          <p className="text-xs text-gray-400">
                            Variant: {item.variant_type}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          RM{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>RM{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>RM{order.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>RM{order.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-xl font-bold text-green-600">
                          RM{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping & Payment Info */}
              <div className="space-y-6">
                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="font-medium">{shippingAddress.full_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {shippingAddress.address_line1}
                    </p>
                    {shippingAddress.address_line2 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {shippingAddress.address_line2}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.postal_code}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {shippingAddress.country}
                    </p>
                    {shippingAddress.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Phone: {shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Payment Status</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                    {order.payment_intent_id && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Payment ID: {order.payment_intent_id.slice(-8)}
                      </p>
                    )}
                    {order.payment_status === "paid" && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        ✓ Payment Confirmed
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                {order.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Order Notes</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email confirmation sent within 5 minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-medium">Processing & Shipping</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Processed within 1-2 business days
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Estimated: 3-5 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile/orders">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                >
                  Track Your Order
                </Button>
              </Link>
              <Link href="/products">
                <Button className="w-full sm:w-auto">
                  Continue Shopping
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Questions about your order? Contact us at{" "}
                <a
                  href="mailto:support@cementproducts.com"
                  className="text-blue-600 hover:underline"
                >
                  support@cementproducts.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
