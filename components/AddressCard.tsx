/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { MapPin, Edit2, Trash2, Check } from "lucide-react";
import { TypographyH4 } from "@/components/ui/Typography";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import type { Address } from "@/lib/user/address";

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  isEditing?: boolean;
}

export function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  isEditing = false,
}: AddressCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClientComponentClient();
  const user = useUser();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(address);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !address.id) {
      console.error("Missing user or address ID");
      toast.error("Unable to delete address. Please try again.");
      return;
    }

    setIsDeleting(true);
    try {
      console.log("Soft deleting address:", address.id, "for user:", user.id);

      const { error: updateError } = await supabase
        .from("addresses")
        .update({
          deleted_at: new Date().toISOString(),
          is_default: false,
        })
        .eq("id", address.id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Soft delete error:", updateError);
        throw updateError;
      }

      console.log("Address soft deleted successfully");
      toast.success("Address deleted successfully!");

      onDelete(address.id);
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 transition-all duration-200 ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : isEditing
            ? "border-blue-300 bg-blue-50/50 dark:bg-blue-900/10"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        } ${!isEditing ? "cursor-pointer" : ""}`}
        onClick={!isEditing ? onSelect : undefined}
      >
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>
        )}

        {/* Default Badge */}
        {address.is_default && (
          <Badge
            variant="secondary"
            className="absolute top-4 left-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Default
          </Badge>
        )}

        {/* Address Content */}
        <div className={`${address.is_default ? "mt-8" : "mt-0"}`}>
          <TypographyH4 className="font-semibold text-gray-900 dark:text-white mb-2">
            {address.full_name}
          </TypographyH4>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>{address.address_line1}</p>
            {address.address_line2 && <p>{address.address_line2}</p>}
            <p>
              {address.city}, {address.state} {address.postal_code}
            </p>
            <p>{address.country}</p>
            {address.phone && <p>Phone: {address.phone}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleEdit}
            disabled={isEditing}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              isEditing
                ? "bg-blue-100 text-blue-700 cursor-not-allowed opacity-50"
                : "bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 dark:bg-gray-700 dark:hover:bg-blue-900/30 dark:text-gray-400 dark:hover:text-blue-400"
            }`}
            title={isEditing ? "Editing..." : "Edit address"}
          >
            <Edit2 className="h-4 w-4" />
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={isEditing || isDeleting}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              isEditing || isDeleting
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 dark:bg-gray-700 dark:hover:bg-red-900/30 dark:text-gray-400 dark:hover:text-red-400"
            }`}
            title={isDeleting ? "Deleting..." : "Delete address"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Delete Address
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this address? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Address Preview */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 my-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
              <div>
                <p className="font-medium !mt-0">{address.full_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 !mt-1">
                  {address.address_line1}
                  {address.address_line2 && `, ${address.address_line2}`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 !mt-1">
                  {address.city}, {address.state} {address.postal_code}
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-lg" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Address"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
