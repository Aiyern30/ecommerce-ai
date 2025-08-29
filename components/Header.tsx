/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import CartSheet from "./Cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/";
import NotificationSheet from "./Notification";
import { useTheme } from "./ThemeProvider";

import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase/browserClient";
import { Product } from "@/type/product";
import { useProductSearch } from "@/hooks/useProductSearch";
import { IoCameraOutline } from "react-icons/io5";
function getBestPriceAndLabel(product: Product) {
  const priceFields = [
    { key: "normal", label: "Normal Delivery", price: product.normal_price },
    { key: "pump", label: "Pump Delivery", price: product.pump_price },
    { key: "tremie_1", label: "Tremie 1", price: product.tremie_1_price },
    { key: "tremie_2", label: "Tremie 2", price: product.tremie_2_price },
    { key: "tremie_3", label: "Tremie 3", price: product.tremie_3_price },
  ];
  const found = priceFields.find(
    (f) => f.price !== null && f.price !== undefined
  );
  return found
    ? { price: Number(found.price), label: found.label }
    : { price: undefined, label: undefined };
}

// Enhanced helper function to highlight matching text with better partial matching
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  const queryTerms = query
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 0);

  // Create patterns for exact matches and prefix matches
  const exactPatterns = queryTerms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  // Add prefix patterns for partial matching
  const prefixPatterns = queryTerms
    .filter((term) => term.length >= 2)
    .map((term) => `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);

  const allPatterns = [...exactPatterns, ...prefixPatterns];
  const pattern = allPatterns.join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  const parts = text.split(regex);
  return parts.map((part, index) => {
    const isExactMatch = queryTerms.some(
      (term) => part.toLowerCase() === term.toLowerCase()
    );
    const isPrefixMatch = queryTerms.some(
      (term) =>
        part.toLowerCase().startsWith(term.toLowerCase()) &&
        part.toLowerCase() !== term.toLowerCase()
    );

    if (isExactMatch) {
      return (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded font-semibold"
        >
          {part}
        </mark>
      );
    } else if (isPrefixMatch) {
      return (
        <mark
          key={index}
          className="bg-yellow-100 dark:bg-yellow-900 px-0.5 rounded"
        >
          {part}
        </mark>
      );
    }

    return part;
  });
}

// Enhanced helper function to show matched keywords with better partial matching
function getMatchedKeywords(product: Product, query: string): string[] {
  if (!Array.isArray(product.keywords) || !query) return [];

  const queryTerms = query
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 0);

  const matchedKeywords = product.keywords.filter((keyword) => {
    const lowerKeyword = keyword.toLowerCase();

    return queryTerms.some((term) => {
      // Direct substring match
      if (lowerKeyword.includes(term)) return true;

      // Enhanced word-level matching - this is the key fix
      const keywordWords = lowerKeyword.split(/[\s\-_\.,]+/);
      return keywordWords.some((word) => {
        // This is the critical part: "cur" should match "curb"
        if (term.length >= 2 && word.startsWith(term)) {
          return true;
        }

        // Additional substring matching within words
        if (term.length >= 3 && word.includes(term)) {
          return true;
        }

        // Fuzzy matching for typos
        if (term.length >= 3 && word.length >= 3) {
          const similarity = calculateSimilarity(word, term);
          return similarity > 0.6; // More lenient threshold
        }

        return false;
      });
    });
  });

  // Sort by relevance and return top matches
  return matchedKeywords
    .sort((a, b) => {
      // Prioritize shorter keywords and better matches
      const aScore = queryTerms.reduce((score, term) => {
        const words = a.toLowerCase().split(/[\s\-_\.,]+/);
        if (words.some((word) => word.startsWith(term))) return score + 10;
        if (a.toLowerCase().includes(term)) return score + 5;
        return score;
      }, 0);

      const bScore = queryTerms.reduce((score, term) => {
        const words = b.toLowerCase().split(/[\s\-_\.,]+/);
        if (words.some((word) => word.startsWith(term))) return score + 10;
        if (b.toLowerCase().includes(term)) return score + 5;
        return score;
      }, 0);

      if (aScore !== bScore) return bScore - aScore;
      return a.length - b.length; // Shorter keywords first
    })
    .slice(0, 3);
}

// Helper function for similarity calculation (add this if not already present)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function ProductSearchBox({
  className = "",
  inputClassName = "",
}: {
  className?: string;
  inputClassName?: string;
  mobile?: boolean;
}) {
  const router = useRouter();
  const {
    searchResults,
    searchQuery,
    showDropdown,
    setShowDropdown,
    setIsSearchFocused,
    isLoading,
    searchError,
    searchContainerRef,
    handleSearchChange,
    handleInputFocus,
    handleInputBlur,
    clearSearch,
  } = useProductSearch();

  const handleResultClick = (id: string) => {
    router.push(`/products/${id}`);
    setShowDropdown(false);
    clearSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
      setIsSearchFocused(false);
    }
    if (e.key === "Enter" && searchResults.length > 0) {
      handleResultClick(searchResults[0].id);
    }
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Input
          type="search"
          placeholder="Search products, grades, categories..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={`pl-10 pr-20 ${inputClassName}`}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          ></button>
        )}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="ml-2"
          onClick={() => {
            router.push("/search");
          }}
          title="AI Image Search"
        >
          <IoCameraOutline size={20} />
        </Button>
      </div>

      <AnimatePresence>
        {showDropdown &&
          (searchResults.length > 0 || searchError || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto`}
            >
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Searching...
                  </span>
                </div>
              )}

              {searchError && (
                <div className="flex items-center p-4 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{searchError}</span>
                </div>
              )}

              {!isLoading &&
                !searchError &&
                searchResults.length === 0 &&
                searchQuery.length >= 2 && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      No products found for "{searchQuery}"
                    </p>
                    <p className="text-xs mt-1">
                      Try different keywords or check spelling
                    </p>
                  </div>
                )}

              {!isLoading && searchResults.length > 0 && (
                <ul>
                  {searchResults.map((product, index) => {
                    const mainImage =
                      product.product_images?.find((img) => img.is_primary) ||
                      product.product_images?.[0];
                    const { price, label } = getBestPriceAndLabel(product);
                    const matchedKeywords = getMatchedKeywords(
                      product,
                      searchQuery
                    );

                    return (
                      <li
                        key={product.id}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors ${
                          index === 0 ? "rounded-t-lg" : ""
                        } ${
                          index === searchResults.length - 1
                            ? "rounded-b-lg"
                            : ""
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleResultClick(product.id);
                        }}
                      >
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <Image
                            src={mainImage?.image_url || "/placeholder.svg"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {highlightMatch(product.name, searchQuery)}
                          </div>
                          {product.category && (
                            <div className="text-xs text-gray-400 truncate">
                              {highlightMatch(product.category, searchQuery)}{" "}
                              {product.grade && ` • ${product.grade}`}
                            </div>
                          )}

                          {/* Show matched keywords with enhanced highlighting */}
                          {matchedKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {matchedKeywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-600"
                                >
                                  {highlightMatch(keyword, searchQuery)}
                                </span>
                              ))}
                              {matchedKeywords.length >= 3 && (
                                <span className="text-xs text-gray-400 px-1.5 py-0.5">
                                  +more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                              {label || "No price"}
                            </span>
                            <span className="font-semibold text-sm">
                              {price !== undefined
                                ? `RM${price.toFixed(2)}`
                                : "N/A"}
                            </span>
                            {typeof product.stock_quantity === "number" && (
                              <span
                                className={`text-xs ml-2 ${
                                  product.stock_quantity > 20
                                    ? "text-green-600"
                                    : product.stock_quantity > 5
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {product.stock_quantity} in stock
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}

                  {searchResults.length >= 10 && (
                    <li className="px-3 py-2 text-center border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          router.push(
                            `/products?search=${encodeURIComponent(
                              searchQuery
                            )}`
                          );
                          setShowDropdown(false);
                          clearSearch();
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useUser();
  const [isStaff, setIsStaff] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  const filteredPrimaryNavItems = user
    ? [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name: "Blog", path: "/blogs" },
        { name: "Cart", path: "/cart" },
        { name: "Orders", path: "/profile/orders" },
      ]
    : [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name: "Blog", path: "/blogs" },
      ];

  const secondaryNavItems = [
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
    { name: "About", path: "/about" },
  ];

  const isAnySecondaryActive = secondaryNavItems.some((item) =>
    isActive(item.path)
  );

  const handleLoginClick = () => {
    router.push("/login");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    if (name.includes("@")) return name[0].toUpperCase();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    if (user && !user.user_metadata?.avatar_url) {
      supabase.auth.getUser().then(() => {
        window.location.reload();
      });
    }
  }, [user]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user: supaUser },
        error,
      } = await supabase.auth.getUser();

      if (!error && supaUser) {
        const userRole =
          supaUser.app_metadata?.role || supaUser.user_metadata?.role;
        if (userRole === "staff" || userRole === "admin") {
          setIsStaff(true);
        } else {
          setIsStaff(false);
        }
      } else {
        setIsStaff(false);
      }
    };
    checkUser();
  }, []);

  return (
    <div>
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md border-b z-50 dark:border-gray-800">
        <div className="border-b dark:border-gray-800 md:border-b-0">
          <div className="container mx-auto flex items-center justify-between p-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-xl font-bold dark:text-white hover:opacity-80 transition-opacity"
            >
              <Image
                src="/favicon.svg"
                alt="YTL Concrete Hub Logo"
                width={40}
                height={40}
                className="flex-shrink-0"
              />
              <span className="hidden md:block">YTL Concrete Hub</span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <ProductSearchBox />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>

              {user && (
                <>
                  <NotificationSheet />
                  <CartSheet />
                </>
              )}

              {!user && <CartSheet />}

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer border-2 border-[#ff7a5c] hover:scale-105 transition-transform">
                      <AvatarImage
                        src={
                          user.user_metadata?.picture ||
                          user.user_metadata?.avatar_url ||
                          undefined
                        }
                      />
                      <AvatarFallback>
                        {user.user_metadata?.full_name
                          ? getInitials(user.user_metadata.full_name)
                          : user.user_metadata?.name
                          ? getInitials(user.user_metadata.name)
                          : user.email
                          ? getInitials(user.email)
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}`}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <motion.div
                  animate={{ rotate: menuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {menuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </motion.div>
              </Button>
            </div>
          </div>
        </div>

        <div className="block md:hidden border-b dark:border-gray-800">
          <div className="container mx-auto p-4">
            <ProductSearchBox
              inputClassName="w-full pl-10 dark:bg-gray-800 dark:border-gray-700"
              mobile
            />
          </div>
        </div>

        {/* Bottom Row - Navigation & Auth Buttons (Desktop only) */}
        <div className="hidden md:block border-t dark:border-gray-800">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            {/* Navigation */}
            <nav className="flex items-center flex-1">
              <ul className="flex gap-8 items-center">
                {filteredPrimaryNavItems.map(({ name, path }) => (
                  <li key={path} className="relative">
                    <Link
                      href={path}
                      className={`hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium ${
                        isActive(path)
                          ? "text-[#ff7a5c] font-semibold"
                          : "dark:text-gray-300"
                      }`}
                    >
                      {name}
                    </Link>
                    {isActive(path) && (
                      <motion.div
                        className="absolute left-0 -bottom-1 h-[2px] w-full bg-[#ff7a5c] rounded-md"
                        layoutId="activeIndicator"
                        initial={false}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    )}
                  </li>
                ))}

                <li className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium ${
                          isAnySecondaryActive
                            ? "text-[#ff7a5c] font-semibold"
                            : "dark:text-gray-300"
                        }`}
                      >
                        More <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {secondaryNavItems.map(({ name, path }) => (
                        <DropdownMenuItem key={path} asChild>
                          <Link
                            href={path}
                            className={`w-full ${
                              isActive(path)
                                ? "font-semibold text-[#ff7a5c]"
                                : ""
                            }`}
                          >
                            {name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {isAnySecondaryActive && (
                    <motion.div
                      className="absolute left-0 -bottom-1 h-[2px] w-full bg-[#ff7a5c] rounded-md"
                      layoutId="activeIndicator"
                      initial={false}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                </li>
              </ul>
            </nav>
            {/* Staff Dashboard nav at the most right */}
            {isStaff && (
              <div className="ml-8 flex-shrink-0">
                <Link
                  href="/staff/dashboard"
                  className={`hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium ${
                    isActive("/staff/dashboard")
                      ? "text-[#ff7a5c] font-semibold"
                      : "dark:text-gray-300"
                  }`}
                >
                  Staff Dashboard
                </Link>
                {isActive("/staff/dashboard") && (
                  <motion.div
                    className="h-[2px] w-full bg-[#ff7a5c] rounded-md mt-1"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                )}
              </div>
            )}
            {/* Auth Buttons (only show when not logged in) */}
            {!user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoginClick}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-lg overflow-hidden"
            >
              <div className="container mx-auto p-4 space-y-4">
                {/* Primary Navigation */}
                <motion.nav
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="space-y-2"
                >
                  {/* Staff Dashboard nav for mobile */}
                  {isStaff && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                    >
                      <Link
                        href="/staff/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          isActive("/staff/dashboard")
                            ? "bg-orange-50 dark:bg-orange-900/20 text-[#ff7a5c] font-semibold border-l-4 border-[#ff7a5c]"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        <span>Staff Dashboard</span>
                        {isActive("/staff/dashboard") && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="w-2 h-2 bg-[#ff7a5c] rounded-full"
                            initial={false}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  )}
                  {filteredPrimaryNavItems.map(({ name, path }, index) => (
                    <motion.div
                      key={path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                    >
                      <Link
                        href={path}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          isActive(path)
                            ? "bg-orange-50 dark:bg-orange-900/20 text-[#ff7a5c] font-semibold border-l-4 border-[#ff7a5c]"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        <span>{name}</span>
                        {isActive(path) && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="w-2 h-2 bg-[#ff7a5c] rounded-full"
                            initial={false}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                {/* Secondary Navigation */}
                <motion.nav
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="space-y-2 border-t dark:border-gray-800 pt-4"
                >
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    More
                  </h3>
                  {secondaryNavItems.map(({ name, path }, index) => (
                    <motion.div
                      key={path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                    >
                      <Link
                        href={path}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          isActive(path)
                            ? "bg-orange-50 dark:bg-orange-900/20 text-[#ff7a5c] font-semibold border-l-4 border-[#ff7a5c]"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        <span>{name}</span>
                        {isActive(path) && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="w-2 h-2 bg-[#ff7a5c] rounded-full"
                            initial={false}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                {/* User Actions */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="border-t dark:border-gray-800 pt-4"
                >
                  {!user ? (
                    <Button
                      onClick={handleLoginClick}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Sign In
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-gray-300"
                      >
                        <Avatar className="h-8 w-8 mr-3 border border-[#ff7a5c]">
                          <AvatarImage
                            src={
                              user.user_metadata?.picture ||
                              user.user_metadata?.avatar_url ||
                              undefined
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {user.user_metadata?.full_name
                              ? getInitials(user.user_metadata.full_name)
                              : user.user_metadata?.name
                              ? getInitials(user.user_metadata.name)
                              : user.email
                              ? getInitials(user.email)
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>View Profile</span>
                      </Link>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Logout
                      </Button>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
};

export default Header;
