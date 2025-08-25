/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  Package,
  ArrowLeft,
  Search,
  ShoppingCart,
  Truck,
  Star,
  Shield,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { addToCart } from "@/lib/cart/utils";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

import { Button, Skeleton, Badge } from "@/components/ui";
import { TypographyH1, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/type/product";

// Enhanced skeleton with modern design
function ProductDetailSkeleton({}: { isStaffView: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-6 w-80 mb-8" />

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-full aspect-square rounded-2xl" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Content Section Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>

            <Skeleton className="h-12 w-32" />

            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductNotFound({ isStaffView }: { isStaffView: boolean }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center">
            <Package className="w-12 h-12 text-red-500" />
          </div>

          <TypographyH1 className="mb-4 text-gray-900 dark:text-white">
            Product Not Found
          </TypographyH1>

          <TypographyP className="text-gray-600 dark:text-gray-400 mb-8">
            The product you're looking for doesn't exist or may have been
            removed. Please check the URL or try searching for the product
            again.
          </TypographyP>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>

            <Button
              onClick={() =>
                router.push(isStaffView ? "/staff/products" : "/products")
              }
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Products
            </Button>
          </div>

          {isStaffView && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="default"
                onClick={() => router.push("/staff/products/new")}
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Add New Product
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailClient() {
  const pathname = usePathname();

  const productId = useMemo(() => {
    const parts = (pathname ?? "").split("/");
    return parts[parts.length - 1];
  }, [pathname]);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const user = useUser();
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
            *,
            product_images(
              id,
              image_url,
              alt_text,
              is_primary,
              sort_order
            )
          `
        )
        .eq("id", productId)
        .single();

      if (error || !data) {
        console.error("Product fetch failed:", error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    if (productId) fetchProduct();
  }, [productId]);

  // Create delivery options and set default selection
  const deliveryOptions = useMemo(() => {
    if (!product) return [];

    return [
      product.normal_price != null
        ? {
            key: "normal",
            label: "Normal Delivery",
            price: product.normal_price,
            icon: Truck,
          }
        : null,
      product.pump_price != null
        ? {
            key: "pump",
            label: "Pump Delivery",
            price: product.pump_price,
            icon: Truck,
          }
        : null,
      product.tremie_1_price != null
        ? {
            key: "tremie_1",
            label: "Tremie 1",
            price: product.tremie_1_price,
            icon: Truck,
          }
        : null,
      product.tremie_2_price != null
        ? {
            key: "tremie_2",
            label: "Tremie 2",
            price: product.tremie_2_price,
            icon: Truck,
          }
        : null,
      product.tremie_3_price != null
        ? {
            key: "tremie_3",
            label: "Tremie 3",
            price: product.tremie_3_price,
            icon: Truck,
          }
        : null,
    ].filter(Boolean) as {
      key: string;
      label: string;
      price: number;
      icon: any;
    }[];
  }, [product]);

  // Set default delivery option when product loads or delivery options change
  useEffect(() => {
    if (deliveryOptions.length > 0 && !selectedDelivery) {
      setSelectedDelivery(deliveryOptions[0].key);
    }
  }, [deliveryOptions, selectedDelivery]);

  const isStaffView = (pathname ?? "").includes("/staff/");

  if (loading) return <ProductDetailSkeleton isStaffView={isStaffView} />;
  if (!product) return <ProductNotFound isStaffView={isStaffView} />;

  const selectedOption =
    deliveryOptions.find((opt) => opt.key === selectedDelivery) ||
    deliveryOptions[0];
  const selectedPrice = selectedOption
    ? selectedOption.price
    : product.normal_price;

  const handleAddToCart = async () => {
    if (!user?.id) {
      toast.error("Please login to add items to cart", {
        action: { label: "Login", onClick: () => router.push("/login") },
      });
      return;
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    setIsAdding(true);
    const result = await addToCart(
      user.id,
      product.id,
      quantity,
      selectedDelivery
    );
    setIsAdding(false);
    if (result.success) {
      toast.success("Added to cart!", {
        description: `${product.name} (${selectedOption?.label}) x${quantity} has been added to your cart.`,
      });
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } else {
      toast.error("Failed to add item to cart", {
        description: "Please try again.",
      });
    }
  };

  const adjustQuantity = (increment: boolean) => {
    if (increment) {
      setQuantity((prev) => Math.min(prev + 1, product.stock_quantity ?? 999));
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const images = product.product_images || [];
  const currentImage = images[selectedImageIndex];

  const inStock = (product.stock_quantity ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <BreadcrumbNav
            customItems={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: product.name },
            ]}
          />
        </div>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg sticky top-40">
              {currentImage ? (
                <Image
                  src={currentImage.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-24 h-24" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                      selectedImageIndex === index
                        ? "border-blue-500 shadow-md scale-105"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {product.description ||
                      "High-quality construction material"}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  <Award className="w-3 h-3 mr-1" />
                  {product.category || "Construction"}
                </Badge>
                <Badge
                  variant={
                    product.status === "published" ? "default" : "secondary"
                  }
                >
                  {product.status === "published" ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {product.status.charAt(0).toUpperCase() +
                    product.status.slice(1)}
                </Badge>
                {product.is_featured && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
              <div className="text-4xl font-bold text-green-700 dark:text-green-400">
                RM {(selectedPrice ?? 0).toFixed(2)}
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
                  per {product.unit || "unit"}
                </span>
              </div>
              {selectedOption && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedOption.label}
                </div>
              )}
            </div>

            {/* Product Specifications */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Product Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Grade
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {product.grade || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Type
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {product.product_type || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Mortar Ratio
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {product.mortar_ratio || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Stock
                  </div>
                  <div
                    className={`font-semibold flex items-center gap-1 ${
                      inStock
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {inStock ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {product.stock_quantity ?? "N/A"} units
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </h3>

              {/* Delivery Options */}
              {deliveryOptions.length >= 1 && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Delivery Method
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {deliveryOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => setSelectedDelivery(option.key)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedDelivery === option.key
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <span className="font-bold">
                            RM {option.price.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustQuantity(false)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={product.stock_quantity ?? 999}
                      value={isNaN(quantity) ? "" : quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow empty string for editing, show empty
                        if (val === "") {
                          setQuantity(NaN);
                        } else {
                          // Remove leading zeros
                          const num = Number(val.replace(/^0+/, "") || "0");
                          setQuantity(
                            Math.max(
                              0,
                              Math.min(num, product.stock_quantity ?? 999)
                            )
                          );
                        }
                      }}
                      onBlur={(e) => {
                        // If input is empty or invalid, reset to 0
                        if (
                          !e.target.value ||
                          isNaN(Number(e.target.value)) ||
                          Number(e.target.value) < 0
                        ) {
                          setQuantity(0);
                        }
                      }}
                      className="w-20 h-10 text-center border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => adjustQuantity(true)}
                      disabled={quantity >= (product.stock_quantity ?? 999)}
                      className="w-10 h-10 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Total and Add Button */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Price
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      RM{" "}
                      {(
                        (selectedPrice ?? 0) * (isNaN(quantity) ? 0 : quantity)
                      ).toFixed(2)}
                    </div>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAdding || !inStock}
                    className="min-w-[140px]"
                  >
                    {isAdding ? (
                      "Adding..."
                    ) : !inStock ? (
                      "Out of Stock"
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>Product ID: {product.id}</div>
              <div>
                Created: {new Date(product.created_at).toLocaleDateString()}
              </div>
              <div>
                Last Updated:{" "}
                {new Date(product.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
