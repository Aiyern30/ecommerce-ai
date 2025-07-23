"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import type { PaymentIntent } from "@stripe/stripe-js";

interface PaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: (paymentIntent: PaymentIntent) => void;
}

export default function PaymentForm({
  orderId,
  amount,
  onSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
      toast.error(error.message || "Payment failed");
    } else if (paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      onSuccess(paymentIntent);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium text-lg mb-2">Order Summary</h3>
        <div className="flex justify-between">
          <span>Order #{orderId.slice(-8)}</span>
          <span className="font-medium">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {message && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}
