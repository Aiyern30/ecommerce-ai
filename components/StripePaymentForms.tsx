import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui";
import { FpxBankElement } from "@stripe/react-stripe-js";

export function StripeCardForm({
  onSuccess,
}: {
  onSuccess: (paymentResult: PaymentIntent) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    if (!stripe || !elements) {
      setError("Stripe not loaded");
      setIsProcessing(false);
      return;
    }
    // Confirm card payment using PaymentIntent client secret from backend
    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(
        window.localStorage.getItem("stripe-client-secret") || "",
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );
    if (stripeError) {
      setError(stripeError.message || "Payment failed");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent);
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement options={{ hidePostalCode: true }} />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="min-w-[200px]"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}

export function StripeFPXForm({
  onSuccess,
}: {
  onSuccess: (paymentResult: PaymentIntent) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    if (!stripe || !elements) {
      setError("Stripe not loaded");
      setIsProcessing(false);
      return;
    }

    const fpxBank = elements.getElement(FpxBankElement);
    if (!fpxBank) {
      setError("Please select a bank");
      setIsProcessing(false);
      return;
    }

    const { error: stripeError, paymentIntent } =
      await stripe.confirmFpxPayment(
        window.localStorage.getItem("stripe-client-secret") || "",
        {
          payment_method: {
            fpx: fpxBank,
            billing_details: { name: "Customer" }, // replace as needed
          },
          return_url: window.location.origin + "/checkout/confirm",
        }
      );

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent);
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FpxBankElement
        options={{
          accountHolderType: "individual",
          style: { base: { fontSize: "16px", color: "#000" } },
        }}
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="min-w-[200px]"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}
