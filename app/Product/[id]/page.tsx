"use client";

import Image from "next/image";
import { useState } from "react";
import { Star, Minus, Plus } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from "@/components/ui";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
interface RelatedProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
}
// Dummy components to resolve undeclared variables
const ProductDetails = () => <p>Product Details Content</p>;
const ProductReviews = () => <p>Product Reviews Content</p>;
const ProductFAQs = () => <p>Product FAQs Content</p>;
const RelatedProductCard = ({
  name,
  price,
  originalPrice,
  rating,
  reviews,
}: RelatedProductCardProps) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-semibold">{name}</h3>
    <p>Price: ${price}</p>
    {originalPrice && <p>Original Price: ${originalPrice}</p>}
    <p>Rating: {rating}</p>
    <p>Reviews: {reviews}</p>
  </div>
);

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState("/placeholder.svg");
  const [selectedColor, setSelectedColor] = useState("olive");
  const [selectedSize, setSelectedSize] = useState("large");
  const [quantity, setQuantity] = useState(1);

  const images = ["/placeholder.svg", "/placeholder2.svg", "/placeholder3.svg"];
  const colors = [
    { name: "olive", class: "bg-[#4A5043]" },
    { name: "forest", class: "bg-[#1B4B33]" },
    { name: "navy", class: "bg-[#1B294B]" },
  ];

  const sizes = ["Small", "Medium", "Large", "X-Large"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      <div className="container mx-auto px-4 pb-16 pt-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="relative w-full h-80 sm:h-[500px] rounded-lg overflow-hidden bg-white">
              <Image
                src={selectedImage}
                alt="Main product image"
                fill
                className="object-cover"
              />
            </div>
            {/* Thumbnails */}
            <div className="mt-4 flex justify-center gap-2 sm:gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border ${
                    selectedImage === img ? "ring-2 ring-black" : ""
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Product image ${i}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">ONE LIFE GRAPHIC T-SHIRT</h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.5/5</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">$260</span>
              <span className="text-lg text-muted-foreground line-through">
                $300
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                -40%
              </span>
            </div>

            <p className="text-muted-foreground">
              This graphic t-shirt which is perfect for any occasion. Crafted
              from a soft and breathable fabric, it offers superior comfort and
              style.
            </p>

            {/* Color Selection */}
            <div>
              <h3 className="mb-3 text-sm font-medium">Select Colors</h3>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`h-8 w-8 rounded-full ${color.class} ${
                      selectedColor === color.name ? "ring-2 ring-offset-2" : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="mb-3 text-sm font-medium">Choose Size</h3>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size.toLowerCase())}
                    className={`rounded-md px-4 py-2 text-sm ${
                      selectedSize === size.toLowerCase()
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-md border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button className="flex-1" size="lg">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-black"
              >
                Product Details
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-black"
              >
                Rating & Reviews
              </TabsTrigger>
              <TabsTrigger
                value="faqs"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-black"
              >
                FAQs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-4">
              <ProductDetails />
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
              <ProductReviews />
            </TabsContent>
            <TabsContent value="faqs" className="pt-4">
              <ProductFAQs />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">YOU MIGHT ALSO LIKE</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                name: "Polo with Contrast Trims",
                price: 212,
                originalPrice: 242,
                rating: 4.8,
                reviews: 145,
              },
              {
                name: "Gradient Graphic T-shirt",
                price: 145,
                rating: 4.9,
                reviews: 125,
              },
              {
                name: "Polo with Tipping Details",
                price: 180,
                rating: 4.7,
                reviews: 105,
              },
              {
                name: "Black Striped T-shirt",
                price: 120,
                originalPrice: 160,
                rating: 4.8,
                reviews: 145,
              },
            ].map((product, i) => (
              <RelatedProductCard key={i} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
