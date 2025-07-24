"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/";
import { updateUserWishlist } from "@/lib/user/actions";
import { WishlistItem } from "@/type/user";

interface WishlistItemsProps {
  wishlist: WishlistItem[];
}

export default function WishlistItems({ wishlist = [] }: WishlistItemsProps) {
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const handleRemoveItem = async (itemId: string) => {
    setIsRemoving(true);
    try {
      const updatedWishlist = wishlist.filter((item) => item.id !== itemId);
      await updateUserWishlist(updatedWishlist);
      // In a real app, you would refresh the data here
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    // In a real app, this would add the item to the cart
    alert(`Added ${item.name} to cart!`);
  };

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
        <p className="text-muted-foreground mb-6">
          Save items you&apos;re interested in for later.
        </p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">
          Wishlist ({wishlist.length} items)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="flex gap-4 group">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
              <Image
                src={item.image || "/placeholder.svg?height=96&width=96"}
                alt={item.name}
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between">
                <h3 className="text-base font-medium">
                  <Link
                    href={`/products/${item.id}`}
                    className="hover:underline"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="ml-4 text-base font-medium">
                  ${item.price.toFixed(2)}
                </p>
              </div>

              {item.inStock ? (
                <p className="mt-1 text-sm text-green-600">In Stock</p>
              ) : (
                <p className="mt-1 text-sm text-red-600">Out of Stock</p>
              )}

              {item.color && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Color: {item.color}
                </p>
              )}

              <div className="mt-auto pt-2 flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.inStock}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
