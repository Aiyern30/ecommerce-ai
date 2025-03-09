"use client";

import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import CartSheet from "./Cart";
import WishlistSheet from "./Wishlist";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md border-b z-50">
        <div className="container mx-auto flex items-center justify-between p-4 flex-nowrap">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              ShopYTL
            </Link>

            {/* Desktop Navigation - only show on lg screens */}
            <nav className="hidden lg:block">
              <ul className="flex gap-6 whitespace-nowrap">
                <li>
                  <Link href="/Product" className="hover:text-gray-600">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/Category" className="hover:text-gray-600">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/Comparison" className="hover:text-gray-600">
                    Compare
                  </Link>
                </li>

                <li>
                  <Link href="/Blog" className="hover:text-gray-600">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/FAQ" className="hover:text-gray-600">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/Contact" className="hover:text-gray-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Box (Desktop Only) */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-[300px] pl-10"
              />
            </div>
            <CartSheet />
            <WishlistSheet />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="absolute top-full left-0 w-full bg-white shadow-lg border-b lg:hidden">
            <div className="container mx-auto p-4">
              <ul className="flex flex-col gap-4">
                <li>
                  <Link
                    href="/Product"
                    className="block w-full hover:font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Category"
                    className="block w-full hover:font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Comparison"
                    className="block w-full hover:font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Compare
                  </Link>
                </li>

                <li>
                  <Link
                    href="/Blog"
                    className="block w-full hover:font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/FAQ"
                    className="block w-full hover:font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Contact"
                    className="block w-full hover:font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </header>
    </div>
  );
};

export default Header;
