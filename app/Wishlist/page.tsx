"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Trash2, ChevronRight } from "lucide-react";
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
} from "@/components/ui/";
import { toast } from "sonner";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function WishlistPage() {
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
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

  const removeItem = (id: number) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
    toast.success("Item removed from wishlist!", {
      duration: 3000,
      style: { background: "#16a34a", color: "#fff" },
    });
  };

  const addToCart = (item: WishlistItem) => {
    toast.success(`Added ${item.name} to cart!`, {
      duration: 3000,
      style: { background: "#16a34a", color: "#fff" },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">Wishlist</span>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-16 pt-6">
        <h1 className="text-3xl font-bold">YOUR WISHLIST</h1>
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Image
              src="/shopping-cart.svg"
              alt="Empty Wishlist"
              width={300}
              height={300}
              className="mb-4"
            />
            <p className="text-gray-500 text-xl mb-4">
              Your wishlist is empty.
            </p>
            <Link href="/Product">
              <Button>Explore Products</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <div className="relative h-48">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-700 mb-3">${item.price}</p>
                  <div className="flex justify-between">
                    <Button
                      onClick={() => addToCart(item)}
                      className="flex-1 mr-2"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
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
        )}
      </div>
    </div>
  );
}
