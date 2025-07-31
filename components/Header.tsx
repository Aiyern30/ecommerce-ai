"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, Moon, Sun } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import CartSheet from "./Cart";
import WishlistSheet from "./Wishlist";
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

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useUser();

  const isActive = (path: string) => pathname.startsWith(path);

  const primaryNavItems = [
    { name: "Products", path: "/products" },
    { name: "Blog", path: "/blogs" },
    { name: "Compare", path: "/compare" },
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
    // If user is logged in but missing avatar_url, force a reload to get fresh user data
    if (user && !user.user_metadata?.avatar_url) {
      supabase.auth.getUser().then(() => {
        window.location.reload();
      });
    }
  }, [user]);

  return (
    <div>
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md border-b z-50 dark:border-gray-800">
        {/* Top Row - Logo and Icons */}
        <div className="border-b dark:border-gray-800 md:border-b-0">
          <div className="container mx-auto flex items-center justify-between p-4">
            {/* Logo */}
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

            {/* Search Bar - Center (Desktop only) */}
            <div className="relative flex-1 max-w-md mx-8 hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pl-10 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
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

              {/* User-specific icons */}
              {user && (
                <>
                  <NotificationSheet />
                  <CartSheet />
                  <WishlistSheet />
                </>
              )}

              {/* Cart for non-users */}
              {!user && <CartSheet />}

              {/* Avatar/Profile */}
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
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Button */}
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

        {/* Mobile Search Row */}
        <div className="block md:hidden border-b dark:border-gray-800">
          <div className="container mx-auto p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pl-10 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Bottom Row - Navigation & Auth Buttons (Desktop only) */}
        <div className="hidden md:block border-t dark:border-gray-800">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            {/* Navigation */}
            <nav className="flex items-center">
              <ul className="flex gap-8 items-center">
                {primaryNavItems.map(({ name, path }) => (
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
                  {primaryNavItems.map(({ name, path }, index) => (
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
