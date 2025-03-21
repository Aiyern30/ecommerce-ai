"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartSheet() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Modern Wooden Dining Table",
      price: 499,
      quantity: 1,
      image: "/images/dining-table.jpg",
    },
    {
      id: 2,
      name: "Luxury Leather Sofa",
      price: 899,
      quantity: 1,
      image: "/images/leather-sofa.jpg",
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
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
    toast.success("Item removed from cart!", {
      duration: 3000,
      style: { background: "#16a34a", color: "#fff" },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <ShoppingCart className="h-5 w-5 text-gray-800 dark:text-gray-200" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col h-full p-4 pt-0 bg-white dark:bg-gray-900"
      >
        <SheetHeader className="px-0 border-b dark:border-gray-700">
          <SheetTitle className="font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <Image
                src="/Cart.svg"
                alt="Empty Cart"
                width={300}
                height={300}
                className="mb-4"
              />
              <p className="text-gray-500 dark:text-gray-400 text-xl">
                Your cart is empty.
              </p>
              <Link href="/Product">
                <Button className="mt-4" onClick={() => setIsOpen(false)}>
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-3 dark:border-gray-700"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={50}
                  height={50}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ${item.price} x {item.quantity}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 border rounded dark:border-gray-600"
                    >
                      <Minus className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                    </button>
                    <span className="text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 border rounded dark:border-gray-600"
                    >
                      <Plus className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                    </button>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </AlertDialogTrigger>
                  {selectedItem && (
                    <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {selectedItem.name}{" "}
                          from your cart?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:text-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="dark:bg-red-600 dark:text-white"
                          onClick={() => removeItem(selectedItem.id)}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  )}
                </AlertDialog>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4 dark:border-gray-700">
            <div className="flex justify-between font-medium text-gray-900 dark:text-white">
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
