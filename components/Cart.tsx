"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Separator,
} from "@/components/ui";
import { useCart } from "./CartProvider";
import {
  updateCartItemQuantity,
  removeFromCart,
  getProductPrice,
} from "@/lib/cart/utils";
import { useUser } from "@supabase/auth-helpers-react";
import { TypographyH4, TypographyP } from "@/components/ui/Typography";
import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/type/cart";
import { getVariantDisplayName } from "@/lib/utils/format";

export default function Cart() {
  const { cartCount, cartItems, refreshCart, isLoading } = useCart();
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [inputQty, setInputQty] = useState<{ [id: string]: string }>({});

  // Sync inputQty state with cartItems when cartItems change
  useEffect(() => {
    const qtyState: { [id: string]: string } = {};
    cartItems.forEach((item) => {
      qtyState[item.id] = String(item.quantity);
    });
    setInputQty(qtyState);
  }, [cartItems]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // If quantity would be 0, show delete confirmation instead
      const item = cartItems.find((item) => item.id === itemId);
      if (item) {
        handleDeleteClick(item);
      }
      return;
    }
    await updateCartItemQuantity(itemId, newQuantity);
    refreshCart();
  };

  const handleDeleteClick = (item: CartItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await removeFromCart(itemToDelete.id);
      refreshCart();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Calculate subtotal using the correct prices based on variant_type
  const subtotal = cartItems.reduce((sum, item) => {
    const price = getProductPrice(item.product, item.variant_type);
    return sum + price * item.quantity;
  }, 0);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="space-y-2 pb-4">
            <SheetTitle className="text-lg font-medium text-left">
              Shopping Cart
            </SheetTitle>
            {cartCount > 0 && (
              <TypographyP className="text-sm text-gray-500 !mt-1">
                {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
              </TypographyP>
            )}
          </SheetHeader>

          {/* Make this div scrollable */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <TypographyP className="text-sm text-muted-foreground">
                        Loading cart...
                      </TypographyP>
                    </div>
                  </div>
                ) : !user ? (
                  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <TypographyH4 className="text-gray-900 dark:text-gray-100">
                        Login Required
                      </TypographyH4>
                      <TypographyP className="text-sm text-muted-foreground max-w-sm">
                        Please login to view your cart and start shopping for
                        amazing products.
                      </TypographyP>
                    </div>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button>Login to Continue</Button>
                    </Link>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-gray-500" />
                    </div>
                    <div className="space-y-3">
                      <TypographyH4 className="text-gray-900 dark:text-gray-100">
                        Your cart is empty
                      </TypographyH4>
                      <TypographyP className="text-sm text-muted-foreground max-w-sm">
                        Discover our amazing products and add them to your cart
                        to get started.
                      </TypographyP>
                    </div>
                    <Link href="/products" onClick={() => setIsOpen(false)}>
                      <Button>Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      // Get the correct price based on variant_type
                      const itemPrice = getProductPrice(
                        item.product,
                        item.variant_type
                      );
                      const itemInputQty =
                        inputQty[item.id] ?? String(item.quantity);
                      const isMobile =
                        typeof window !== "undefined" &&
                        window.innerWidth < 640;

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-lg transition-colors"
                        >
                          {/* Product Info Row */}
                          <div className="flex gap-3">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={
                                  item.product?.image_url || "/placeholder.svg"
                                }
                                alt={item.product?.name || "Product"}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <TypographyH4 className="text-sm mb-1 line-clamp-2">
                                {item.product?.name}
                              </TypographyH4>
                              <TypographyP className="text-xs text-gray-500 mb-1 !mt-0">
                                Unit: {item.product?.unit || "per bag"}
                              </TypographyP>
                              {/* Show variant type */}
                              <TypographyP className="text-xs text-blue-600 mb-1 !mt-0">
                                {getVariantDisplayName(item.variant_type)}
                              </TypographyP>
                              <TypographyP className="text-xs text-gray-500 mb-1 !mt-0">
                                Price: RM{itemPrice.toFixed(2)}
                              </TypographyP>
                            </div>
                            <div className="text-right">
                              <TypographyP className="font-semibold text-sm !mt-0">
                                RM{(itemPrice * item.quantity).toFixed(2)}
                              </TypographyP>
                              <TypographyP className="text-xs text-gray-500 !mt-1">
                                Qty: {item.quantity}
                              </TypographyP>
                            </div>
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between pt-2 ">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              {/* Number input for quantity */}
                              <input
                                type="number"
                                min={1}
                                value={itemInputQty}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (/^\d*$/.test(val)) {
                                    setInputQty((prev) => ({
                                      ...prev,
                                      [item.id]: val,
                                    }));
                                  }
                                }}
                                onBlur={() => {
                                  let val = parseInt(itemInputQty, 10);
                                  if (isNaN(val) || val < 1) val = 1;
                                  if (val !== item.quantity) {
                                    updateQuantity(item.id, val);
                                  }
                                  setInputQty((prev) => ({
                                    ...prev,
                                    [item.id]: String(val),
                                  }));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-20 px-2 py-1.5 text-xs font-bold text-center text-gray-900 dark:text-gray-100 border-x border-gray-200 dark:border-gray-600 outline-none bg-transparent"
                                aria-label="Quantity"
                                style={{
                                  MozAppearance: "textfield",
                                }}
                              />
                              {/* Tick button for mobile confirmation */}
                              {isMobile && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-green-600"
                                  onClick={() => {
                                    let val = parseInt(itemInputQty, 10);
                                    if (isNaN(val) || val < 1) val = 1;
                                    if (val !== item.quantity) {
                                      updateQuantity(item.id, val);
                                    }
                                    setInputQty((prev) => ({
                                      ...prev,
                                      [item.id]: String(val),
                                    }));
                                  }}
                                  aria-label="Confirm quantity"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 border rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <Separator className="mt-3" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Cart Footer */}
            {user && cartItems.length > 0 && (
              <div className="border-t p-4 space-y-4 bg-gray-50 dark:bg-gray-900/30">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Subtotal</span>
                  <span className="text-lg font-bold text-blue-600">
                    RM{subtotal.toFixed(2)}
                  </span>
                </div>
                <TypographyP className="text-xs text-gray-500 text-center !mt-2">
                  Shipping and taxes calculated at checkout
                </TypographyP>
                <div className="space-y-3">
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      View & Edit Cart ({cartCount})
                    </Button>
                  </Link>
                  <TypographyP className="text-xs text-center text-gray-500 !mt-2">
                    Select items and manage your cart before checkout
                  </TypographyP>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
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
                <TypographyH4 className="text-sm mb-1">
                  {itemToDelete.product?.name}
                </TypographyH4>
                <TypographyP className="text-sm text-blue-600 mb-1 !mt-0">
                  {getVariantDisplayName(itemToDelete.variant_type)}
                </TypographyP>
                <TypographyP className="text-sm text-gray-500 mb-1 !mt-0">
                  Quantity: {itemToDelete.quantity}
                </TypographyP>
                <TypographyP className="text-sm font-semibold !mt-0">
                  RM
                  {(
                    getProductPrice(
                      itemToDelete.product,
                      itemToDelete.variant_type
                    ) * itemToDelete.quantity
                  ).toFixed(2)}
                </TypographyP>
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
    </>
  );
}
