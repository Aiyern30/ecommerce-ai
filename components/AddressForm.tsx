/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Checkbox } from "@/components/ui";
import {
  AddressAutocomplete,
  AddressAutocompleteRef,
  AddressComponents,
} from "@/components/GoogleMaps/AddressAutocomplete";
import { MapDisplay } from "@/components/GoogleMaps/MapDisplay";
import { toast } from "sonner";
import { MapPin, Map } from "lucide-react";
import type { Address } from "@/lib/user/address";

interface AddressFormProps {
  onSuccess: (address: Address) => void;
  onCancel: () => void;
  initialData?: Address;
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
  const autocompleteRef = useRef<AddressAutocompleteRef>(null);

  // Updated form structure to match your Address interface
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

  const [isAddressValid, setIsAddressValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapAddress, setMapAddress] = useState<AddressComponents | undefined>();
  const [locationError, setLocationError] = useState<string>("");

  // Memoize default KL address to fix dependency warning
  const defaultKLAddress = useMemo(
    (): AddressComponents => ({
      lat: 3.139,
      lng: 101.6869,
      formatted_address: "Kuala Lumpur, Malaysia",
      locality: "Kuala Lumpur",
      administrative_area_level_1: "Kuala Lumpur",
      country: "Malaysia",
      postal_code: "50000",
    }),
    []
  );

  // Move getCurrentLocation to useCallback with proper dependencies
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setMapAddress({
            ...location,
            formatted_address: "Your current location",
          });
          setLocationError("");
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to get current location");
          // Fallback to KL
          setMapAddress(defaultKLAddress);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setLocationError("Geolocation is not supported");
      // Fallback to KL
      setMapAddress(defaultKLAddress);
    }
  }, [defaultKLAddress]);

  // Get current location on component mount
  useEffect(() => {
    if (initialData?.address_line1) {
      // If editing existing address, show that location on map
      setMapAddress({
        lat: 3.139, // You might want to store lat/lng in your address table
        lng: 101.6869,
        formatted_address: `${initialData.address_line1}, ${initialData.city}, ${initialData.state}`,
        locality: initialData.city,
        administrative_area_level_1: initialData.state,
        country: initialData.country,
        postal_code: initialData.postal_code,
      });
    } else {
      // Try to get current location
      getCurrentLocation();
    }
  }, [initialData, getCurrentLocation]);

  const handleAddressSelect = (address: AddressComponents) => {
    setMapAddress(address); // Update map immediately

    // Auto-fill form fields from Google Places
    setFormData((prev) => ({
      ...prev,
      // Combine street_number and route for address_line1
      address_line1:
        [address.street_number, address.route]
          .filter(Boolean)
          .join(" ")
          .trim() || prev.address_line1,

      city: address.locality || prev.city,
      state: address.administrative_area_level_1 || prev.state,
      postal_code: address.postal_code || prev.postal_code,
      country: address.country || prev.country,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_default: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setIsLoading(true);

    try {
      // Validation
      if (!formData.full_name.trim()) {
        toast.error("Please enter full name");
        return;
      }
      if (!formData.phone.trim()) {
        toast.error("Please enter phone number");
        return;
      }
      if (!formData.address_line1.trim()) {
        toast.error("Please enter address line 1");
        return;
      }
      if (!formData.city.trim()) {
        toast.error("Please enter city");
        return;
      }
      if (!formData.state.trim()) {
        toast.error("Please enter state");
        return;
      }
      if (!formData.postal_code.trim()) {
        toast.error("Please enter postal code");
        return;
      }

      const addressData = {
        user_id: user.id,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2?.trim() || null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
        country: formData.country,
        is_default: formData.is_default,
      };

      let result;
      if (isEditing && initialData) {
        result = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", initialData.id)
          .eq("user_id", user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("addresses")
          .insert(addressData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // If this address is set as default, unset other default addresses
      if (formData.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .neq("id", result.data.id);
      }

      onSuccess(result.data);
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error.message || "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Malaysia",
      is_default: false,
    });
    setIsAddressValid(false);
    autocompleteRef.current?.clearInput();
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setMapAddress({
        ...currentLocation,
        formatted_address: "Your current location",
      });
      toast.success("Using your current location");
    } else {
      getCurrentLocation();
    }
  };

  const handleUseKLLocation = () => {
    setMapAddress(defaultKLAddress);
    setFormData((prev) => ({
      ...prev,
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postal_code: "50000",
      country: "Malaysia",
    }));
    toast.success("Using Kuala Lumpur location");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Google Places Autocomplete */}
      <div className="space-y-2">
        <Label htmlFor="google-address" className="text-sm font-medium">
          Search Address with Google Maps
        </Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <AddressAutocomplete
              ref={autocompleteRef}
              onAddressSelect={handleAddressSelect}
              onValidationChange={setIsAddressValid}
              placeholder="Type to search for your address..."
              className="w-full"
            />
          </div>
        </div>
        {isAddressValid && (
          <p className="text-sm text-green-600">
            ✓ Address found and coordinates saved
          </p>
        )}
        {locationError && (
          <p className="text-sm text-orange-600">⚠ {locationError}</p>
        )}
      </div>

      {/* Location Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Use Current Location
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseKLLocation}
          className="flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          Use KL Default
        </Button>
      </div>

      {/* Map Display - Always Visible */}
      {mapAddress && (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">
              {mapAddress.formatted_address || "Selected Location"}
            </span>
          </div>
          <MapDisplay address={mapAddress} height="300px" zoom={16} />
          <div className="mt-2 text-xs text-gray-500">
            📍 Lat: {mapAddress.lat?.toFixed(6)}, Lng:{" "}
            {mapAddress.lng?.toFixed(6)}
          </div>
        </div>
      )}

      {/* Manual Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+60123456789"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address_line1">Address Line 1 *</Label>
          <Input
            id="address_line1"
            name="address_line1"
            type="text"
            value={formData.address_line1}
            onChange={handleInputChange}
            placeholder="Street address, building name, etc."
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address_line2">Address Line 2</Label>
          <Input
            id="address_line2"
            name="address_line2"
            type="text"
            value={formData.address_line2}
            onChange={handleInputChange}
            placeholder="Apartment, suite, unit, etc. (optional)"
          />
        </div>

        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="City"
            required
          />
        </div>

        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            name="state"
            type="text"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="State"
            required
          />
        </div>

        <div>
          <Label htmlFor="postal_code">Postal Code *</Label>
          <Input
            id="postal_code"
            name="postal_code"
            type="text"
            value={formData.postal_code}
            onChange={handleInputChange}
            placeholder="12345"
            required
          />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            type="text"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Malaysia"
            required
          />
        </div>
      </div>

      {/* Default Address Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          name="is_default"
          checked={formData.is_default}
          onCheckedChange={handleCheckboxChange}
        />

        <Label htmlFor="is_default" className="text-sm">
          Set as default address
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading
            ? "Saving..."
            : isEditing
            ? "Update Address"
            : "Save Address"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        {!isEditing && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearForm}
            disabled={isLoading}
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
