"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  TypographyH3,
  TypographyP,
  TypographyInlineCode,
} from "@/components/ui/Typography";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Product } from "@/type/product";

interface ProductDetailDisplayProps {
  product: Product;
  isCustomerView?: boolean;
}

export default function ProductDetailDisplay({
  product,
  isCustomerView = false,
}: ProductDetailDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const allImages = [
    ...(product.image_url ? [{ image_url: product.image_url }] : []),
    ...(product.product_images || []),
  ].filter(
    (img, index, self) =>
      index === self.findIndex((t) => t.image_url === img.image_url)
  );

  useEffect(() => {
    const firstImg =
      product.image_url ||
      product.product_images?.[0]?.image_url ||
      "/placeholder.svg";
    setSelectedImage(firstImg);
  }, [product]);

  const displayImage = hoveredImage || selectedImage;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6">
      {/* Left Side - Small Thumbnails (1/12 width) */}
      <div className="lg:col-span-1">
        {allImages.length > 1 && (
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide">
            {allImages.map((img, index) => (
              <div
                key={index}
                className={`relative aspect-square w-16 lg:w-full flex-shrink-0 rounded-md border-2 cursor-pointer transition-colors duration-200 ${
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
        )}
      </div>

      {/* Middle - Large Main Image (responsive width: 6/12 on lg-xl, 7/12 on xl+) */}
      <div className="lg:col-span-7 xl:col-span-6">
        <div className="relative w-full h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
          <Image
            src={displayImage || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-fill"
            priority
          />
        </div>
      </div>

      {/* Right Side - Product Information (responsive width: 4/12 on lg-xl, 5/12 on xl+) */}
      <div className="lg:col-span-4 xl:col-span-5">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-xl xl:text-2xl font-bold leading-tight flex-1">
                {product.name}
              </CardTitle>
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {product.category || "N/A"}
              </Badge>
            </div>

            {product.description && (
              <TypographyP className="text-sm xl:text-base text-muted-foreground leading-relaxed">
                {product.description}
              </TypographyP>
            )}
          </CardHeader>

          <CardContent className="pt-0 space-y-3 xl:space-y-4">
            {/* Price and Stock */}
            <div>
              <TypographyH3 className="text-base xl:text-lg mb-2">
                Pricing & Stock
              </TypographyH3>
              <div className="grid grid-cols-2 gap-2 xl:gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Price
                  </p>
                  <p className="text-lg xl:text-xl font-bold text-green-600">
                    RM {product.price?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.unit || "per unit"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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
                <TypographyH3 className="text-base xl:text-lg mb-2">
                  Grade
                </TypographyH3>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {product.grade}
                </Badge>
              </div>
            )}

            {/* Variants */}
            {product.product_variants?.length &&
              product.product_variants.length > 0 && (
                <div>
                  <TypographyH3 className="text-base xl:text-lg mb-2">
                    Pricing Variants
                  </TypographyH3>
                  <div className="space-y-2">
                    {product.product_variants.map((variant, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 xl:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm font-medium">
                          {variant.variant_type}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          RM {variant.price?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Certifications */}
            <div>
              <TypographyH3 className="text-base xl:text-lg mb-2">
                Certifications
              </TypographyH3>
              <div className="flex flex-wrap gap-2">
                {product.product_certificates?.length ? (
                  product.product_certificates.map((cert, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                    >
                      {cert.certificate}
                    </Badge>
                  ))
                ) : (
                  <TypographyP className="text-muted-foreground text-sm">
                    No certifications listed.
                  </TypographyP>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <TypographyH3 className="text-base xl:text-lg mb-2">
                Tags
              </TypographyH3>
              <div className="flex flex-wrap gap-2">
                {product.product_tags?.length ? (
                  product.product_tags.map((tag, index) =>
                    tag.tags?.name ? (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs px-2 py-0.5"
                      >
                        {tag.tags.name}
                      </Badge>
                    ) : null
                  )
                ) : (
                  <TypographyP className="text-muted-foreground text-sm">
                    No tags listed.
                  </TypographyP>
                )}
              </div>
            </div>

            {/* Product Meta Information - At the bottom */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1 text-xs xl:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 xl:w-4 xl:h-4" />
                  <span>Added: {formatDate(product.created_at)}</span>
                </div>
                {product.updated_at !== product.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 xl:w-4 xl:h-4" />
                    <span>Updated: {formatDate(product.updated_at)}</span>
                  </div>
                )}
                {!isCustomerView && (
                  <div className="flex items-center gap-2">
                    <TypographyInlineCode>
                      ID: #{product.id}
                    </TypographyInlineCode>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
