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
      name: "Modern Wooden Dining Table",
      price: 499,
      image: "/images/dining-table.jpg",
    },
    {
      id: 2,
      name: "Luxury Leather Sofa",
      price: 899,
      image: "/images/leather-sofa.jpg",
    },
    {
      id: 3,
      name: "Minimalist Bookshelf",
      price: 199,
      image: "/images/bookshelf.jpg",
    },
    {
      id: 4,
      name: "Cozy Fabric Armchair",
      price: 349,
      image: "/images/armchair.jpg",
    },
    {
      id: 5,
      name: "Glass Coffee Table",
      price: 259,
      image: "/images/coffee-table.jpg",
    },
    {
      id: 6,
      name: "Ergonomic Office Chair",
      price: 299,
      image: "/images/office-chair.jpg",
    },
    {
      id: 7,
      name: "Elegant Bed Frame (Queen)",
      price: 799,
      image: "/images/bed-frame.jpg",
    },
    {
      id: 8,
      name: "Rustic Wooden Nightstand",
      price: 149,
      image: "/images/nightstand.jpg",
    },
    {
      id: 9,
      name: "Stylish TV Console",
      price: 379,
      image: "/images/tv-console.jpg",
    },
    {
      id: 10,
      name: "Industrial Bar Stools (Set of 2)",
      price: 189,
      image: "/images/bar-stools.jpg",
    },
    {
      id: 11,
      name: "Foldable Study Desk",
      price: 225,
      image: "/images/study-desk.jpg",
    },
  ]);

  // const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const removeItem = (id: number) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
  };

  const addToCart = (item: WishlistItem) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      setCartItems((items) =>
        items.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems((items) => [...items, { ...item, quantity: 1 }]);
    }

    removeItem(item.id);

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
                src="/shopping-cart.svg"
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
            wishlistItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 ${
                  index !== wishlistItems.length - 1 ? "border-b pb-3" : ""
                }`}
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
          <div className="border-t pt-4">
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
