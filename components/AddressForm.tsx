"use client";

import type React from "react";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Button, Input, Label } from "@/components/ui";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TypographyH4, TypographyP } from "@/components/ui/Typography";
import type { Address } from "@/lib/user/address";

interface AddressFormProps {
  onSuccess: (address: Address) => void;
  onCancel: () => void;
  initialData?: Partial<Address>;
  isEditing?: boolean;
}

export function AddressForm({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}: AddressFormProps) {
  const supabase = createClientComponentClient();
  const user = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    phone: initialData?.phone || "",
    address_line1: initialData?.address_line1 || "",
    address_line2: initialData?.address_line2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postal_code: initialData?.postal_code || "",
    country: initialData?.country || "Malaysia",
    is_default: initialData?.is_default || false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const addressData = {
        ...formData,
        user_id: user.id,
      };

      let result;
      if (isEditing && initialData?.id) {
        const { data, error } = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", initialData.id)
          .eq("user_id", user.id)
          .select()
          .single();

        result = { data, error };
      } else {
        const { data, error } = await supabase
          .from("addresses")
          .insert(addressData)
          .select()
          .single();

        result = { data, error };
      }

      if (result.error) throw result.error;

      // If this is set as default, update other addresses
      if (formData.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .neq("id", result.data.id);
      }

      onSuccess(result.data);
      toast.success(
        isEditing
          ? "Address updated successfully!"
          : "Address added successfully!"
      );
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <TypographyH4>Personal Information</TypographyH4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g., +60123456789"
              required
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <TypographyH4>Address Information</TypographyH4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_line1">
              Address Line 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              placeholder="Street address, building name, etc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
            <Input
              id="address_line2"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, unit, etc."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">
                Postal Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                placeholder="12345"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-red-500">*</span>
            </Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Country"
              required
            />
          </div>
        </div>
      </div>

      {/* Default Address Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_default"
          name="is_default"
          checked={formData.is_default}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="is_default" className="text-sm font-medium">
          Set as default address
        </Label>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-transparent"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isEditing ? "Updating..." : "Adding..."}</span>
            </div>
          ) : (
            <span>{isEditing ? "Update Address" : "Add Address"}</span>
          )}
        </Button>
      </div>

      <TypographyP className="text-xs text-gray-500 text-center">
        <span className="text-red-500">*</span> Required fields
      </TypographyP>
    </form>
  );
}
