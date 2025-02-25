"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
} from "lucide-react";
import { Button, Slider } from "@/components/ui";
import { ProductCard } from "@/components/ProductCards";

export default function CategoryPage() {
  const [priceRange, setPriceRange] = useState([50]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const categories = [
    { name: "T-shirts", count: 120 },
    { name: "Shorts", count: 89 },
    { name: "Shirts", count: 95 },
    { name: "Hoodie", count: 34 },
    { name: "Jeans", count: 56 },
  ];

  const colors = [
    { name: "Green", class: "bg-green-500" },
    { name: "Red", class: "bg-red-500" },
    { name: "Yellow", class: "bg-yellow-500" },
    { name: "Orange", class: "bg-orange-500" },
    { name: "Blue", class: "bg-blue-500" },
    { name: "Indigo", class: "bg-indigo-500" },
    { name: "Purple", class: "bg-purple-500" },
    { name: "Pink", class: "bg-pink-500" },
    { name: "White", class: "bg-white border" },
    { name: "Black", class: "bg-black" },
  ];

  const sizes = [
    "XX-Small",
    "X-Small",
    "Small",
    "Medium",
    "Large",
    "X-Large",
    "XX-Large",
    "3X-Large",
    "4X-Large",
  ];

  const dressStyles = ["Casual", "Formal", "Party", "Gym"];

  const products = [
    {
      name: "Gradient Graphic T-shirt",
      price: 145,
      rating: 3.5,
      reviews: 145,
      image: "/placeholder.svg",
    },
    {
      name: "Polo with Tipping Details",
      price: 180,
      rating: 4.5,
      reviews: 152,
      image: "/placeholder.svg",
    },
    {
      name: "Black Striped T-shirt",
      price: 120,
      originalPrice: 160,
      rating: 5.0,
      reviews: 145,
      image: "/placeholder.svg",
    },
    {
      name: "Skinny Fit Jeans",
      price: 240,
      originalPrice: 260,
      rating: 3.5,
      reviews: 145,
      image: "/placeholder.svg",
    },
    {
      name: "Checkered Shirt",
      price: 180,
      rating: 4.5,
      reviews: 145,
      image: "/placeholder.svg",
    },
    {
      name: "Sleeve Striped T-shirt",
      price: 130,
      originalPrice: 160,
      rating: 4.5,
      reviews: 125,
      image: "/placeholder.svg",
    },
    {
      name: "Vertical Striped Shirt",
      price: 212,
      originalPrice: 232,
      rating: 5.0,
      reviews: 145,
      image: "/placeholder.svg",
    },
    {
      name: "Courage Graphic T-shirt",
      price: 145,
      rating: 4.0,
      reviews: 125,
      image: "/placeholder.svg",
    },
    {
      name: "Loose Fit Bermuda Shorts",
      price: 80,
      rating: 3.0,
      reviews: 105,
      image: "/placeholder.svg",
    },
  ];

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Filters Sidebar */}
      <div className="w-64 flex-shrink-0 border-r bg-white px-4 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <SlidersHorizontal className="h-5 w-5" />
        </div>

        {/* Categories */}
        <div className="mt-6 space-y-4">
          {categories.map((category) => (
            <button
              key={category.name}
              className="flex w-full items-center justify-between text-sm hover:text-gray-900"
            >
              <span>{category.name}</span>
              <span className="text-muted-foreground">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Price Range */}
        <div className="mt-6">
          <h3 className="flex items-center justify-between text-sm font-medium">
            Price
            <ChevronDown className="h-4 w-4" />
          </h3>
          <div className="mt-4">
            <Slider
              defaultValue={[50]}
              max={200}
              step={1}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ${priceRange[0]}
              </span>
              <span className="text-sm text-muted-foreground">$200</span>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="mt-6">
          <h3 className="flex items-center justify-between text-sm font-medium">
            Colors
            <ChevronDown className="h-4 w-4" />
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`h-8 w-8 rounded-full ${color.class} ${
                  selectedColors.includes(color.name)
                    ? "ring-2 ring-black ring-offset-2"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="mt-6">
          <h3 className="flex items-center justify-between text-sm font-medium">
            Size
            <ChevronDown className="h-4 w-4" />
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`rounded px-3 py-1 text-sm ${
                  selectedSizes.includes(size)
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Dress Style */}
        <div className="mt-6">
          <h3 className="flex items-center justify-between text-sm font-medium">
            Dress Style
            <ChevronDown className="h-4 w-4" />
          </h3>
          <div className="mt-4 space-y-2">
            {dressStyles.map((style) => (
              <button
                key={style}
                className="flex w-full items-center justify-between text-sm hover:text-gray-900"
              >
                <span>{style}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <Button className="mt-6 w-full">Apply Filter</Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">Casual</span>
        </div>

        {/* Category Header */}
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Casual</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Showing 1-10 of 100 Products
            </span>
            <select className="rounded-md border px-3 py-1.5 text-sm">
              <option>Most Popular</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard key={i} {...product} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {[1, 2, 3, "...", 8, 9, 10].map((page, i) => (
            <Button
              key={i}
              variant={page === 1 ? "default" : "outline"}
              className={typeof page === "string" ? "cursor-default" : ""}
            >
              {page}
            </Button>
          ))}
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
