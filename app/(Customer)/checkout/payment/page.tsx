"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import {
  Button,
  RadioGroup,
  RadioGroupItem,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Label,
} from "@/components/ui";
import { StripeProvider } from "@/components/StripeProvider";
import { StripeCardForm, StripeFPXForm } from "@/components/StripePaymentForms";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { CheckoutStepper } from "@/components/Checkout/CheckoutStepper";
import { CheckoutSummary } from "@/components/Checkout/CheckoutSummary";
import { ArrowLeft, CreditCard, Building } from "lucide-react";
import Link from "next/link";
import { Address } from "@/lib/user/address";

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
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const user = useUser();

  const [addressData, setAddressData] = useState<Address | null>(null);
  const addressId = searchParams.get("addressId");

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchAddress = async () => {
      if (!user) return;
      if (!addressId) {
        router.push("/checkout/address");
        return;
      }

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error("Address not found or error:", error);
        router.push("/checkout/address");
      } else {
        setAddressData(data);
      }
    };

    fetchAddress();
  }, [addressId, router, supabase, user]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      // ⚠ remove localStorage
      if (data.paymentMethod === "cash_on_delivery") {
        router.push(`/checkout/confirm?addressId=${addressId}`);
      }
      // Stripe forms handle their own submit & redirect
    } catch (error) {
      console.error("Error saving payment method:", error);
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
    <StripeProvider>
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

        {/* Stepper */}
        <div className="mb-8">
          <CheckoutStepper currentStep={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">{addressData.full_name}</p>
                <p>{addressData.address_line1}</p>
                {addressData.address_line2 && (
                  <p>{addressData.address_line2}</p>
                )}
                <p>
                  {addressData.city}, {addressData.state}{" "}
                  {addressData.postal_code}
                </p>
                <p>{addressData.country}</p>
                {addressData.phone && (
                  <p className="mt-2">{addressData.phone}</p>
                )}
              </div>
            </div>

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
                            {/* Credit / Debit Card */}
                            <Label
                              htmlFor="card"
                              className={`
      flex items-center space-x-3 border rounded-lg p-4 transition-colors cursor-pointer
      ${
        field.value === "card"
          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow"
          : "hover:bg-gray-50 dark:hover:bg-gray-700"
      }
    `}
                            >
                              <RadioGroupItem value="card" id="card" />
                              <CreditCard
                                className={`h-5 w-5 ${
                                  field.value === "card"
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  Credit/Debit Card (via Stripe)
                                </p>
                                <p className="text-sm text-gray-500">
                                  Pay securely with your card
                                </p>
                              </div>
                              {field.value === "card" && (
                                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5 text-xs">
                                  <span className="text-green-700 dark:text-green-300">
                                    Link
                                  </span>
                                  <span className="bg-white dark:bg-gray-800 px-1 rounded text-gray-800 dark:text-gray-100">
                                    VISA
                                  </span>
                                  <span>4242</span>
                                </div>
                              )}
                            </Label>

                            {/* FPX */}
                            <Label
                              htmlFor="fpx"
                              className={`
      flex items-center space-x-3 border rounded-lg p-4 transition-colors cursor-pointer
      ${
        field.value === "fpx"
          ? "border-green-600 bg-green-50 dark:bg-green-900/20 shadow"
          : "hover:bg-gray-50 dark:hover:bg-gray-700"
      }
    `}
                            >
                              <RadioGroupItem value="fpx" id="fpx" />
                              <Building
                                className={`h-5 w-5 ${
                                  field.value === "fpx"
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  FPX Online Banking (via Stripe)
                                </p>
                                <p className="text-sm text-gray-500">
                                  Pay with Malaysian online banking
                                </p>
                              </div>
                            </Label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              {/* Payment forms below */}
              {form.watch("paymentMethod") === "card" && (
                <StripeCardForm
                  onSuccess={() =>
                    router.push(`/checkout/confirm?addressId=${addressId}`)
                  }
                />
              )}
              {form.watch("paymentMethod") === "fpx" && (
                <StripeFPXForm
                  onSuccess={() =>
                    router.push(`/checkout/confirm?addressId=${addressId}`)
                  }
                />
              )}
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </StripeProvider>
  );
}
