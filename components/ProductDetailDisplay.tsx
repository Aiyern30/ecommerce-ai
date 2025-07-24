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
import {
  TypographyP,
  TypographyInlineCode,
  TypographySmall,
} from "@/components/ui/Typography";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
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

            {/* Status - Only show for staff view */}
            {!isCustomerView && (
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
                  {product.status === "published" ? "Published" : "Draft"}
                </Badge>
              </div>
            )}
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

          {/* Variants */}
          {product.product_variants?.length &&
            product.product_variants.length > 0 && (
              <div>
                <TypographySmall className="font-medium text-muted-foreground mb-3">
                  Pricing Variants:
                </TypographySmall>
                <div className="space-y-2">
                  {product.product_variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
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
            <TypographySmall className="font-medium text-muted-foreground mb-3">
              Certifications:
            </TypographySmall>
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
            <TypographySmall className="font-medium text-muted-foreground mb-3">
              Tags:
            </TypographySmall>
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

          {/* Product Meta Information */}
          {!isCustomerView && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <TypographySmall className="text-muted-foreground">
                Product ID:{" "}
                <TypographyInlineCode>#{product.id}</TypographyInlineCode>
              </TypographySmall>
              <div className="mt-2 space-y-1 text-xs xl:text-sm text-gray-500 dark:text-gray-400">
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Side - Images */}
      <div className="space-y-4">
        {/* Main Image */}
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
            />
          </AspectRatio>
        </div>

        {/* Thumbnail Images */}
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
