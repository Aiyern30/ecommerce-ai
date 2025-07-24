"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

interface AddressData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes?: string;
}

interface PaymentData {
  paymentMethod: "card" | "bank_transfer" | "cash_on_delivery";
}

export default function CheckoutConfirmPage() {
  const router = useRouter();
  const { cartItems } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    // Check if all required data exists
    const savedAddress = localStorage.getItem("checkout-address");
    const savedPayment = localStorage.getItem("checkout-payment");

    if (!savedAddress || !savedPayment) {
      router.push("/checkout/address");
      return;
    }

    setAddressData(JSON.parse(savedAddress));
    setPaymentData(JSON.parse(savedPayment));
  }, [router]);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "bank_transfer":
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
        return "Credit/Debit Card";
      case "bank_transfer":
        return "Bank Transfer";
      case "cash_on_delivery":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call to place order
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear checkout data
      localStorage.removeItem("checkout-address");
      localStorage.removeItem("checkout-payment");

      setOrderPlaced(true);
      toast.success("Order placed successfully!");

      // Redirect to success page after a delay
      setTimeout(() => {
        router.push("/order-success");
      }, 2000);
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

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We&apos;ll send you a confirmation email
          shortly.
        </p>
        <Button onClick={() => router.push("/")}>Continue Shopping</Button>
      </div>
    );
  }

  const selectedItems = cartItems.filter((item) => item.selected);

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
            { label: "Payment", href: "/checkout/payment" },
            { label: "Confirm" },
          ]}
        />

        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Review Your Order</h1>
          <Link href="/checkout/payment">
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
              <p className="font-medium">
                {addressData.firstName} {addressData.lastName}
              </p>
              <p>{addressData.address}</p>
              {addressData.apartment && <p>{addressData.apartment}</p>}
              <p>
                {addressData.city}, {addressData.state} {addressData.postalCode}
              </p>
              <p>{addressData.country}</p>
              <p className="mt-2 font-medium">Contact:</p>
              <p>{addressData.phone}</p>
              <p>{addressData.email}</p>
              {addressData.notes && (
                <>
                  <p className="mt-2 font-medium">Delivery Notes:</p>
                  <p className="text-gray-600">{addressData.notes}</p>
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <Link href="/checkout/payment">
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              {getPaymentIcon(paymentData.paymentMethod)}
              <span className="font-medium">
                {getPaymentLabel(paymentData.paymentMethod)}
              </span>
            </div>

            {paymentData.paymentMethod === "bank_transfer" && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please transfer to account 1234567890 (Maybank) using your
                  order ID as reference.
                </p>
              </div>
            )}

            {paymentData.paymentMethod === "cash_on_delivery" && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pay with cash when your order is delivered. COD fee: RM5.00
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
                  <span>Placing Order...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Place Order
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              By placing this order, you agree to our Terms of Service and
              Privacy Policy.
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
