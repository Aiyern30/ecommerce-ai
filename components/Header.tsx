import { ShoppingCart, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

const Header = () => {
  return (
    <div>
      {/* Top Banner */}
      <div className="relative bg-black px-4 py-1 text-center text-sm text-white">
        <p>Sign up and get 20% off on your first order</p>
        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              SHOP.CO
            </Link>
            <nav className="hidden md:block">
              <ul className="flex gap-6">
                <li>
                  <Link href="/shop" className="hover:text-gray-600">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/on-sale" className="hover:text-gray-600">
                    On Sale
                  </Link>
                </li>
                <li>
                  <Link href="/new-arrivals" className="hover:text-gray-600">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="hover:text-gray-600">
                    Brands
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-[300px] pl-10"
              />
            </div>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
