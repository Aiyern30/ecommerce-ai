"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function WishlistSheet() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      name: "Gradient Graphic T-shirt",
      price: 145,
      image: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Checkered Shirt",
      price: 180,
      image: "/placeholder.svg",
    },
    {
      id: 4,
      name: "Leather Jacket",
      price: 350,
      image: "/placeholder.svg",
    },
  ]);
  // const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // This would be replaced with your actual cart state management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const removeItem = (id: number) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
  };

  const addToCart = (item: WishlistItem) => {
    // Check if item already exists in cart
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      // If item exists, increase quantity
      setCartItems((items) =>
        items.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      // If item doesn't exist, add it with quantity 1
      setCartItems((items) => [...items, { ...item, quantity: 1 }]);
    }

    // Optionally remove from wishlist after adding to cart
    // removeItem(item.id);

    // Show a confirmation message (you could implement a toast notification here)
    alert("Item added to cart!");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Heart className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col h-full p-4 pt-0">
        <SheetHeader className="px-0">
          <SheetTitle className="font-bold">Wishlist</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <Image
                src="/placeholder.svg?height=300&width=300"
                alt="Empty Wishlist"
                width={300}
                height={300}
                className="mb-4"
              />
              <p className="text-gray-500 text-xl">Your wishlist is empty.</p>
              <Link href="/Product">
                <Button className="mt-4" onClick={() => setIsOpen(false)}>
                  Explore Products
                </Button>
              </Link>
            </div>
          ) : (
            wishlistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-3"
              >
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={50}
                  height={50}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.price}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => addToCart(item)}
                  >
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    Add to Cart
                  </Button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {wishlistItems.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <Link href="/Wishlist">
              <Button className="w-full mt-4" onClick={() => setIsOpen(false)}>
                View Wishlist
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
