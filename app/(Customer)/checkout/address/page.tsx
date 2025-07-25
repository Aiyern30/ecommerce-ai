"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { CheckoutStepper } from "@/components/Checkout/CheckoutStepper";
import { CheckoutSummary } from "@/components/Checkout/CheckoutSummary";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Address } from "@/lib/user/address";

const addressSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(1, "Please select a state"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  country: z.string().min(1, "Please select a country"),
  saveAddress: z.boolean().default(false),
  notes: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

const defaultValues: Partial<AddressFormData> = {
  country: "Malaysia",
  state: "Kuala Lumpur",
  saveAddress: false,
};

const malaysianStates = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Malacca",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
];

export default function CheckoutAddressPage() {
  const supabase = createClientComponentClient();
  const user = useUser();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  // Fetch user addresses
  useEffect(() => {
    if (user) {
      supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setAddresses(data);
        });
    }
  }, [supabase, user]);

  // Handle form submit for new address
  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      if (!user) return;

      const { data: inserted, error } = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          full_name: data.firstName + " " + data.lastName,
          phone: data.phone,
          address_line1: data.address,
          address_line2: data.apartment,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
          country: data.country,
        })
        .select()
        .single();

      if (error || !inserted) {
        console.error("Error inserting new address:", error);
      } else {
        // Proceed: new address inserted
        setSelectedAddressId(inserted.id);
        router.push("/checkout/payment?addressId=" + inserted.id);
      }
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUseExistingAddress = () => {
    if (selectedAddressId) {
      router.push("/checkout/payment?addressId=" + selectedAddressId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <BreadcrumbNav
          customItems={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout", href: "/checkout" },
            { label: "Address" },
          ]}
        />
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Shipping Address</h1>
          <Link href="/checkout">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <CheckoutStepper currentStep={2} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Select Shipping Address
            </h2>
            {addresses.length > 0 && (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setShowNewAddressForm(false);
                    }}
                    className={cn(
                      "border p-4 rounded cursor-pointer",
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/10"
                        : "border-gray-300"
                    )}
                  >
                    <div className="font-semibold">{addr.full_name}</div>
                    <div className="text-sm text-gray-500">
                      {addr.address_line1}, {addr.city}, {addr.state},{" "}
                      {addr.postal_code}, {addr.country}
                    </div>
                    {addr.phone && (
                      <div className="text-sm text-gray-500">
                        Phone: {addr.phone}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button
                variant={showNewAddressForm ? "default" : "outline"}
                onClick={() => {
                  setShowNewAddressForm(true);
                  setSelectedAddressId(null);
                }}
              >
                + Use a new address
              </Button>
            </div>
          </div>

          {/* New address form OR confirm selected */}
          {showNewAddressForm ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">
                New Shipping Address
              </h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+60123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Information */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartment, Suite, Unit (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apt 4B" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Kuala Lumpur" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {malaysianStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Malaysia">Malaysia</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="Thailand">Thailand</SelectItem>
                            <SelectItem value="Indonesia">Indonesia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Special Instructions */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special delivery instructions..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Save Address Option */}
                  <FormField
                    control={form.control}
                    name="saveAddress"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Save this address for future orders
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[200px]"
                    >
                      {isSubmitting ? (
                        "Saving..."
                      ) : (
                        <>
                          Continue to Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          ) : selectedAddressId ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">
                Confirm Shipping Address
              </h2>
              <p>
                Selected:{" "}
                {
                  addresses.find((a) => a.id === selectedAddressId)
                    ?.address_line1
                }
                , {addresses.find((a) => a.id === selectedAddressId)?.city}
              </p>
              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleUseExistingAddress}
                  className="min-w-[200px]"
                >
                  Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <p>Select an address or add new to continue.</p>
          )}
        </div>

        {/* Right side summary */}
        <div className="lg:col-span-1">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}
