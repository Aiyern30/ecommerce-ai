"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Skeleton,
} from "@/components/ui";
import {
  TypographyH1,
  TypographyH3,
  TypographyH4,
  TypographyP,
} from "@/components/ui/Typography";
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
  const router = useRouter();
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

  // Handle proceed to checkout with validation
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to proceed with checkout", {
        duration: 4000,
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    // Go directly to the address step
    router.push("/checkout/address");
  };

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const total = subtotal; // Simplified total without discount and delivery fee

  return (
    <div className="min-h-screen mb-4">
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav showFilterButton={false} />

        <TypographyH1 className="mb-8 mt-8">YOUR CART</TypographyH1>

        {isLoading ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Cart Items Skeleton */}
            <div className="lg:col-span-2">
              {/* Single Card Container Skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Header Skeleton */}
                <div className="flex items-center gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-7 w-48" />
                  <div className="ml-auto">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>

                {/* Product Items Skeleton */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="p-6">
                      <div className="flex gap-4">
                        {/* Checkbox Skeleton */}
                        <div className="flex items-start pt-3">
                          <Skeleton className="h-5 w-5 rounded" />
                        </div>

                        {/* Product Image Skeleton */}
                        <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-xl flex-shrink-0" />

                        <div className="flex flex-1 flex-col justify-between min-h-[96px] md:min-h-[112px]">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div className="flex-1 pr-4 space-y-2">
                              {/* Product Name */}
                              <Skeleton className="h-7 w-64" />
                              {/* Size and Color */}
                              <div className="flex gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                            {/* Delete Button */}
                            <Skeleton className="h-9 w-9 rounded-lg ml-auto md:ml-0" />
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Price */}
                            <Skeleton className="h-8 w-20" />
                            {/* Quantity Controls */}
                            <Skeleton className="h-10 w-28 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Skeleton */}
            <div className="lg:col-span-1 self-start sticky top-28">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Header Skeleton */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-7 w-48" />
                </div>

                {/* Content Skeleton */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Cart Items in Summary */}
                    {[...Array(2)].map((_, index) => (
                      <div key={index} className="flex gap-3 py-3">
                        {/* Product Image Skeleton */}
                        <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />

                        {/* Product Details Skeleton */}
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <div className="flex gap-2">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>

                        {/* Price Skeleton */}
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}

                    {/* Divider */}
                    <div className="border-t-2 border-gray-200 dark:border-gray-700 my-6"></div>

                    {/* Summary Calculations */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="mt-8">
                    <Skeleton className="h-14 w-full rounded-xl" />
                  </div>

                  {/* Security Badge */}
                  <div className="mt-4 flex justify-center">
                    <Skeleton className="h-4 w-40" />
                  </div>
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
              {/* Single Card Container for All Products */}
              <Card className="overflow-hidden shadow-sm py-0 gap-0">
                {/* Choose All Product Header */}
                <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={(checked) => {
                          console.log("Checkbox onCheckedChange:", checked); // Debug log
                          handleSelectAll(checked === true);
                        }}
                        className="h-5 w-5"
                      />
                      <CardTitle className="text-xl font-bold cursor-pointer">
                        Choose All Product
                      </CardTitle>
                    </div>
                    <TypographyP className="text-sm text-gray-600 dark:text-gray-400 font-medium !mt-0">
                      {selectedItems.length} of {cartItems.length} items
                      selected
                    </TypographyP>
                  </div>
                </CardHeader>

                {/* Product Items */}
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all duration-200 cursor-pointer group"
                        onClick={(e) => {
                          // Only navigate if not clicking on interactive elements
                          const target = e.target as HTMLElement;
                          if (
                            !target.closest("button") &&
                            !target.closest("input") &&
                            !target.closest("a")
                          ) {
                            router.push(`/products/${item.product_id}`);
                          }
                        }}
                      >
                        <div className="flex gap-4">
                          {/* Checkbox for individual item */}
                          <div className="flex items-start pt-3">
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={item.selected}
                              onCheckedChange={(checked) =>
                                handleItemSelect(item.id, checked as boolean)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="h-5 w-5"
                            />
                          </div>

                          {/* Product Image */}
                          <div className="relative h-24 w-24 md:h-28 md:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                            <Image
                              src={
                                item.product?.image_url || "/placeholder.svg"
                              }
                              alt={item.product?.name || "Product"}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex flex-1 flex-col justify-between min-h-[96px] md:min-h-[112px]">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                              <div className="flex-1 pr-4">
                                <TypographyH3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {item.product?.name}
                                </TypographyH3>
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span>
                                    Size: {item.product?.unit || "per bag"}
                                  </span>
                                  <span className="hidden md:inline">•</span>
                                  <span>Color: White</span>
                                </div>
                              </div>

                              {/* Delete Button - Top Right */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(item);
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200 ml-auto md:ml-0 opacity-0 group-hover:opacity-100"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>

                            {/* Price and Quantity Controls */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                RM{item.product?.price}
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.quantity === 1) {
                                      handleDeleteClick(item);
                                    } else {
                                      updateQuantity(
                                        item.id,
                                        item.quantity - 1
                                      );
                                    }
                                  }}
                                  className={`p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-l-lg group${
                                    item.quantity === 1
                                      ? " text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      : ""
                                  }`}
                                  aria-label={
                                    item.quantity === 1
                                      ? "Remove item"
                                      : "Decrease quantity"
                                  }
                                >
                                  <Minus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-200" />
                                </button>
                                <span className="px-3 py-2 font-bold min-w-[2.5rem] text-center text-gray-900 dark:text-gray-100 text-sm border-x border-gray-200 dark:border-gray-600">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, item.quantity + 1);
                                  }}
                                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-r-lg group"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-200" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 z-10">
                <Card className="overflow-hidden shadow-sm py-0 gap-0">
                  {/* Header */}
                  <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>

                  {/* Content */}
                  <CardContent className="p-6">
                    {selectedItems.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                        <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <TypographyH4 className="mb-2">
                          No items selected
                        </TypographyH4>
                        <TypographyP className="text-sm !mt-0">
                          Select items to see summary
                        </TypographyP>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Selected Items */}
                        <div className="space-y-3">
                          {selectedItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-3 py-3 group hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-lg p-2 transition-all duration-200"
                            >
                              {/* Product Image */}
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                <Image
                                  src={
                                    item.product?.image_url ||
                                    "/placeholder.svg"
                                  }
                                  alt={item.product?.name || "Product"}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <TypographyH4 className="text-sm font-medium line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {item.product?.name}
                                </TypographyH4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                    Qty: {item.quantity}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    @ RM{item.product?.price}
                                  </span>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                  RM
                                  {(
                                    (item.product?.price || 0) * item.quantity
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Divider */}
                        <div className="border-t-2 border-gray-200 dark:border-gray-700 my-6"></div>

                        {/* Summary Calculations */}
                        <div className="space-y-3">
                          {/* Items Count */}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Items ({selectedItems.length})
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              RM{subtotal.toFixed(2)}
                            </span>
                          </div>

                          {/* Shipping */}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Shipping
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              FREE
                            </span>
                          </div>

                          {/* Total */}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Total
                              </span>
                              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                RM{total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Checkout Button */}
                    <div className="mt-8">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                        size="lg"
                        disabled={selectedItems.length === 0}
                        onClick={handleProceedToCheckout}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>Proceed to Checkout</span>
                          {selectedItems.length > 0 && (
                            <span className="bg-white/20 text-white px-2 py-1 rounded-full text-sm font-bold">
                              {selectedItems.length}
                            </span>
                          )}
                        </div>
                      </Button>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Secure checkout guaranteed</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Remove item from cart?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to remove this item from your cart? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {itemToDelete && (
            <div className="flex gap-4 p-4 border rounded-xl bg-gray-50 dark:bg-gray-900">
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={itemToDelete.product?.image_url || "/placeholder.svg"}
                  alt={itemToDelete.product?.name || "Product"}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">
                  {itemToDelete.product?.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Quantity: {itemToDelete.quantity}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  RM
                  {(
                    (itemToDelete.product?.price || 0) * itemToDelete.quantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
