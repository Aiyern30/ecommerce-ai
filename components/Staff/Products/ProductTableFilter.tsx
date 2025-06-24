"use client";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useProductsFilter } from "./ProductFilterContext";
import { productCategories, productColors } from "./ProductData";

export function ProductsTableFilters() {
  const { filters, updateFilter, resetFilters, applyFilters } =
    useProductsFilter();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {productCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <Select
              value={filters.color}
              onValueChange={(value) => updateFilter("color", value)}
            >
              <SelectTrigger id="color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {productColors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Price Range</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Min"
                type="number"
                className="w-full"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
              />
              <span>-</span>
              <Input
                placeholder="Max"
                type="number"
                className="w-full"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock-status">Stock Status</Label>
            <Select
              value={filters.stockStatus}
              onValueChange={(value) => updateFilter("stockStatus", value)}
            >
              <SelectTrigger id="stock-status">
                <SelectValue placeholder="Select stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="min-rating">Minimum Rating</Label>
            <Select
              value={filters.minRating}
              onValueChange={(value) => updateFilter("minRating", value)}
            >
              <SelectTrigger id="min-rating">
                <SelectValue placeholder="Select minimum rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Rating</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="rating-high">Highest Rated</SelectItem>
                <SelectItem value="inventory-high">
                  Highest Inventory
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
          <Button className="w-full sm:w-auto" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
