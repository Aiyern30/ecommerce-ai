"use client";

import type React from "react";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeProviderProps {
  children: React.ReactNode;
  amount: number; // Amount in cents (e.g., 2300 for RM23.00)
}

export function StripeProvider({ children, amount }: StripeProviderProps) {
  // No state needed since we're not managing PaymentIntent creation here

  // Validate amount
  if (amount < 100) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-semibold mb-2">Invalid Amount</h3>
            <p className="text-red-600 text-sm">
              Minimum order amount is RM1.00
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No clientSecret needed upfront - we'll create PaymentIntent when user confirms payment
  const options = {
    mode: "payment" as const,
    amount: amount,
    currency: "myr",
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#0570de",
        colorBackground: "#ffffff",
        colorText: "#30313d",
        colorDanger: "#df1b41",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

// Utility function to clear payment data when order is completed
export function clearPaymentSession() {
  sessionStorage.removeItem("stripe-client-secret");
  sessionStorage.removeItem("stripe-amount");
  sessionStorage.removeItem("stripe-payment-intent-id");
  console.log("Payment session data cleared");
}
