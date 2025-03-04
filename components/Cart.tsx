"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartSheet() {
  // const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Gradient Graphic T-shirt",
      price: 145,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Checkered Shirt",
      price: 180,
      quantity: 1,
      image: "/placeholder.svg",
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const updateQuantity = (id: number, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="px-4">
        <SheetHeader className="px-0 font-bold">
          <SheetTitle className="font-bold">Shopping Cart</SheetTitle>
        </SheetHeader>

        {/* Empty Cart UI */}
        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center h-full">
            <Image
              src="/Cart.svg"
              alt="Empty Cart"
              width={300}
              height={300}
              className="mb-4"
            />
            <p className="text-gray-500 text-xl">Your cart is empty.</p>
            <Link href="/Shop">
              <Button className="mt-4" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-3"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price} x {item.quantity}
                    </p>
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 border rounded cursor-pointer"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 border rounded cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between font-medium">
              <span>Total:</span>
              <span>
                $
                {cartItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )}
              </span>
            </div>
            <Link href="/Cart">
              <Button className="w-full mt-4" onClick={() => setIsOpen(false)}>
                View Cart
              </Button>
            </Link>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
