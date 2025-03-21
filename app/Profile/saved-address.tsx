"use client";

import { useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { UserAddress } from "@/type/user";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { updateUserAddresses } from "@/lib/user-actions";
import AddressForm from "./address-form";

interface SavedAddressesProps {
  addresses: UserAddress[];
}

export default function SavedAddresses({
  addresses = [],
}: SavedAddressesProps) {
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setEditingAddressId(null);
  };

  const handleEditAddress = (addressId: string) => {
    setEditingAddressId(addressId);
    setIsAddingAddress(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );
      await updateUserAddresses(updatedAddresses);
      // In a real app, you would refresh the data here
    }
  };

  const handleCancelEdit = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  if (addresses.length === 0 && !isAddingAddress) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
        <p className="text-muted-foreground mb-6">
          Add a shipping address to speed up checkout.
        </p>
        <Button onClick={handleAddAddress}>
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </div>
    );
  }

  const addressToEdit = editingAddressId
    ? addresses.find((addr) => addr.id === editingAddressId)
    : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Saved Addresses</h3>
        {!isAddingAddress && !editingAddressId && (
          <Button onClick={handleAddAddress}>
            <Plus className="mr-2 h-4 w-4" /> Add New Address
          </Button>
        )}
      </div>

      {isAddingAddress || editingAddressId ? (
        <AddressForm
          address={addressToEdit}
          onCancel={handleCancelEdit}
          existingAddresses={addresses}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardContent className="pt-6">
                {address.isDefault && (
                  <Badge className="absolute top-2 right-2">Default</Badge>
                )}
                <div className="space-y-1">
                  <p className="font-medium">{address.name}</p>
                  <p className="text-sm">{address.street}</p>
                  <p className="text-sm">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="text-sm">{address.country}</p>
                  <p className="text-sm">{address.phone}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAddress(address.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
