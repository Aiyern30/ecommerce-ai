"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  Button,
  Slider,
  Sheet,
  // SheetTrigger,
  SheetContent,
} from "@/components/ui/";

interface FiltersSidebarProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}

export function FiltersSidebar({
  isFilterOpen,
  setIsFilterOpen,
}: FiltersSidebarProps) {
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
    { name: "White", class: "bg-white dark:bg-gray-200 border" },
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

  const FiltersContent = () => (
    <div className="flex flex-col h-full">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 py-4 border-b dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Filters</h2>
          <SlidersHorizontal className="h-5 w-5 dark:text-gray-400" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-4 py-4 dark:bg-gray-900">
        {/* Categories */}
        <div className="mt-4 space-y-4">
          {categories.map((category) => (
            <button
              key={category.name}
              className="flex w-full items-center justify-between text-sm hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <span>{category.name}</span>
              <span className="text-muted-foreground dark:text-gray-500">
                ({category.count})
              </span>
            </button>
          ))}
        </div>

        {/* Price Range */}
        <div className="mt-6">
          <h3 className="flex items-center justify-between text-sm font-medium dark:text-white">
            Price
            <ChevronDown className="h-4 w-4 dark:text-gray-400" />
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
              <span className="text-sm text-muted-foreground dark:text-gray-400">
                ${priceRange[0]}
              </span>
              <span className="text-sm text-muted-foreground dark:text-gray-400">
                $200
              </span>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="mt-6">
          <h3 className="flex items-center justify-between text-sm font-medium dark:text-white">
            Colors
            <ChevronDown className="h-4 w-4 dark:text-gray-400" />
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`h-8 w-8 rounded-full ${color.class} ${
                  selectedColors.includes(color.name)
                    ? "ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-gray-900"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="mt-6">
          <h3 className="flex items-center justify-between text-sm font-medium dark:text-white">
            Size
            <ChevronDown className="h-4 w-4 dark:text-gray-400" />
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`rounded px-3 py-1 text-sm ${
                  selectedSizes.includes(size)
                    ? "bg-gray-900 text-white dark:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Apply Button */}
      <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 px-4 py-4 border-t dark:border-gray-800">
        <Button className="w-full">Apply Filter</Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r dark:border-gray-800 bg-white dark:bg-gray-900">
        <FiltersContent />
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent
          side="left"
          className="h-screen overflow-auto dark:bg-gray-900 dark:border-gray-800"
        >
          <FiltersContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
