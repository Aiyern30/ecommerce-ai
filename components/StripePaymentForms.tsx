"use client";

import type React from "react";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Loader2, CreditCard, Shield } from "lucide-react";
import { createOrderAPI, calculateOrderTotals } from "@/lib/order/api";
import { useUser } from "@supabase/auth-helpers-react";
import { useCart } from "@/components/CartProvider";
import type { Address } from "@/lib/user/address";
import { clearPaymentSession } from "./StripeProvider";
import { formatCurrency } from "@/lib/cart/calculations";
import { getCountryCode } from "@/utils/country-codes";

interface BillingDetails {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  phone?: string;
}

interface StripePaymentFormProps {
  onSuccess: (orderId: string) => void;
  billingDetails: BillingDetails;
  shippingAddress: Address;
}

export function StripePaymentForm({
  onSuccess,
  billingDetails,
  shippingAddress,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();
  const { cartItems, refreshCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the shared calculation function
  const totals = calculateOrderTotals(cartItems);

  // PaymentElement options
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    paymentMethodOrder: ["card", "fpx"],
    fields: {
      billingDetails: {
        name: "auto",
        email: "auto",
        phone: "auto",
        address: {
          line1: "auto",
          line2: "auto",
          city: "auto",
          state: "auto",
          postalCode: "auto",
          country: "auto",
        },
      },
    },
    terms: {
      card: "auto",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements || !user) {
      setError("Payment system not ready or user not logged in");
      setIsProcessing(false);
      return;
    }

    try {
      // Step 1: Submit the form to validate payment details
      console.log("Submitting payment form...");
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message || "Payment form validation failed");
        setIsProcessing(false);
        return;
      }

      console.log("Creating PaymentIntent for amount:", totals.total, "RM");

      // Step 2: Create PaymentIntent after form validation
      const paymentIntentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totals.total, // Send in RM
          currency: "myr",
        }),
      });

      if (!paymentIntentResponse.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret, paymentIntentId } =
        await paymentIntentResponse.json();
      console.log("PaymentIntent created:", paymentIntentId);

      // Step 3: Confirm payment with the newly created PaymentIntent
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          clientSecret, // Use the newly created client secret
          confirmParams: {
            return_url: `${window.location.origin}/checkout/confirm`,
            payment_method_data: {
              billing_details: {
                name: billingDetails.name,
                address: {
                  line1: billingDetails.address.line1,
                  line2: billingDetails.address.line2,
                  city: billingDetails.address.city,
                  state: billingDetails.address.state,
                  postal_code: billingDetails.address.postal_code,
                  country: getCountryCode(billingDetails.address.country),
                },
                phone: billingDetails.phone,
              },
            },
          },
          redirect: "if_required", // Only redirect for payment methods that require it (like FPX)
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Step 4: Payment completed successfully - CREATE THE ORDER IMMEDIATELY
        console.log(
          "Payment succeeded, creating order immediately:",
          paymentIntent.id
        );

        try {
          // Create order with the completed PaymentIntent ID
          const orderResult = await createOrderAPI(
            user.id,
            cartItems,
            shippingAddress.id, // Pass address ID instead of full address object
            paymentIntent.id, // Pass the completed PaymentIntent ID
            undefined // notes
          );

          if (!orderResult) {
            throw new Error("Failed to create order after successful payment");
          }

          console.log("Order created successfully:", orderResult.order_id);

          // Clear payment session data since payment is completed
          clearPaymentSession();

          // Force refresh cart to reflect the cleared items
          try {
            await refreshCart();
            console.log("Cart refreshed after order creation");
          } catch (refreshError) {
            console.warn("Failed to refresh cart:", refreshError);
          }

          // Small delay to ensure cart state is updated
          setTimeout(() => {
            onSuccess(orderResult.order_id);
          }, 500);
        } catch (orderError) {
          console.error("Error creating order after payment:", orderError);
          setError(
            "Payment succeeded but failed to create order. Please contact support with payment ID: " +
              paymentIntent.id
          );
        }
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // Handle 3D Secure or other authentication
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/confirm`,
          },
        });

        if (confirmError) {
          setError(confirmError.message || "Payment authentication failed");
        }
      } else {
        setError("Payment processing failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <Shield className="h-4 w-4 text-green-600" />
        <span>Secured by Stripe • SSL Encrypted</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element Container */}
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 min-h-[300px]">
          <PaymentElement options={paymentElementOptions} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Multiple payment methods available
              </p>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Credit/Debit Cards (Visa, Mastercard, etc.)</li>
                <li>• FPX Online Banking (Malaysian banks)</li>
                <li>• Link by Stripe (if available)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Order Total Display */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Subtotal ({totals.selectedItemsCount} items)
              </span>
              <span className="font-medium">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span
                className={`font-medium ${
                  totals.shippingCost === 0
                    ? "text-green-600 dark:text-green-400"
                    : ""
                }`}
              >
                {totals.shippingCost === 0
                  ? "FREE"
                  : formatCurrency(totals.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tax (SST 6%)
              </span>
              <span className="font-medium">{formatCurrency(totals.tax)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isProcessing || !stripe}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing Payment & Creating Order...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Pay {formatCurrency(totals.total)} & Place Order</span>
            </div>
          )}
        </Button>
      </form>

      {/* Trust Indicators */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>Your payment information is secure and encrypted</p>
        <p className="mt-1">Powered by Stripe • PCI DSS Compliant</p>
      </div>
    </div>
  );
}
