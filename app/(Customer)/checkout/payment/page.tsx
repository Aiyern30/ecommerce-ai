"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui";
import { StripeProvider } from "@/components/StripeProvider";
import { StripePaymentForm } from "@/components/StripePaymentForms";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { CheckoutStepper } from "@/components/Checkout/CheckoutStepper";
import { CheckoutSummary } from "@/components/Checkout/CheckoutSummary";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Address } from "@/lib/user/address";
import { getCountryCode } from "@/utils/country-codes";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const user = useUser();
  const [addressData, setAddressData] = useState<Address | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const addressId = searchParams.get("addressId");

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

  useEffect(() => {
    // Calculate total amount from cart or order summary
    // This should match your CheckoutSummary calculation
    // For now, using a placeholder - replace with your actual cart total logic
    const calculateTotal = () => {
      // Example: Get from localStorage, context, or API
      // const cartTotal = getCartTotal() // Your cart total function
      // Convert to cents: cartTotal * 100
      return 2300; // RM23.00 in cents - replace with actual calculation
    };

    setTotalAmount(calculateTotal());
  }, []);

  if (!addressData || totalAmount === 0) {
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
    <StripeProvider amount={totalAmount}>
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

            {/* Payment Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
              <StripePaymentForm
                onSuccess={() =>
                  router.push(
                    `/checkout/confirm?addressId=${addressId}&paymentSuccess=true`
                  )
                }
                billingDetails={{
                  name: addressData.full_name,
                  address: {
                    line1: addressData.address_line1,
                    line2: addressData.address_line2 || undefined,
                    city: addressData.city,
                    state: addressData.state,
                    postal_code: addressData.postal_code,
                    country: getCountryCode(addressData.country),
                  },
                  phone: addressData.phone || undefined,
                }}
              />
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
