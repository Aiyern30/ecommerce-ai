"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  AspectRatio,
} from "@/components/ui";
import { TypographyP, TypographySmall } from "@/components/ui/Typography";
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/type/product";

interface ProductDetailDisplayProps {
  product: Product | null;
  isCustomerView?: boolean;
  productId?: string;
}

export default function ProductDetailDisplay({
  product: initialProduct,
  productId,
}: ProductDetailDisplayProps) {
  const [product, setProduct] = useState<Product | null>(
    initialProduct ?? null
  );
  const [loading, setLoading] = useState(!initialProduct && !!productId);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Fetch product details if productId is provided and product is not
  useEffect(() => {
    if (!initialProduct && productId) {
      setLoading(true);
      supabase
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
        .single()
        .then(({ data, error }) => {
          if (!error && data) setProduct(data);
          else setProduct(null);
          setLoading(false);
        });
    }
  }, [initialProduct, productId]);

  const allImages = [...(product?.product_images || [])].filter(
    (img, index, self) =>
      index === self.findIndex((t) => t.image_url === img.image_url)
  );

  useEffect(() => {
    setSelectedImage(
      product?.product_images?.[0]?.image_url || "/placeholder.svg"
    );
  }, [product]);

  const displayImage = hoveredImage || selectedImage;

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <span>Loading...</span>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <span>Product not found.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Product Information */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <TypographySmall className="font-medium text-muted-foreground mb-1">
                Product Name:
              </TypographySmall>
              <CardTitle className="text-xl xl:text-2xl font-bold leading-tight">
                {product.name}
              </CardTitle>
            </div>
            {/* Description */}
            {product.description && (
              <div>
                <TypographySmall className="font-medium text-muted-foreground mb-1">
                  Description:
                </TypographySmall>
                <TypographyP className="text-sm xl:text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </TypographyP>
              </div>
            )}
            {/* Category */}
            <div>
              <TypographySmall className="font-medium text-muted-foreground mb-1">
                Category:
              </TypographySmall>
              <Badge variant="outline" className="text-xs">
                {product.category || "N/A"}
              </Badge>
            </div>
            {/* Status */}
            <div className="flex items-center gap-2">
              <TypographySmall className="font-medium text-muted-foreground mb-1">
                Status:
              </TypographySmall>
              <Badge
                variant={
                  product.status === "published" ? "default" : "secondary"
                }
                className={
                  product.status === "published"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
              >
                {product.status.charAt(0).toUpperCase() +
                  product.status.slice(1)}
              </Badge>
              {product.is_featured && <Badge variant="default">Featured</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Price and Stock */}
          <div>
            <TypographySmall className="font-medium text-muted-foreground mb-3">
              Pricing & Stock:
            </TypographySmall>
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Normal Price
                </p>
                <p className="text-lg xl:text-xl font-bold text-green-600">
                  {product.normal_price !== null &&
                  product.normal_price !== undefined
                    ? `RM ${Number(product.normal_price).toFixed(2)}`
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.unit || "per unit"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Stock
                </p>
                <p className="text-base xl:text-lg font-semibold">
                  {product.stock_quantity ?? "N/A"}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    units
                  </p>
                  {product.stock_quantity !== null && (
                    <Badge
                      variant={
                        product.stock_quantity > 20
                          ? "default"
                          : product.stock_quantity > 5
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {product.stock_quantity > 20
                        ? "In Stock"
                        : product.stock_quantity > 5
                        ? "Low"
                        : "Critical"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Grade */}
          {product.grade && (
            <div>
              <TypographySmall className="font-medium text-muted-foreground mb-3">
                Grade:
              </TypographySmall>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {product.grade}
              </Badge>
            </div>
          )}
          {/* Product Type & Mortar Ratio */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <TypographySmall className="font-medium text-muted-foreground mb-1">
                Product Type:
              </TypographySmall>
              <div>{product.product_type}</div>
            </div>
            <div>
              <TypographySmall className="font-medium text-muted-foreground mb-1">
                Mortar Ratio:
              </TypographySmall>
              <div>{product.mortar_ratio || "N/A"}</div>
            </div>
          </div>
          {/* All Pricing */}
          <div>
            <TypographySmall className="font-medium text-muted-foreground mb-2">
              All Pricing:
            </TypographySmall>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Normal Price:</span>{" "}
                {product.normal_price !== null &&
                product.normal_price !== undefined
                  ? `RM ${Number(product.normal_price).toFixed(2)}`
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Pump Price:</span>{" "}
                {product.pump_price !== null && product.pump_price !== undefined
                  ? `RM ${Number(product.pump_price).toFixed(2)}`
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Tremie 1 Price:</span>{" "}
                {product.tremie_1_price !== null &&
                product.tremie_1_price !== undefined
                  ? `RM ${Number(product.tremie_1_price).toFixed(2)}`
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Tremie 2 Price:</span>{" "}
                {product.tremie_2_price !== null &&
                product.tremie_2_price !== undefined
                  ? `RM ${Number(product.tremie_2_price).toFixed(2)}`
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Tremie 3 Price:</span>{" "}
                {product.tremie_3_price !== null &&
                product.tremie_3_price !== undefined
                  ? `RM ${Number(product.tremie_3_price).toFixed(2)}`
                  : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Right Side - Images */}
      <div className="space-y-4">
        <div>
          <TypographySmall className="font-medium text-muted-foreground mb-2">
            Main Image:
          </TypographySmall>
          <AspectRatio ratio={4 / 3} className="w-full">
            <Image
              src={displayImage || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full rounded-lg object-contain bg-gray-50 dark:bg-gray-800"
              fill
              priority
              sizes="(min-width: 1024px) 512px, 100vw"
            />
          </AspectRatio>
        </div>
        {allImages.length > 1 && (
          <div>
            <TypographySmall className="font-medium text-muted-foreground mb-2">
              Additional Images:
            </TypographySmall>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, index) => (
                <div
                  key={index}
                  className={`relative aspect-square w-16 flex-shrink-0 rounded-md border-2 cursor-pointer transition-colors duration-200 ${
                    selectedImage === img.image_url
                      ? "border-blue-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onMouseEnter={() => setHoveredImage(img.image_url)}
                  onMouseLeave={() => setHoveredImage(null)}
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <Image
                    src={img.image_url || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
