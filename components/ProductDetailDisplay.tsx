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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT: Square Thumbnails (Fixed Width) */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto w-full lg:w-24">
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
              className="object-cover rounded-md"
            />
          </div>
        ))}
      </div>

      {/* CENTER: Main Image */}
      <div className="relative aspect-square flex-grow border rounded-lg overflow-hidden">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className="object-contain"
        />
      </div>

      {/* RIGHT: Product Details */}
      <div className="lg:w-1/3 space-y-6">
        <div>
          <p className="text-sm text-gray-500 uppercase font-medium">
            {product.category || "N/A"}{" "}
            {product.unit ? `(${product.unit})` : ""}
          </p>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          <p className="text-gray-700 mt-2">
            {product.description || "No description provided."}
          </p>
        </div>

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
              product.product_tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  {tag.tag}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No tags listed.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
