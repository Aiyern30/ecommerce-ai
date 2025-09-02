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
import { Loader2, CreditCard, Shield, AlertTriangle } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { useCart } from "@/components/CartProvider";
import type { Address } from "@/lib/user/address";
import { clearPaymentSession } from "./StripeProvider";
import { getCountryCode } from "@/utils/country-codes";
import { getProductPrice } from "@/lib/cart/utils";
import { SelectedServiceDetails } from "@/type/selectedServiceDetails";
import { AdditionalService } from "@/type/additionalService";
import { FreightCharge } from "@/type/freightCharges";
import { formatCurrency } from "@/lib/utils/currency";

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
  onPaymentStart?: () => void;
  onPaymentError?: (error: string) => void;
  isProcessing?: boolean;
  billingDetails: BillingDetails;
  shippingAddress: Address;
  selectedServices: { [serviceCode: string]: SelectedServiceDetails | null };
  additionalServices: AdditionalService[];
  freightCharges: FreightCharge[];
  totalVolume: number;
}

export function StripePaymentForm({
  onSuccess,

  isProcessing = false,
  billingDetails,
  shippingAddress,
  selectedServices,
  additionalServices,
  freightCharges,
  totalVolume,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();
  const { cartItems, refreshCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>("");

  // Generate idempotency key for this payment attempt
  const [idempotencyKey] = useState(
    () => `${user?.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  const selectedItems = cartItems.filter((item) => item.selected);

  const subtotal = selectedItems.reduce((sum, item) => {
    const itemPrice = getProductPrice(item.product, item.variant_type);
    return sum + itemPrice * item.quantity;
  }, 0);

  const servicesTotal = additionalServices.reduce((sum, service) => {
    if (selectedServices[service.service_code]) {
      return sum + service.rate_per_m3 * totalVolume;
    }
    return sum;
  }, 0);

  const getApplicableFreightCharge = (): FreightCharge | null => {
    if (totalVolume === 0) return null;

    return (
      freightCharges.find((charge) => {
        const minVol = charge.min_volume;
        const maxVol = charge.max_volume;

        if (maxVol === null) {
          return totalVolume >= minVol;
        } else {
          return totalVolume >= minVol && totalVolume <= maxVol;
        }
      }) || null
    );
  };

  const applicableFreightCharge = getApplicableFreightCharge();
  const freightCost = applicableFreightCharge
    ? applicableFreightCharge.delivery_fee
    : 0;

  const taxableAmount = subtotal + servicesTotal + freightCost;
  const tax = taxableAmount * 0.06;

  const total = taxableAmount + tax;

  const selectedItemsCount = selectedItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

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
    setLoading(true);
    setError(null);
    setProcessingStage("Validating payment form...");

    if (!stripe || !elements || !user) {
      setError("Payment system not ready or user not logged in");
      setLoading(false);
      setProcessingStage("");
      return;
    }

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message || "Payment form validation failed");
        setLoading(false);
        setProcessingStage("");
        return;
      }

      setProcessingStage("Creating payment intent...");

      // Log the data being sent for debugging
      console.log("Selected items being sent:", selectedItems);
      console.log("Subtotal calculated:", subtotal);
      console.log("Services total:", servicesTotal);
      console.log("Freight cost:", freightCost);
      console.log("Tax:", tax);
      console.log("Total:", total);

      // Send comprehensive order data to create-payment-intent
      const paymentIntentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          items: selectedItems,
          shippingAddress,
          selectedServices,
          additionalServices,
          freightCharges,
          totalVolume,
          userId: user.id,
        }),
      });

      let errorData = null;
      try {
        errorData = await paymentIntentResponse.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
      }

      if (!paymentIntentResponse.ok) {
        console.error("API Error:", {
          status: paymentIntentResponse.status,
          statusText: paymentIntentResponse.statusText,
          data: errorData,
        });

        const errorMessage =
          errorData?.error ||
          errorData?.details ||
          "Failed to create payment intent";
        throw new Error(errorMessage);
      }

      const { clientSecret, orderId } = errorData;

      if (!clientSecret || !orderId) {
        throw new Error("Invalid response from payment intent creation");
      }

      console.log("PaymentIntent created for order:", orderId);

      setProcessingStage("Processing payment...");

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          clientSecret,
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
          redirect: "if_required",
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setLoading(false);
        setProcessingStage("");
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setProcessingStage("Payment successful! Verifying order...");

        try {
          // Verify payment and update order status
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error("Payment verification failed");
          }

          clearPaymentSession();

          // Clear selected services from localStorage
          localStorage.removeItem("selectedServices");

          try {
            // Force refresh cart to reflect quantity changes
            await refreshCart();
          } catch (refreshError) {
            console.warn("Failed to refresh cart:", refreshError);
          }

          setProcessingStage("Order created successfully!");
          setTimeout(() => {
            onSuccess(orderId);
          }, 500);
        } catch (verifyError) {
          console.error("Error verifying payment:", verifyError);
          setError(
            "Payment succeeded but verification failed. Please contact support with order ID: " +
              orderId
          );
        }
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        setProcessingStage("Additional authentication required...");

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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setProcessingStage("");
    }
  };

  return (
    <div className="space-y-6">
      {/* TEST MODE NOTICE UI */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-2 flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-semibold text-yellow-800 dark:text-yellow-200">
            Test Mode:
          </span>
          <span className="text-yellow-700 dark:text-yellow-300">
            &nbsp;You are currently in test mode. You can safely enter any
            bank/card details; no real money will be deducted from your account.
            <br />
            If you are concerned, use the following test card:
            <br />
            <span className="font-mono bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded inline-block mt-1">
              4242 4242 4242 4242 &nbsp; Exp: 12/27 &nbsp; CVC: 484
            </span>
          </span>
        </div>
      </div>
      {/* END TEST MODE NOTICE UI */}

      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <Shield className="h-4 w-4 text-green-600" />
        <span>Secured by Stripe • SSL Encrypted</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 min-h-[300px]">
          <PaymentElement options={paymentElementOptions} />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {processingStage && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                {processingStage}
              </p>
            </div>
          </div>
        )}

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

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Products Subtotal ({selectedItemsCount} items)
              </span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {servicesTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Services Total
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(servicesTotal)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Delivery Fee
                {applicableFreightCharge && (
                  <span className="text-xs block text-gray-500">
                    ({applicableFreightCharge.description})
                  </span>
                )}
              </span>
              <span
                className={`font-medium ${
                  freightCost === 0 ? "text-green-600 dark:text-green-400" : ""
                }`}
              >
                {freightCost === 0 ? "FREE" : formatCurrency(freightCost)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tax (SST 6%)
              </span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>

            {freightCost === 0 && totalVolume >= 4.5 && (
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-700">
                🎉 Free delivery for orders 4.5m³ and above!
              </div>
            )}

            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !stripe || selectedItems.length === 0}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {loading || isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {processingStage || "Processing Payment & Creating Order..."}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Pay {formatCurrency(total)} & Place Order</span>
            </div>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>Your payment information is secure and encrypted</p>
        <p className="mt-1">Powered by Stripe • PCI DSS Compliant</p>
      </div>
    </div>
  );
}
