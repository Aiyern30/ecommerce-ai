"use client";

import { ShoppingCart, ZoomIn, SlidersHorizontal, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/";
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
  grade?: string;
  productType?: string;
  unit?: string | null;
  stock?: number | null;
  image: string;
  href?: string;
  showCompare?: boolean;
  isCompared?: boolean;
  onCompareToggle?: (id: string, add: boolean) => void;
  compareCount?: number;
  // Add price fields
  normal_price?: number | null;
  pump_price?: number | null;
  tremie_1_price?: number | null;
  tremie_2_price?: number | null;
  tremie_3_price?: number | null;
}

export function ProductCard({
  id,
  name,
  price,
  grade,
  productType,
  unit,
  stock,
  image,
  href = "#",
  showCompare,
  isCompared = false,
  onCompareToggle,
  compareCount = 0,
  // Add price fields
  normal_price,
  pump_price,
  tremie_1_price,
  tremie_2_price,
  tremie_3_price,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomImages, setZoomImages] = useState<string[]>([]);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState("normal");
  const router = useRouter();
  const user = useUser();

  const deliveryOptions = [
    normal_price != null
      ? { key: "normal", label: "Normal Delivery", price: normal_price }
      : null,
    pump_price != null
      ? { key: "pump", label: "Pump Delivery", price: pump_price }
      : null,
    tremie_1_price != null
      ? { key: "tremie_1", label: "Tremie 1", price: tremie_1_price }
      : null,
    tremie_2_price != null
      ? { key: "tremie_2", label: "Tremie 2", price: tremie_2_price }
      : null,
    tremie_3_price != null
      ? { key: "tremie_3", label: "Tremie 3", price: tremie_3_price }
      : null,
  ].filter(Boolean) as { key: string; label: string; price: number }[];

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

    // Pass delivery method if needed
    const result = await addToCart(user.id, id, 1, selectedDelivery);

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

  const selectedOption = deliveryOptions.find(
    (opt) => opt.key === selectedDelivery
  );
  const selectedPrice = selectedOption ? selectedOption.price : price;

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
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {grade && <span>Grade: {grade}</span>}
              {productType && <span>Type: {productType}</span>}
              {unit && <span>Unit: {unit}</span>}
              {typeof stock === "number" && (
                <span>
                  Stock:{" "}
                  <span
                    className={
                      stock > 20
                        ? "text-green-600"
                        : stock > 5
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {stock}
                  </span>
                </span>
              )}
            </div>
            {/* Delivery method selector */}
            {deliveryOptions.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor={`delivery-method-${id}`} className="text-xs">
                  Delivery:
                </label>
                <Select
                  value={selectedDelivery}
                  onValueChange={setSelectedDelivery}
                >
                  <SelectTrigger className="w-36 h-8 px-2 py-1 text-xs">
                    <SelectValue placeholder="Select delivery" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryOptions.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">RM{selectedPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </>
  );
}
