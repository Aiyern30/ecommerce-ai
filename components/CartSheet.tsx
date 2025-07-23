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
} from "@/components/ui";
import { useCart } from "./CartProvider";
import { updateCartItemQuantity, removeFromCart } from "@/lib/cart-utils";
import Image from "next/image";
import Link from "next/link";

export default function Cart() {
  const { cartCount, cartItems, refreshCart, isLoading } = useCart();
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
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
          <SheetDescription>Review your items before checkout</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 border rounded-lg"
                  >
                    <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={item.product?.image_url || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.product?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.product?.price} {item.product?.unit}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
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
                            className="h-8 w-8 p-0"
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
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-3 w-3" />
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

          {cartItems.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Subtotal:</span>
                <span className="font-bold text-lg">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="space-y-2">
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Checkout</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
