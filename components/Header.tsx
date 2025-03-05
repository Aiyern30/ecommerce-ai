"use client";

import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import CartSheet from "./Cart";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md border-b z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              ShopYTL
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex gap-6">
                <li>
                  <Link href="/Product" className="hover:text-gray-600">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Category/On-Sale"
                    className="hover:text-gray-600"
                  >
                    On Sale
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Category/New-Arrivals"
                    className="hover:text-gray-600"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/Category/Brands" className="hover:text-gray-600">
                    Brands
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-[300px] pl-10"
              />
            </div>
            <CartSheet />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <nav className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-b">
            <ul className="flex flex-col gap-4 p-4">
              <li>
                <Link
                  href="/Shop"
                  className="block w-full py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/Category/On-Sale"
                  className="block w-full py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  On Sale
                </Link>
              </li>
              <li>
                <Link
                  href="/Category/New-Arrivals"
                  className="block w-full py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/Category/Brands"
                  className="block w-full py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Brands
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </div>
  );
};

export default Header;
