"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui";
import { StripeProvider } from "@/components/StripeProvider";
import { StripePaymentForm } from "@/components/StripePaymentForms";
import { CheckoutStepper } from "@/components/Checkout/CheckoutStepper";
import { CheckoutSummary } from "@/components/Checkout/CheckoutSummary";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Address } from "@/lib/user/address";

import {
  calculateCartTotals,
  convertToStripeAmount,
} from "@/lib/cart/calculations";
import { useCart } from "@/components/CartProvider";
import { getCountryCode } from "@/utils/country-codes";
import { TypographyH1 } from "@/components/ui/Typography";

interface AdditionalService {
  id: string;
  service_name: string;
  service_code: string;
  rate_per_m3: number;
  description: string;
  is_active: boolean;
}

interface FreightCharge {
  id: string;
  min_volume: number;
  max_volume: number | null;
  delivery_fee: number;
  description: string;
  is_active: boolean;
}

export interface SelectedServiceDetails {
  id: string;
  service_code: string;
  service_name: string;
  rate_per_m3: number;
  total_price: number;
  description?: string;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const user = useUser();
  const [addressData, setAddressData] = useState<Address | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const addressId = searchParams?.get("addressId");
  const { cartItems, isLoading } = useCart();

  // Additional services and localStorage state
  const [additionalServices, setAdditionalServices] = useState<
    AdditionalService[]
  >([]);
  const [freightCharges, setFreightCharges] = useState<FreightCharge[]>([]);
  const [selectedServices, setSelectedServices] = useState<{
    [serviceCode: string]: SelectedServiceDetails | null;
  }>({});

  const selectedItems = cartItems.filter((item) => item.selected);

  // Calculate total volume of selected items
  const totalVolume = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Fetch additional services and freight charges
  useEffect(() => {
    const fetchServicesAndCharges = async () => {
      try {
        // Fetch additional services
        const { data: services, error: servicesError } = await supabase
          .from("additional_services")
          .select("*")
          .eq("is_active", true)
          .order("service_name");

        // Fetch freight charges
        const { data: charges, error: chargesError } = await supabase
          .from("freight_charges")
          .select("*")
          .eq("is_active", true)
          .order("min_volume");

        if (servicesError) {
          console.error("Error fetching additional services:", servicesError);
        } else {
          setAdditionalServices(services || []);
        }

        if (chargesError) {
          console.error("Error fetching freight charges:", chargesError);
        } else {
          setFreightCharges(charges || []);
        }

        // Load selected services from localStorage (use SelectedServiceDetails type)
        const savedServices = localStorage.getItem("selectedServices");
        if (savedServices) {
          try {
            const parsed: { [serviceCode: string]: SelectedServiceDetails | null } = JSON.parse(
              savedServices
            );
            setSelectedServices(parsed);
          } catch (error) {
            console.error("Error parsing saved services:", error);
            localStorage.removeItem("selectedServices");
          }
        }
      } catch (error) {
        console.error("Error fetching services and charges:", error);
      }
    };

    fetchServicesAndCharges();
  }, [supabase]);

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
    const totals = calculateCartTotals(cartItems);

    if (totals.selectedItemsCount === 0) {
      setTotalAmount(0);
      // Redirect to cart if no items selected
      if (!isLoading) {
        router.push("/cart");
      }
      return;
    }

    // Convert to Stripe amount (cents)
    const stripeAmount = convertToStripeAmount(totals.total);
    setTotalAmount(stripeAmount);
  }, [cartItems, router, isLoading]);

  // Handle successful payment and order creation
  const handlePaymentSuccess = (orderId: string) => {
    console.log("Payment and order completed, redirecting to success page");
    // Clear localStorage after successful payment
    localStorage.removeItem("selectedServices");
    router.push(`/order-success?orderId=${orderId}`);
  };

  if (!addressData || totalAmount === 0 || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && selectedItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No Items Selected</h2>
          <p className="text-gray-600 mb-4">
            Please select items from your cart to proceed with checkout.
          </p>
          <Link href="/cart">
            <Button>Go to Cart</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-0 pb-4">
      <StripeProvider amount={totalAmount}>
        <div className="flex items-center justify-between">
          <TypographyH1 className="my-8">PAYMENT METHOD</TypographyH1>

          <Link href="/checkout/address">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Address
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <CheckoutStepper currentStep={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
              <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
              <StripePaymentForm
                onSuccess={handlePaymentSuccess}
                shippingAddress={addressData}
                selectedServices={selectedServices}
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

          <div className="lg:col-span-1">
            <CheckoutSummary
              selectedServices={selectedServices}
              totalVolume={totalVolume}
              additionalServices={additionalServices}
              freightCharges={freightCharges}
            />
          </div>
        </div>
      </StripeProvider>
    </div>
  );
}
