"use client";

import { useState } from "react";
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
  const [mainImage, setMainImage] = useState(
    product.image_url ||
      product.product_images?.[0]?.image_url ||
      "/placeholder.svg"
  );

  const allImages = [
    ...(product.image_url ? [{ image_url: product.image_url }] : []),
    ...(product.product_images || []),
  ].filter(
    (img, index, self) =>
      index === self.findIndex((t) => t.image_url === img.image_url)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 flex flex-col md:flex-row lg:flex-col gap-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
          <Image
            src={mainImage || "/placeholder.svg"}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        {allImages.length > 1 && (
          <div className="flex md:flex-col lg:flex-row xl:flex-col gap-2 overflow-x-auto md:overflow-y-auto lg:overflow-x-auto xl:overflow-y-auto pb-2 md:pb-0 lg:pb-2 xl:pb-0">
            {allImages.map((img, index) => (
              <div
                key={index}
                className={`relative aspect-square w-20 h-20 flex-shrink-0 cursor-pointer rounded-md border ${
                  mainImage === img.image_url
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => setMainImage(img.image_url)}
              >
                <Image
                  src={img.image_url || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div>
          <p className="text-sm text-gray-500 uppercase font-medium">
            {product.category || "N/A"}{" "}
            {product.unit ? `(${product.unit})` : ""}
          </p>
          <h1 className="text-4xl font-bold mt-1">{product.name}</h1>
        </div>

        <div className="text-gray-700 leading-relaxed">
          <p>{product.description || "No description provided."}</p>
        </div>

        <Card className="shadow-none border-0 p-0">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg">Certifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-2">
            {product.product_certificates &&
            product.product_certificates.length > 0 ? (
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

        <Card className="shadow-none border-0 p-0">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-gray-700 text-sm">
            {product.product_tags && product.product_tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {product.product_tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-0.5"
                  >
                    {tag.tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
