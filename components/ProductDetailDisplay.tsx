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
import type { Product } from "@/type/product";

interface ProductDetailDisplayProps {
  product: Product;
}

export default function ProductDetailDisplay({
  product,
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
    <div className="flex flex-col xl:flex-row gap-6">
      {/* LEFT: Square Thumbnails (Fixed Width) */}
      <div className="flex xl:flex-col gap-2 overflow-x-auto xl:overflow-y-auto w-full xl:w-24 p-2">
        {allImages.map((img, index) => (
          <div
            key={index}
            className={`relative aspect-square w-20 flex-shrink-0 rounded-md border cursor-pointer transition ${
              selectedImage === img.image_url
                ? "border-blue-500 ring-2 ring-blue-500"
                : "border-gray-300"
            }`}
            onMouseEnter={() => setHoveredImage(img.image_url)}
            onMouseLeave={() => setHoveredImage(null)}
            onClick={() => setSelectedImage(img.image_url)}
          >
            <Image
              src={img.image_url || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover rounded-md"
              priority
            />
          </div>
        ))}
      </div>

      {/* CENTER: Main Image */}
      <div className="relative aspect-square flex-grow border rounded-lg overflow-hidden">
        <Image
          src={displayImage || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover rounded-md"
          priority
        />
      </div>

      {/* RIGHT: Product Details */}
      <div className="xl:w-1/3 space-y-6">
        <div>
          <p className="text-sm text-gray-500 uppercase font-medium">
            {product.category || "N/A"}
          </p>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          <p className="text-gray-700 mt-2">
            {product.description || "No description provided."}
          </p>
        </div>

        {/* Price and Basic Info */}
        <Card className="shadow-none border p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Price</p>
              <p className="text-xl font-bold text-green-600">
                RM {product.price?.toFixed(2) || "0.00"}
              </p>
              <p className="text-sm text-gray-500">
                {product.unit || "per unit"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Stock</p>
              <p className="text-lg font-semibold">
                {product.stock_quantity ?? "N/A"}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">units available</p>
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
                      ? "Low Stock"
                      : "Critical"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Grade */}
        {product.grade && (
          <Card className="shadow-none border-0 p-0">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Grade</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {product.grade}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Variants */}
        {product.product_variants?.length && product.product_variants.length > 0 && (
          <Card className="shadow-none border-0 p-0">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Pricing Variants</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              {product.product_variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm font-medium">
                    {variant.variant_type}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    RM {variant.price?.toFixed(2)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        <Card className="shadow-none border-0 p-0">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg">Certifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-2">
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
              <p className="text-gray-500 text-sm">No certifications listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="shadow-none border-0 p-0">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-2">
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
              <p className="text-gray-500 text-sm">No tags listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Product Metadata */}
        <Card className="shadow-none border p-4 bg-gray-50">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Product ID:</span>
              <span className="font-mono text-xs">{product.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Created:</span>
              <span>
                {new Date(product.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Updated:</span>
              <span>
                {new Date(product.updated_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
