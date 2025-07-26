"use client";

import { useState } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { MapPin, Edit, Trash2, Check } from "lucide-react";
import { TypographyH4, TypographyP } from "@/components/ui/Typography";
import type { Address } from "@/lib/user/address";

interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function AddressCard({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
}: AddressCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Selection Indicator */}
            <div className="flex items-center justify-center mt-1">
              {isSelected ? (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-blue-500 transition-colors" />
              )}
            </div>

            {/* Address Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <TypographyH4 className="text-lg font-semibold">
                  {address.full_name}
                  {address.is_default && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Default
                    </span>
                  )}
                </TypographyH4>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <TypographyP className="!mt-0">
                  {address.address_line1}
                </TypographyP>
                {address.address_line2 && (
                  <TypographyP className="!mt-0">
                    {address.address_line2}
                  </TypographyP>
                )}
                <TypographyP className="!mt-0">
                  {address.city}, {address.state} {address.postal_code}
                </TypographyP>
                <TypographyP className="!mt-0">{address.country}</TypographyP>
                {address.phone && (
                  <TypographyP className="!mt-0 font-medium">
                    Phone: {address.phone}
                  </TypographyP>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (isHovered || isSelected) && (
            <div className="flex items-center gap-2 ml-4">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && !address.is_default && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Selected State Indicator */}
        {isSelected && (
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <TypographyP className="text-sm text-blue-600 dark:text-blue-400 font-medium !mt-0 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Selected for delivery
            </TypographyP>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
