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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/";

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
  compareCount?: number;
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
  compareCount = 0,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomImages, setZoomImages] = useState<string[]>([]);
  const [zoomIndex, setZoomIndex] = useState(0);
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add to wishlist:", id);
  };

  // If you have multiple images, replace this with your images array logic.
  // For now, just support single image.
  useEffect(() => {
    if (zoomImage) {
      setZoomImages([zoomImage]);
      setZoomIndex(0);
    }
  }, [zoomImage]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomIndex((prev) => (prev - 1 + zoomImages.length) % zoomImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomIndex((prev) => (prev + 1) % zoomImages.length);
  };

  return (
    <>
      <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none flex items-center justify-center">
          {zoomImages.length > 0 && (
            <div className="relative w-full flex items-center justify-center">
              <Image
                src={zoomImages[zoomIndex]}
                alt="Zoomed Product"
                width={1200}
                height={800}
                className="w-full h-auto object-contain"
              />

              {zoomImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    aria-label="Previous Image"
                    type="button"
                  >
                    <svg
                      width="28"
                      height="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M18 6L10 14L18 22" />
                    </svg>
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    aria-label="Next Image"
                    type="button"
                  >
                    <svg
                      width="28"
                      height="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M10 6L18 14L10 22" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 📦 Product Card */}
      <Link href={href} className="group block relative h-full">
        <Card className="py-0 h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {showCompare && isCompared && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold shadow">
                <Check className="h-4 w-4" />
              </div>
            )}

            <div>
              {/* Mobile Controls */}
              <div className="absolute left-4 bottom-4 flex flex-col gap-2 sm:hidden opacity-100 pointer-events-auto">
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoomImage(image);
                  }}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200"
                  title="Zoom In"
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
                    disabled={!isCompared && compareCount >= 4}
                    className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-200 ${
                      isCompared ? "text-blue-600" : "text-gray-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={
                      isCompared ? "Remove from Compare" : "Add to Compare"
                    }
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Desktop Controls */}
              <div className="absolute left-4 bottom-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto hidden sm:flex">
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoomImage(image);
                  }}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200"
                  title="Zoom In"
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
                    disabled={!isCompared && compareCount >= 4}
                    className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-200 ${
                      isCompared ? "text-blue-600" : "text-gray-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={
                      isCompared ? "Remove from Compare" : "Add to Compare"
                    }
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                  </button>
                )}
              </div>
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
    </>
  );
}
