"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  Separator,
  Card,
  CardContent,
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

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    await updateCartItemQuantity(itemId, newQuantity);
    refreshCart();
  };

  const removeItem = async (itemId: string) => {
    await removeFromCart(itemId);
    refreshCart();
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
        <SheetHeader className="space-y-3 pb-4">
          <SheetTitle className="text-xl font-semibold">
            Shopping Cart {cartCount > 0 && `(${cartCount})`}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {cartCount > 0
              ? "Review your items before checkout"
              : !user
              ? "Please login to start shopping"
              : "Your cart is waiting for some great products"}
          </SheetDescription>
          <Separator />
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading cart...
                  </p>
                </div>
              </div>
            ) : !user ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
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
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
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
              <div className="space-y-4 px-1">
                {cartItems.map((item) => (
                  <Card
                    key={item.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="flex gap-4 p-4">
                      <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.product?.image_url || "/placeholder.svg"}
                          alt={item.product?.name || "Product"}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {item.product?.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          ${item.product?.price} {item.product?.unit}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border rounded-md bg-gray-50 dark:bg-gray-800">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg">
                          $
                          {((item.product?.price || 0) * item.quantity).toFixed(
                            2
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {user && cartItems.length > 0 && (
            <Card className="mt-4">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"}
                      )
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full font-medium">
                      View Full Cart
                    </Button>
                  </Link>
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    <Button className="w-full font-medium py-3" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
