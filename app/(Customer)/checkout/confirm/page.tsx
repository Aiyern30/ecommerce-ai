"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { CheckoutStepper } from "@/components/Checkout/CheckoutStepper";
import { CheckoutSummary } from "@/components/Checkout/CheckoutSummary";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Building,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import type { Address } from "@/lib/user/address";
import { createOrderAPI } from "@/lib/order/api";

interface PaymentData {
  paymentMethod: "card" | "fpx" | "cash_on_delivery";
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
}

export default function CheckoutConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const user = useUser();
  const { cartItems, refreshCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState<Address | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const addressId = searchParams.get("addressId");
  const paymentSuccess = searchParams.get("paymentSuccess");

  useEffect(() => {
    const loadData = async () => {
      // Load address from database using addressId
      if (addressId && user) {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", addressId)
          .eq("user_id", user.id)
          .single();

        if (data && !error) {
          setAddressData(data);
        } else {
          console.error("Failed to fetch address:", error);
          router.push("/checkout/address");
          return;
        }
      } else {
        router.push("/checkout/address");
        return;
      }

      // Load payment data from localStorage
      const savedPayment = localStorage.getItem("checkout-payment");
      if (savedPayment) {
        const parsedPayment = JSON.parse(savedPayment);
        setPaymentData(parsedPayment);
        console.log("Loaded payment data:", parsedPayment);
      } else if (paymentSuccess === "true") {
        // Fallback: if payment was successful but no localStorage data
        setPaymentData({
          paymentMethod: "card",
          status: "succeeded",
        });
      } else {
        // No payment data available, redirect to payment page
        router.push(`/checkout/payment?addressId=${addressId}`);
        return;
      }
    };

    loadData();
  }, [addressId, paymentSuccess, router, supabase, user]);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "fpx":
        return <Building className="h-5 w-5 text-green-600" />;
      case "cash_on_delivery":
        return <Truck className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "card":
        return "Credit/Debit Card (Stripe)";
      case "fpx":
        return "FPX Online Banking";
      case "cash_on_delivery":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !addressData) {
      toast.error("Missing user or address information");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Creating order with payment data:", paymentData);

      // Create order with the existing PaymentIntent ID (payment already completed)
      const orderResult = await createOrderAPI(
        user.id,
        cartItems,
        addressData,
        paymentData?.paymentIntentId, // Pass the existing PaymentIntent ID
        undefined // notes
      );

      if (!orderResult) {
        throw new Error("Failed to create order");
      }

      console.log("Order created successfully:", orderResult.order_id);

      // Clear payment data from localStorage
      localStorage.removeItem("checkout-payment");

      // Refresh cart to reflect the cleared items (API already handles this)
      await refreshCart();

      toast.success("Order placed successfully!");

      // Redirect to success page with order ID
      router.push(`/order-success?orderId=${orderResult.order_id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!addressData || !paymentData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const selectedItems = cartItems.filter((item) => item.selected);
  const isPaymentCompleted =
    paymentData.status === "succeeded" || paymentSuccess === "true";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <BreadcrumbNav
          customItems={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout", href: "/checkout" },
            { label: "Address", href: "/checkout/address" },
            {
              label: "Payment",
              href: `/checkout/payment?addressId=${addressId}`,
            },
            { label: "Confirm" },
          ]}
        />
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Review Your Order</h1>
          <Link href={`/checkout/payment?addressId=${addressId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Checkout Stepper */}
      <div className="mb-8">
        <CheckoutStepper currentStep={4} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Shipping Address</h3>
              <Link href="/checkout/address">
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </Link>
            </div>
            <div className="text-sm">
              <p className="font-medium">{addressData.full_name}</p>
              <p>{addressData.address_line1}</p>
              {addressData.address_line2 && <p>{addressData.address_line2}</p>}
              <p>
                {addressData.city}, {addressData.state}{" "}
                {addressData.postal_code}
              </p>
              <p>{addressData.country}</p>
              <p className="mt-2 font-medium">Contact:</p>
              <p>{addressData.phone}</p>
              <p>{user?.email}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              {!isPaymentCompleted && (
                <Link href={`/checkout/payment?addressId=${addressId}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {getPaymentIcon(paymentData.paymentMethod)}
              <span className="font-medium">
                {getPaymentLabel(paymentData.paymentMethod)}
              </span>
              {paymentData.paymentIntentId && (
                <span className="text-xs text-gray-500">
                  (Payment ID: {paymentData.paymentIntentId.slice(-8)})
                </span>
              )}
            </div>
            {isPaymentCompleted && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Payment completed successfully
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Order Items ({selectedItems.length})
            </h3>
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <Image
                    src={item.product?.image_url || "/placeholder.svg"}
                    alt={item.product?.name || "Product"}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product?.name}</h4>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      RM
                      {((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Place Order Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Order...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {isPaymentCompleted ? "Create Order" : "Place Order"}
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              {isPaymentCompleted
                ? "Payment completed. Click to create your order."
                : "By placing this order, you agree to our Terms of Service and Privacy Policy."}
            </p>
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div className="lg:col-span-1">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}
