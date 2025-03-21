"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, LogIn } from "lucide-react";
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
import { useSession } from "next-auth/react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname.startsWith(path);

  const primaryNavItems = [
    { name: "Shop", path: "/Product" },
    { name: "Categories", path: "/Category" },
    { name: "Compare", path: "/Comparison" },
  ];

  const secondaryNavItems = [
    { name: "Blog", path: "/Blog" },
    { name: "FAQ", path: "/Faq" },
    { name: "Contact", path: "/Contact" },
    { name: "About", path: "/About" },
  ];

  const isAnySecondaryActive = secondaryNavItems.some((item) =>
    isActive(item.path)
  );

  const handleLoginClick = () => {
    router.push("/login");
    setMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md border-b z-50">
        <div className="container mx-auto flex items-center justify-between p-4 flex-nowrap">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              ShopYTL
            </Link>

            <nav className="hidden lg:block">
              <ul className="flex gap-6 whitespace-nowrap items-center">
                {primaryNavItems.map(({ name, path }) => (
                  <li key={path} className="relative">
                    <Link
                      href={path}
                      className={`hover:text-gray-600 ${
                        isActive(path) ? "text-black font-semibold" : ""
                      }`}
                    >
                      {name}
                    </Link>
                    {isActive(path) && (
                      <div className="absolute left-0 -bottom-1 h-[2px] w-full bg-black rounded-md"></div>
                    )}
                  </li>
                ))}

                <li className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-1 hover:text-gray-600 ${
                          isAnySecondaryActive ? "text-black font-semibold" : ""
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
                    <div className="absolute left-0 -bottom-1 h-[2px] w-full bg-black rounded-md"></div>
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
                className="w-[300px] pl-10"
              />
            </div>
            <NotificationSheet />
            <CartSheet />
            <WishlistSheet />

            {!session ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoginClick}
                className="hidden lg:flex items-center gap-2 border-[#ff7a5c] text-[#ff7a5c] hover:bg-[#fff5f3]"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            ) : (
              <Link href="/" className="hidden lg:block">
                <Avatar className="h-9 w-9 border-2 border-[#ff7a5c]">
                  <AvatarImage src={session.user?.image || undefined} />
                  <AvatarFallback>
                    {session.user?.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
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

        {menuOpen && (
          <nav className="absolute top-full left-0 w-full bg-white shadow-lg border-b lg:hidden">
            <div className="container mx-auto p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full pl-10"
                />
              </div>

              <ul className="flex flex-col gap-4">
                {[...primaryNavItems, ...secondaryNavItems].map(
                  ({ name, path }) => (
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
                  )
                )}

                {!session && (
                  <li className="mt-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoginClick}
                      className="w-full flex items-center justify-center gap-2 border-[#ff7a5c] text-[#ff7a5c] hover:bg-[#fff5f3]"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login / Sign Up</span>
                    </Button>
                  </li>
                )}
              </ul>

              {session && (
                <div className="mt-4 pt-4 border-t flex items-center gap-3">
                  <Avatar className="h-9 w-9 border-2 border-[#ff7a5c]">
                    <AvatarImage src={session.user?.image || undefined} />
                    <AvatarFallback>
                      {session.user?.name
                        ? getInitials(session.user.name)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>
    </div>
  );
};

export default Header;
