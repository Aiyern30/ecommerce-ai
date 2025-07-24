"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Skeleton,
  Checkbox,
} from "@/components/ui";
import { toast } from "sonner";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useCart } from "@/components/CartProvider";
import {
  updateCartItemQuantity,
  removeFromCart,
  updateCartItemSelection,
  selectAllCartItems,
} from "@/lib/cart/utils";
import { useUser } from "@supabase/auth-helpers-react";
import { CartItem } from "@/type/cart";

export default function CartPage() {
  const { cartItems, refreshCart, isLoading } = useCart();
  const user = useUser();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // Calculate select all state from database
  const selectAll =
    cartItems.length > 0 && cartItems.every((item) => item.selected);
  const selectedItems = cartItems.filter((item) => item.selected);

  console.log("Cart state:", {
    totalItems: cartItems.length,
    selectedItems: selectedItems.length,
    selectAll,
    cartItems: cartItems.map((item) => ({
      id: item.id,
      name: item.product?.name,
      selected: item.selected,
    })),
  }); // Debug log

  // Handle individual item selection
  const handleItemSelect = async (itemId: string, checked: boolean) => {
    console.log("Updating selection for item:", itemId, "to:", checked); // Debug log
    const success = await updateCartItemSelection(itemId, checked);
    if (success) {
      console.log("Selection updated successfully, refreshing cart"); // Debug log
      await refreshCart(); // Refresh to get updated selection state
    } else {
      console.error("Failed to update selection"); // Debug log
      toast.error("Failed to update selection");
    }
  };

  // Handle select all
  const handleSelectAll = async (checked: boolean) => {
    if (!user?.id) return;

    console.log("Select all triggered:", checked, "for user:", user.id); // Debug log
    const success = await selectAllCartItems(user.id, checked);
    if (success) {
      console.log("Select all successful, refreshing cart"); // Debug log
      await refreshCart(); // Refresh to get updated selection state
      toast.success(checked ? "All items selected" : "All items deselected");
    } else {
      console.error("Failed to update select all"); // Debug log
      toast.error("Failed to update selection");
    }
  };

  // Handle delete click
  const handleDeleteClick = (item: CartItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (itemToDelete) {
      await removeFromCart(itemToDelete.id);
      refreshCart();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success("Item removed from cart!", {
        duration: 3000,
        style: { background: "#16a34a", color: "#fff" },
      });
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    await updateCartItemQuantity(itemId, newQuantity);
    refreshCart();
  };

  // Handle proceed to order with validation
  const handleProceedToOrder = () => {
    if (selectedItems.length === 0) {
      toast.error(
        "Please select at least one item to proceed with your order",
        {
          duration: 4000,
          style: { background: "#ef4444", color: "#fff" },
        }
      );
      return;
    }

    // Navigate to order page - selected items are already in database
    window.location.href = "/order";
  };

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const total = subtotal; // Simplified total without discount and delivery fee

  return (
    <div className="min-h-screen mb-4">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      <div className="container mx-auto px-4 mt-8">
        <h1 className="text-3xl font-bold mb-8">YOUR CART</h1>

        {isLoading ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Cart Items Skeleton */}
            <div className="lg:col-span-2">
              {/* Choose All Product Header Skeleton */}
              <div className="flex items-center gap-3 mb-4 p-4 border rounded-lg">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-32" />
              </div>

              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="flex gap-4 rounded-lg border p-4">
                    {/* Checkbox Skeleton */}
                    <div className="flex items-start pt-2">
                      <Skeleton className="h-4 w-4" />
                    </div>

                    {/* Product Image Skeleton */}
                    <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="space-y-2 flex-1">
                          {/* Product Name */}
                          <Skeleton className="h-5 w-48" />
                          {/* Unit */}
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <Skeleton className="h-9 w-32 rounded-md" />
                        <div className="flex items-center gap-4">
                          {/* Price */}
                          <Skeleton className="h-6 w-16" />
                          {/* Delete Button */}
                          <Skeleton className="h-9 w-9 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Skeleton */}
            <div className="lg:col-span-1 self-start sticky top-28">
              <div className="rounded-lg border p-6">
                {/* Title */}
                <Skeleton className="h-6 w-32 mb-6" />

                <div className="space-y-4">
                  {/* Cart Items in Summary */}
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}

                  {/* Subtotal */}
                  <div className="flex justify-between border-t pt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>

                  {/* Total */}
                  <div className="flex justify-between border-t pt-4">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="mt-6">
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Login Required
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Please login to view your cart and start shopping for amazing
                products.
              </p>
            </div>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground max-w-sm">
                Discover our amazing products and add them to your cart to get
                started.
              </p>
            </div>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Choose All Product Header */}
              <div className="flex items-center justify-between gap-3 mb-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={(checked) => {
                      console.log("Checkbox onCheckedChange:", checked); // Debug log
                      handleSelectAll(checked === true);
                    }}
                  />
                  <label
                    htmlFor="select-all"
                    className="font-medium cursor-pointer"
                  >
                    Choose All Product
                  </label>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedItems.length} of {cartItems.length} items selected
                </div>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border p-4"
                  >
                    {/* Checkbox for individual item */}
                    <div className="flex items-start pt-2">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.selected}
                        onCheckedChange={(checked) =>
                          handleItemSelect(item.id, checked as boolean)
                        }
                      />
                    </div>

                    <Link
                      href={`/products/${item.product_id}`}
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={item.product?.image_url || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <Link
                            href={`/products/${item.product_id}`}
                            className="hover:text-blue-600"
                          >
                            <h3 className="font-medium">
                              {item.product?.name}
                            </h3>
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Unit: {item.product?.unit || "Piece"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-md border">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 cursor-pointer"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">RM{item.product?.price}</p>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 self-start sticky top-28">
              <div className="rounded-lg border p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <div className="mt-6 space-y-4">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.product?.name} (x{item.quantity})
                      </span>
                      <span className="font-medium">
                        RM
                        {((item.product?.price || 0) * item.quantity).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  ))}

                  {selectedItems.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No items selected
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between border-t pt-4">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          RM{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-4">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-base font-semibold">
                          RM{total.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <Button
                    className="mt-4 w-full"
                    size="lg"
                    disabled={selectedItems.length === 0}
                    onClick={handleProceedToOrder}
                  >
                    Proceed to Order ({selectedItems.length} items)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {itemToDelete && (
            <div className="flex gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={itemToDelete.product?.image_url || "/placeholder.svg"}
                  alt={itemToDelete.product?.name || "Product"}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">
                  {itemToDelete.product?.name}
                </h4>
                <p className="text-sm text-gray-500 mb-1">
                  Quantity: {itemToDelete.quantity}
                </p>
                <p className="text-sm font-medium">
                  RM
                  {(
                    (itemToDelete.product?.price || 0) * itemToDelete.quantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
