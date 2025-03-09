"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Home, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/";
import { Input } from "@/components/ui/";

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProducts = [
    {
      id: 1,
      name: "Minimalist Desk Lamp",
      price: "$49.99",
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 2,
      name: "Ergonomic Office Chair",
      price: "$199.99",
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: 3,
      name: "Wireless Earbuds",
      price: "$89.99",
      image: "/placeholder.svg?height=120&width=120",
    },
  ];

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // In a real app, you would redirect to search results
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8 relative h-40 w-full">
          <Image
            src="/placeholder.svg?height=160&width=400&text=404"
            alt="404 Not Found"
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-4xl font-bold text-[#2a3990] mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          We can&apos;t seem to find the page you&apos;re looking for. It might
          have been moved, deleted, or perhaps never existed.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-[#f83d92] hover:bg-[#e02a7d]">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Navigation options */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/products">
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/contact">
              <ArrowLeft className="h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>

        {/* Featured products */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold mb-6">
            You might be interested in
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-32 mb-3">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-medium group-hover:text-[#f83d92] transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-700">{product.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
