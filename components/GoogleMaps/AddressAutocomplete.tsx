"use client";

import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
  country?: string;
  formatted_address?: string;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void;
  onValidationChange: (isValid: boolean) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export interface AddressAutocompleteRef {
  clearInput: () => void;
  setInputValue: (value: string) => void;
}

export const AddressAutocomplete = forwardRef<
  AddressAutocompleteRef,
  AddressAutocompleteProps
>(
  (
    {
      onAddressSelect,
      onValidationChange,
      placeholder = "Enter your address",
      defaultValue = "",
      className = "",
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(
      null
    );
    const [isLoaded, setIsLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      clearInput: () => {
        if (inputRef.current) {
          inputRef.current.value = "";
          onValidationChange(false);
        }
      },
      setInputValue: (value: string) => {
        if (inputRef.current) {
          inputRef.current.value = value;
        }
      },
    }));

    useEffect(() => {
      const initializeAutocomplete = async () => {
        try {
          const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
            version: "weekly",
            libraries: ["places"],
          });

          await loader.load();
          setIsLoaded(true);

          if (inputRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(
              inputRef.current,
              {
                types: ["address"],
                componentRestrictions: { country: "MY" }, // Restrict to Malaysia, change as needed
                fields: [
                  "address_components",
                  "formatted_address",
                  "geometry.location",
                  "place_id",
                ],
              }
            );

            autocompleteRef.current = autocomplete;

            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();

              if (!place.geometry || !place.geometry.location) {
                onValidationChange(false);
                return;
              }

              const addressComponents: AddressComponents = {
                formatted_address: place.formatted_address,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };

              // Parse address components
              place.address_components?.forEach((component) => {
                const componentType = component.types[0];
                switch (componentType) {
                  case "street_number":
                    addressComponents.street_number = component.long_name;
                    break;
                  case "route":
                    addressComponents.route = component.long_name;
                    break;
                  case "locality":
                    addressComponents.locality = component.long_name;
                    break;
                  case "administrative_area_level_1":
                    addressComponents.administrative_area_level_1 =
                      component.long_name;
                    break;
                  case "postal_code":
                    addressComponents.postal_code = component.long_name;
                    break;
                  case "country":
                    addressComponents.country = component.long_name;
                    break;
                }
              });

              onAddressSelect(addressComponents);
              onValidationChange(true);
            });
          }
        } catch (error) {
          console.error("Error loading Google Maps:", error);
          onValidationChange(false);
        }
      };

      initializeAutocomplete();

      return () => {
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    }, [onAddressSelect, onValidationChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Reset validation when user types
      if (value === "") {
        onValidationChange(false);
      }
    };

    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          disabled={!isLoaded}
        />
        {!isLoaded && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

// Export the AddressComponents type for use in other files
export type { AddressComponents };
