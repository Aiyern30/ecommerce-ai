"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui";
import { CheckoutStepper } from "@/components/Checkout/CheckoutStepper";
import { CheckoutSummary } from "@/components/Checkout/CheckoutSummary";
import { AddressForm } from "@/components/AddressForm";
import { AddressCard } from "@/components/AddressCard";
import { Plus, MapPin, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/CartProvider";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import type { Address } from "@/lib/user/address";
import Link from "next/link";

export interface SelectedServiceDetails {
  id: string;
  service_code: string;
  service_name: string;
  rate_per_m3: number;
  total_price: number;
  description?: string;
}

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

export default function CheckoutAddressPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const user = useUser();
  const { cartItems, isLoading: cartLoading } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            const parsed: { [serviceCode: string]: SelectedServiceDetails | null } = JSON.parse(savedServices);
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

  const fetchAddresses = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAddresses(data || []);

      // Auto-select default address or first address
      const defaultAddress = data?.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data && data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has selected items
    if (!cartLoading && selectedItems.length === 0) {
      toast.error("Please select items from your cart first");
      router.push("/cart");
      return;
    }

    fetchAddresses();
  }, [user, router, selectedItems.length, cartLoading, fetchAddresses]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handleAddressAdded = (newAddress: Address) => {
    setAddresses((prev) => [newAddress, ...prev]);
    setSelectedAddressId(newAddress.id);
    setShowAddForm(false);
    setEditingAddress(null);
    toast.success("Address added successfully!");
  };

  const handleAddressUpdated = (updatedAddress: Address) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === updatedAddress.id ? updatedAddress : addr
      )
    );
    setEditingAddress(null);
    setShowAddForm(false);
    toast.success("Address updated successfully!");
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));

    // If the deleted address was selected, select another one
    if (selectedAddressId === addressId) {
      const remainingAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );
      if (remainingAddresses.length > 0) {
        const defaultAddress = remainingAddresses.find(
          (addr) => addr.is_default
        );
        setSelectedAddressId(defaultAddress?.id || remainingAddresses[0].id);
      } else {
        setSelectedAddressId(null);
      }
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleContinueToPayment = () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    router.push(`/checkout/payment?addressId=${selectedAddressId}`);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <TypographyP>Redirecting to login...</TypographyP>
        </div>
      </div>
    );
  }

  if (cartLoading || isLoading) {
    return (
      <div className="min-h-screen mb-4">
        <div className="container mx-auto px-4 pt-0 pb-4">
          <div className="flex items-center justify-between">
            <TypographyH1 className="my-8">SHIPPING ADDRESS</TypographyH1>

            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <CheckoutStepper currentStep={2} />
          </div>

          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <TypographyP>Loading...</TypographyP>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartLoading && selectedItems.length === 0) {
    return (
      <div className="min-h-screen mb-4">
        <div className="container mx-auto px-4 pt-0 pb-4">
          <div className="flex items-center justify-between">
            <TypographyH1 className="my-8">SHIPPING ADDRESS</TypographyH1>

            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
            </Link>
          </div>

          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <TypographyH3 className="mb-4">No Items Selected</TypographyH3>
              <TypographyP className="text-gray-600 mb-4">
                Please select items from your cart to proceed with checkout.
              </TypographyP>
              <Button onClick={() => router.push("/cart")}>Go to Cart</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-0 pb-4">
      <div className="flex items-center justify-between">
        <TypographyH1 className="my-8">SHIPPING ADDRESS</TypographyH1>

        <Link href="/cart">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <CheckoutStepper currentStep={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Address Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add New Address Button */}
          <div className="flex justify-between items-center">
            <TypographyH3 className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Choose Shipping Address
            </TypographyH3>
            <Button
              variant="outline"
              onClick={() => {
                setEditingAddress(null);
                setShowAddForm(!showAddForm);
              }}
              className="flex items-center gap-2"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add New Address
                </>
              )}
            </Button>
          </div>

          {/* Add/Edit Address Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <TypographyH3 className="mb-4">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </TypographyH3>
              <AddressForm
                onSuccess={
                  editingAddress ? handleAddressUpdated : handleAddressAdded
                }
                onCancel={handleCancelForm}
                initialData={editingAddress || undefined}
                isEditing={!!editingAddress}
              />
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <TypographyH3 className="mb-2">No addresses found</TypographyH3>
              <TypographyP className="text-gray-600 dark:text-gray-400 mb-4">
                Add your first shipping address to continue with checkout.
              </TypographyP>
              <Button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isSelected={selectedAddressId === address.id}
                  onSelect={() => handleAddressSelect(address.id)}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                />
              ))}
            </div>
          )}

          {/* Continue Button */}
          {addresses.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <Button
                onClick={handleContinueToPayment}
                disabled={!selectedAddressId}
                className="w-full"
                size="lg"
              >
                Continue to Payment
              </Button>
              {!selectedAddressId && (
                <TypographyP className="text-sm text-gray-500 text-center mt-2">
                  Please select an address to continue
                </TypographyP>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 z-10">
            <CheckoutSummary
              selectedServices={selectedServices}
              totalVolume={totalVolume}
              additionalServices={additionalServices}
              freightCharges={freightCharges}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
