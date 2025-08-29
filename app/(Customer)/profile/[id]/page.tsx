/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Badge,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import { formatDate } from "@/lib/utils/format";
import { Customer } from "@/type/customer";
import { AddressCard } from "@/components/AddressCard";
import { AddressForm } from "@/components/AddressForm";
import { User, MapPin, Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/lib/user/address";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const user = useUser();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;

    try {
      setAddressLoading(true);
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setAddressLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    async function fetchCustomer() {
      setLoading(true);
      const res = await fetch(`/api/customer/${customerId}`);
      if (!res.ok) {
        setCustomer(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCustomer(data.customer || null);
      setLoading(false);
    }
    if (customerId) fetchCustomer();
  }, [customerId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Address management handlers
  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setShowAddForm(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    if (editingAddressId === addressId) {
      setEditingAddressId(null);
    }
    toast.success("Address deleted successfully!");
  };

  const handleAddressUpdated = (updatedAddress: Address) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === updatedAddress.id ? updatedAddress : addr
      )
    );
    setEditingAddressId(null);
    setShowAddForm(false);
    toast.success("Address updated successfully!");
  };

  const handleAddressAdded = (newAddress: Address) => {
    setAddresses((prev) => [newAddress, ...prev]);
    setShowAddForm(false);
    setEditingAddressId(null);
    toast.success("Address added successfully!");
  };

  const handleCancelEdit = (addressId: string) => {
    if (editingAddressId === addressId) {
      setEditingAddressId(null);
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingAddressId(null);
  };

  return (
    <div className="min-h-screen mb-4">
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">YOUR PROFILE</TypographyH1>
        {!loading && !customer && (
          <div className="flex flex-col items-center justify-center py-16">
            <TypographyH2 className="mb-2">Profile Not Found</TypographyH2>
            <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
              We couldn't find your profile. Please try again later.
            </TypographyP>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </div>
        )}
        {customer && (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Addresses</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-1/2" />
                      <Skeleton className="h-10 w-1/2" />
                      <Skeleton className="h-10 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-8 w-1/3" />
                    </div>
                  ) : customer ? (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={customer.avatar_url || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {customer.full_name?.charAt(0) ||
                              customer.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-lg">
                            {customer.full_name || "No name"}
                          </div>
                          <div className="text-muted-foreground">
                            {customer.email}
                          </div>
                          {customer.ban_info?.banned_until &&
                          new Date(customer.ban_info.banned_until) >
                            new Date() ? (
                            <Badge className="mt-2 capitalize bg-orange-600 text-white">
                              Banned
                            </Badge>
                          ) : (
                            <Badge className="mt-2 capitalize">
                              {customer.status}
                            </Badge>
                          )}
                          {customer.ban_info?.banned_until &&
                            new Date(customer.ban_info.banned_until) >
                              new Date() &&
                            customer.ban_info?.reason && (
                              <div className="text-xs text-orange-600 mt-2">
                                Reason: {customer.ban_info.reason}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Role
                          </label>
                          <Input
                            value={customer.role}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Phone
                          </label>
                          <Input
                            value={customer.phone || "-"}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Location
                          </label>
                          <Input
                            value={customer.location || "-"}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Joined
                          </label>
                          <Input
                            value={
                              customer.created_at
                                ? formatDate(customer.created_at)
                                : "-"
                            }
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Last Seen
                        </label>
                        <Input
                          value={
                            customer.last_sign_in_at
                              ? formatDate(customer.last_sign_in_at)
                              : "-"
                          }
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      {customer.ban_info?.banned_until && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium mb-1">
                            Ban Information
                          </label>
                          <Input
                            value={
                              customer.ban_info.banned_until
                                ? formatDate(customer.ban_info.banned_until)
                                : "-"
                            }
                            disabled
                            className="bg-muted"
                          />
                          {customer.ban_info.reason && (
                            <Input
                              value={`Reason: ${customer.ban_info.reason}`}
                              disabled
                              className="bg-muted mt-1"
                            />
                          )}
                          {customer.ban_info.banned_by_name && (
                            <Input
                              value={`Banned By: ${customer.ban_info.banned_by_name}`}
                              disabled
                              className="bg-muted mt-1"
                            />
                          )}
                          {customer.ban_info.banned_at && (
                            <Input
                              value={`Banned At: ${formatDate(
                                customer.ban_info.banned_at
                              )}`}
                              disabled
                              className="bg-muted mt-1"
                            />
                          )}
                          {customer.ban_info.unbanned_at && (
                            <Input
                              value={`Unbanned At: ${formatDate(
                                customer.ban_info.unbanned_at
                              )}`}
                              disabled
                              className="bg-muted mt-1"
                            />
                          )}
                          {customer.ban_info.unbanned_by_name && (
                            <Input
                              value={`Unbanned By: ${customer.ban_info.unbanned_by_name}`}
                              disabled
                              className="bg-muted mt-1"
                            />
                          )}
                        </div>
                      )}
                      {customer?.ban_info?.previous_bans &&
                        customer.ban_info.previous_bans.length > 0 && (
                          <div className="mt-8">
                            <label className="block text-sm font-medium mb-2">
                              Ban History
                            </label>
                            <div className="overflow-x-auto">
                              <Table className="min-w-[600px]">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Banned At</TableHead>
                                    <TableHead>Banned By</TableHead>
                                    <TableHead>Banned Until</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {customer.ban_info.previous_bans.map(
                                    (ban, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>
                                          {ban.reason || "-"}
                                        </TableCell>
                                        <TableCell>
                                          {ban.banned_at
                                            ? formatDate(ban.banned_at)
                                            : "-"}
                                        </TableCell>
                                        <TableCell>
                                          {ban.banned_by_name ||
                                            ban.banned_by ||
                                            "-"}
                                        </TableCell>
                                        <TableCell>
                                          {ban.banned_until
                                            ? formatDate(ban.banned_until)
                                            : "-"}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="mt-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <TypographyH3 className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Manage Addresses
                  </TypographyH3>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingAddressId(null);
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

                {showAddForm && !editingAddressId && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
                    <TypographyH3 className="mb-4">
                      Add New Address
                    </TypographyH3>
                    <AddressForm
                      onSuccess={handleAddressAdded}
                      onCancel={handleCancelForm}
                    />
                  </div>
                )}

                {addressLoading ? (
                  <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <TypographyH3 className="mb-2">
                      No addresses found
                    </TypographyH3>
                    <TypographyP className="text-gray-600 dark:text-gray-400 mb-4">
                      Add your first address to get started.
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
                      <div key={address.id} className="space-y-4">
                        <AddressCard
                          address={address}
                          isSelected={false}
                          onSelect={() => {}}
                          onEdit={handleEditAddress}
                          onDelete={handleDeleteAddress}
                          isEditing={editingAddressId === address.id}
                        />

                        {editingAddressId === address.id && (
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border-l-4 border-blue-500 shadow-sm animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-4">
                              <TypographyH3 className="text-blue-600 dark:text-blue-400">
                                Edit Address
                              </TypographyH3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelEdit(address.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <AddressForm
                              onSuccess={handleAddressUpdated}
                              onCancel={() => handleCancelEdit(address.id)}
                              initialData={address}
                              isEditing={true}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
