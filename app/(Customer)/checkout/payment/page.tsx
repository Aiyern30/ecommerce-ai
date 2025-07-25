"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  RadioGroup,
  RadioGroupItem,
  Label,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { CheckoutStepper } from "@/components/Checkout/CheckoutStepper";
import { CheckoutSummary } from "@/components/Checkout/CheckoutSummary";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Truck,
  Building,
} from "lucide-react";
import Link from "next/link";

const paymentSchema = z.object({
  paymentMethod: z.enum(["card", "fpx", "cash_on_delivery"], {
    required_error: "Please select a payment method",
  }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const defaultValues: Partial<PaymentFormData> = {
  paymentMethod: "card",
};

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState<{
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
  } | null>(null);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  });

  useEffect(() => {
    // Check if address data exists
    const savedAddress = localStorage.getItem("checkout-address");
    if (!savedAddress) {
      router.push("/checkout/address");
      return;
    }
    setAddressData(JSON.parse(savedAddress));
  }, [router]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);

    try {
      // Store payment method data
      localStorage.setItem("checkout-payment", JSON.stringify(data));

      // Navigate to confirmation step
      router.push("/checkout/confirm");
    } catch (error) {
      console.error("Error saving payment method:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!addressData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
            { label: "Payment" },
          ]}
        />

        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Payment Method</h1>
          <Link href="/checkout/address">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Address
            </Button>
          </Link>
        </div>
      </div>

      {/* Checkout Stepper */}
      <div className="mb-8">
        <CheckoutStepper currentStep={3} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium">
                {addressData.firstName} {addressData.lastName}
              </p>
              <p>{addressData.address}</p>
              {addressData.apartment && <p>{addressData.apartment}</p>}
              <p>
                {addressData.city}, {addressData.state} {addressData.postalCode}
              </p>
              <p>{addressData.country}</p>
              <p className="mt-2">{addressData.phone}</p>
              <p>{addressData.email}</p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">
              Choose Payment Method
            </h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-4"
                        >
                          {/* Credit/Debit Card (Stripe) */}
                          <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <RadioGroupItem value="card" id="card" />
                            <Label
                              htmlFor="card"
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                            >
                              <CreditCard className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">
                                  Credit/Debit Card (via Stripe)
                                </p>
                                <p className="text-sm text-gray-500">
                                  Pay securely with your card using Stripe
                                </p>
                              </div>
                            </Label>
                          </div>

                          {/* FPX Online Banking (Stripe) */}
                          <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <RadioGroupItem value="fpx" id="fpx" />
                            <Label
                              htmlFor="fpx"
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                            >
                              <Building className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">
                                  FPX Online Banking (via Stripe)
                                </p>
                                <p className="text-sm text-gray-500">
                                  Pay with Malaysian online banking (FPX)
                                  through Stripe
                                </p>
                              </div>
                            </Label>
                          </div>

                          {/* Cash on Delivery */}
                          <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <RadioGroupItem
                              value="cash_on_delivery"
                              id="cash_on_delivery"
                            />
                            <Label
                              htmlFor="cash_on_delivery"
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                            >
                              <Truck className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="font-medium">Cash on Delivery</p>
                                <p className="text-sm text-gray-500">
                                  Pay when your order arrives
                                </p>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Method Details */}

                {form.watch("paymentMethod") === "fpx" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      FPX Online Banking (via Stripe)
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        Pay securely using your Malaysian online banking account
                        (FPX) through Stripe.
                      </p>
                      <p className="mt-2">
                        You will be redirected to Stripe to complete your
                        payment.
                      </p>
                    </div>
                  </div>
                )}

                {form.watch("paymentMethod") === "cash_on_delivery" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Cash on Delivery</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay with cash when your order is delivered. Additional COD
                      fee of RM5.00 will be added to your total.
                    </p>
                  </div>
                )}

                {form.watch("paymentMethod") === "card" && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Secure Card Payment</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your payment information is encrypted and secure. We
                      accept Visa, Mastercard, and other major credit cards.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        Review Order
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
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
