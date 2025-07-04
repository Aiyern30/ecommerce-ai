"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, LogIn, Moon, Sun } from "lucide-react";
import Link from "next/link";
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
  console.log("User:", user);

  const isActive = (path: string) => pathname.startsWith(path);

  const primaryNavItems = [
    { name: "Shop", path: "/product" },
    { name: "Categories", path: "/category" },
    { name: "Compare", path: "/comparison" },
  ];

  const secondaryNavItems = [
    { name: "Blog", path: "/blog" },
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
        <div className="container mx-auto flex items-center justify-between p-4 flex-nowrap">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold dark:text-white">
              ShopYTL
            </Link>

            <nav className="hidden lg:block">
              <ul className="flex gap-6 whitespace-nowrap items-center">
                {primaryNavItems.map(({ name, path }) => (
                  <li key={path} className="relative">
                    <Link
                      href={path}
                      className={`hover:text-gray-600 dark:hover:text-gray-300 ${
                        isActive(path)
                          ? "text-black dark:text-white font-semibold"
                          : "dark:text-gray-300"
                      }`}
                    >
                      {name}
                    </Link>
                    {isActive(path) && (
                      <div className="absolute left-0 -bottom-1 h-[2px] w-full bg-black dark:bg-white rounded-md"></div>
                    )}
                  </li>
                ))}

                <li className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 ${
                          isAnySecondaryActive
                            ? "text-black dark:text-white font-semibold"
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
                              isActive(path) ? "font-semibold" : ""
                            }`}
                          >
                            {name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {isAnySecondaryActive && (
                    <div className="absolute left-0 -bottom-1 h-[2px] w-full bg-black dark:bg-white rounded-md"></div>
                  )}
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-[300px] pl-10 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>

            {!user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoginClick}
                className="hidden lg:flex items-center gap-2 border-[#ff7a5c] text-[#ff7a5c] hover:bg-[#fff5f3] dark:hover:bg-[#3a2a27]"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            ) : (
              <>
                <NotificationSheet />
                <CartSheet />
                <WishlistSheet />
                {/* Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer border-2 border-[#ff7a5c]">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url || undefined}
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
              </>
            )}

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
      </header>
    </div>
  );
};

export default Header;
