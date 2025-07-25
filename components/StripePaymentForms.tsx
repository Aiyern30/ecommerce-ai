"use client";

import type React from "react";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type {
  PaymentIntent,
  StripePaymentElementOptions,
} from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Loader2, CreditCard, Shield } from "lucide-react";
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

export function StripePaymentForm({
  onSuccess,
  billingDetails,
}: {
  onSuccess: (paymentResult: PaymentIntent) => void;
  billingDetails: BillingDetails;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (!stripe || !elements) {
      setError("Stripe not loaded");
      setIsProcessing(false);
      return;
    }

    // Confirm payment with the PaymentElement
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
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
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent);
    } else if (paymentIntent && paymentIntent.status === "requires_action") {
      // Handle 3D Secure or other authentication
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirm`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || "Payment authentication failed");
      }
      setIsProcessing(false);
    } else {
      setError("Payment processing failed. Please try again.");
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
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Complete Payment</span>
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
