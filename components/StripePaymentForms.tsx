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
import { createOrderAPI } from "@/lib/order/api";
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
  billingDetails: BillingDetails;
  shippingAddress: Address;
  selectedServices: { [serviceCode: string]: SelectedServiceDetails | null };
  additionalServices: AdditionalService[];
  freightCharges: FreightCharge[];
  totalVolume: number;
}

export function StripePaymentForm({
  onSuccess,
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements || !user) {
      setError("Payment system not ready or user not logged in");
      setIsProcessing(false);
      return;
    }

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message || "Payment form validation failed");
        setIsProcessing(false);
        return;
      }

      const paymentIntentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          currency: "myr",
        }),
      });

      if (!paymentIntentResponse.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret, paymentIntentId } =
        await paymentIntentResponse.json();
      console.log("PaymentIntent created:", paymentIntentId);

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
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        try {
          const orderResult = await createOrderAPI(
            user.id,
            cartItems,
            shippingAddress.id,
            paymentIntent.id,
            undefined,
            selectedServices,
            additionalServices,
            freightCharges,
            totalVolume
          );

          if (!orderResult) {
            throw new Error("Failed to create order after successful payment");
          }

          clearPaymentSession();

          try {
            await refreshCart();
          } catch (refreshError) {
            console.warn("Failed to refresh cart:", refreshError);
          }

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
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {error}
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
