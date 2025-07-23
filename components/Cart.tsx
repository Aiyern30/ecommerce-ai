"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
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
} from "@/components/ui";
import { useCart } from "./CartProvider";
import { updateCartItemQuantity, removeFromCart } from "@/lib/cart-utils";
import { useUser } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";

export default function Cart() {
  const { cartCount, cartItems, refreshCart, isLoading } = useCart();
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    product?: {
      name: string;
      price: number;
      image_url: string;
      unit: string;
    };
    quantity: number;
  } | null>(null);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    await updateCartItemQuantity(itemId, newQuantity);
    refreshCart();
  };

  const handleDeleteClick = (item: {
    id: string;
    product?: {
      name: string;
      price: number;
      image_url: string;
      unit: string;
    };
    quantity: number;
  }) => {
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

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
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
            Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading cart...
                  </p>
                </div>
              </div>
            ) : !user ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 text-center space-y-6">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Login Required
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Please login to view your cart and start shopping for
                    amazing products.
                  </p>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Discover our amazing products and add them to your cart to
                    get started.
                  </p>
                </div>
                <Link href="/products" onClick={() => setIsOpen(false)}>
                  <Button>Browse Products</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.product?.image_url || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">
                        {item.product?.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        Color: {item.product?.unit || "Default"}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        Size: Extra Extra Small
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded">
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
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
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
                          className="h-7 w-7 p-0 border rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        $
                        {((item.product?.price || 0) * item.quantity).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {user && cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Subtotal</span>
                <span className="text-lg font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="space-y-3">
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    View Full Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-black hover:bg-gray-800 text-white mt-3">
                    Continue to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

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
                  $
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
    </Sheet>
  );
}
