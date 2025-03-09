"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import CartSheet from "./Cart";
import WishlistSheet from "./Wishlist";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Function to check if a link is active
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md border-b z-50">
        <div className="container mx-auto flex items-center justify-between p-4 flex-nowrap">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              ShopYTL
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:block">
              <ul className="flex gap-6 whitespace-nowrap">
                {[
                  { name: "Shop", path: "/Product" },
                  { name: "Categories", path: "/Category" },
                  { name: "Compare", path: "/Comparison" },
                  { name: "Blog", path: "/Blog" },
                  { name: "FAQ", path: "/FAQ" },
                  { name: "Contact", path: "/Contact" },
                ].map(({ name, path }) => (
                  <li key={path} className="relative">
                    <Link
                      href={path}
                      className={`hover:text-gray-600 ${
                        isActive(path) ? "text-black font-semibold" : ""
                      }`}
                    >
                      {name}
                    </Link>
                    {/* Active Indicator */}
                    {isActive(path) && (
                      <div className="absolute left-0 -bottom-1 h-[2px] w-full bg-black rounded-md"></div>
                    )}
                  </li>
                ))}
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
                {[
                  { name: "Shop", path: "/Product" },
                  { name: "Categories", path: "/Category" },
                  { name: "Compare", path: "/Comparison" },
                  { name: "Blog", path: "/Blog" },
                  { name: "FAQ", path: "/FAQ" },
                  { name: "Contact", path: "/Contact" },
                ].map(({ name, path }) => (
                  <li key={path}>
                    <Link
                      href={path}
                      className={`block w-full hover:font-semibold ${
                        isActive(path) ? "text-black font-semibold" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </header>
    </div>
  );
};

export default Header;
