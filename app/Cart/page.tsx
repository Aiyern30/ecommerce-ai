"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Tag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
} from "@/components/ui";
import { toast } from "sonner";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

interface CartItem {
  id: number;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Gradient Graphic T-shirt",
      size: "Large",
      color: "White",
      price: 145,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Checkered Shirt",
      size: "Medium",
      color: "Red",
      price: 180,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Skinny Fit Jeans",
      size: "Large",
      color: "Blue",
      price: 240,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: 4,
      name: "Gradient Graphic T-shirt",
      size: "Large",
      color: "White",
      price: 145,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: 5,
      name: "Checkered Shirt",
      size: "Medium",
      color: "Red",
      price: 180,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: 6,
      name: "Skinny Fit Jeans",
      size: "Large",
      color: "Blue",
      price: 240,
      quantity: 1,
      image: "/placeholder.svg",
    },
  ]);

  // const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const updateQuantity = (id: number, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
    toast.success("Item removed from cart!", {
      duration: 3000,
      style: { background: "#16a34a", color: "#fff" },
    });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = subtotal * 0.2; // 20% discount
  const deliveryFee = 15;
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 mb-4">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold">YOUR CART</h1>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-[60vh]">
            <Image
              src="/Cart.svg"
              alt="Empty Cart"
              width={500}
              height={500}
              className="mb-4"
            />
            <p className="text-gray-500 text-3xl">Your cart is empty.</p>
            <Link href="/Product">
              <Button className="mt-4">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border bg-white p-4"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Size: {item.size}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Color: {item.color}
                          </p>
                        </div>
                        <p className="font-medium">${item.price}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-md border">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 cursor-pointer"
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </AlertDialogTrigger>
                          {selectedItem && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove{" "}
                                  {selectedItem.name} from your cart?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeItem(selectedItem.id)}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 self-start sticky top-28">
              <div className="rounded-lg border bg-white p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <div className="mt-6 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.name} (x{item.quantity})
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Discount (-20%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">
                      ${deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-base font-semibold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Add promo code" className="pl-10" />
                    </div>
                    <Button variant="outline">Apply</Button>
                  </div>
                  <Button className="mt-4 w-full" size="lg">
                    Go to Checkout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
