"use client";

import {
  Star,
  ShoppingCart,
  Heart,
  ZoomIn,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/";
import { addToCart } from "@/lib/cart/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  href?: string;
  showCompare?: boolean;
  isCompared?: boolean;
  onCompareToggle?: (id: string, add: boolean) => void;
}

export function ProductCard({
  id,
  name,
  price,
  rating,
  reviews,
  image,
  href = "#",
  showCompare,
  isCompared = false,
  onCompareToggle,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const user = useUser();

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onCompareToggle) onCompareToggle(id, !isCompared);
    toast[!isCompared ? "success" : "info"](
      `${name} ${!isCompared ? "added to" : "removed from"} comparison`
    );
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      toast.error("Please login to add items to cart", {
        action: { label: "Login", onClick: () => router.push("/login") },
      });
      return;
    }

    setIsAddingToCart(true);

    const result = await addToCart(user.id, id, 1);

    if (result.success) {
      if (result.isUpdate) {
        toast.success("Quantity updated!", {
          description: `${name} quantity increased to ${result.newQuantity}.`,
        });
      } else {
        toast.success("Added to cart!", {
          description: `${name} has been added to your cart.`,
        });
      }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } else {
      toast.error("Failed to add item to cart", {
        description: "Please try again.",
      });
    }

    setIsAddingToCart(false);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(href);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add to wishlist:", id);
  };

  return (
    <Link href={href} className="group block relative h-full">
      <Card className="py-0 h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* 🟢 Badge shown at top-right when compared */}
          {showCompare && isCompared && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold shadow">
              <Check className="h-4 w-4" />
            </div>
          )}

          {/* Hover Icons */}
          <div className="absolute left-4 bottom-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add to Cart"
            >
              <ShoppingCart
                className={`h-5 w-5 ${
                  isAddingToCart ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </button>
            <button
              onClick={handleQuickView}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200"
              title="Quick View"
            >
              <ZoomIn className="h-5 w-5 text-blue-600" />
            </button>
            <button
              onClick={handleWishlist}
              className="p-2 bg-white rounded-full shadow-md hover:bg-red-50"
              title="Add to Wishlist"
            >
              <Heart className="h-5 w-5 text-blue-600" />
            </button>
            {showCompare && (
              <button
                onClick={handleCompareClick}
                className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-200 ${
                  isCompared ? "text-blue-600" : "text-gray-400"
                }`}
                title={isCompared ? "Remove from Compare" : "Add to Compare"}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <CardContent className="flex-1 p-4 space-y-2">
          <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({reviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">RM{price}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
