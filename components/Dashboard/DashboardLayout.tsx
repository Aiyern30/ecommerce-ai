"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Moon,
  Package,
  Search,
  Sun,
  Users,
  BookOpen,
  HelpCircle,
  ShoppingCart,
  UserCog,
  Newspaper,
  Mail,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarTrigger,
} from "@/components/ui/";
import { Input } from "@/components/ui/";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/";
import { useTheme } from "../ThemeProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useProductSearch } from "@/hooks/useProductSearch";
import { Product } from "@/type/product";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const {
    searchResults,
    searchQuery,
    setSearchQuery,
    showDropdown,
    setShowDropdown,
    setIsSearchFocused,
    searchContainerRef,
    handleSearchChange,
    handleInputFocus,
    handleInputBlur,
  } = useProductSearch();

  // Check if current user is admin
  const currentUserRole =
    user?.app_metadata?.role || user?.user_metadata?.role || "customer";
  const isAdmin = currentUserRole === "admin";

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/staff/dashboard",
      icon: Home,
    },
    {
      label: "Products",
      href: "/staff/products",
      icon: Package,
    },
    {
      label: "Orders",
      href: "/staff/orders",
      icon: ShoppingCart,
    },
    {
      label: "Posts",
      href: "/staff/posts",
      icon: Newspaper,
    },
    {
      label: "Blogs",
      href: "/staff/blogs",
      icon: BookOpen,
    },
    {
      label: "FAQs",
      href: "/staff/faqs",
      icon: HelpCircle,
    },
    {
      label: "Enquiries",
      href: "/staff/enquiries",
      icon: Mail,
    },
    {
      label: "Customers",
      href: "/staff/customers",
      icon: Users,
    },
    // Only show Staff navigation if user is admin
    ...(isAdmin
      ? [
          {
            label: "Staff",
            href: "/staff/staffs",
            icon: UserCog,
          },
        ]
      : []),
  ];

  // Helper function to check if a path is active
  const isActivePath = (path: string) => {
    if (path === "/staff/dashboard") {
      return pathname === "/staff/dashboard" || pathname === "/staff";
    }
    return pathname ? pathname.startsWith(path) : false;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar
          className="border-r bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-lg data-[collapsible=icon]:w-16"
          collapsible="icon"
        >
          <SidebarHeader className="flex h-[68px] items-center justify-center border-b border-slate-200/60 dark:border-slate-700/60 px-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-md group-data-[collapsible=icon]:px-4">
            <Link
              href="/"
              className="flex items-center gap-3 font-semibold text-slate-800 dark:text-white group transition-all duration-200 hover:scale-105 group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex-shrink-0">
                <Image
                  src="/favicon.svg"
                  alt="YTL Concrete Hub Logo"
                  width={32}
                  height={32}
                  className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
                />
              </div>
              <div className="group-data-[collapsible=icon]:hidden flex items-center">
                <span className="text-lg font-bold text-black dark:text-white whitespace-nowrap">
                  YTL Concrete Hub
                </span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-6 px-2">
            <nav className="space-y-2">
              <div className="px-3 mb-4 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Main Navigation
                </p>
              </div>

              <SidebarMenu className="space-y-1">
                {/* Always show Customer Dashboard nav */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Customer Dashboard"
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3 ${
                      pathname === "/"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <Link href="/">
                      <div
                        className={`p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:p-2 ${
                          pathname === "/"
                            ? "bg-white/20 group-hover:bg-white/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                        }`}
                      >
                        <Home className="h-4 w-4" />
                      </div>
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        Customer Dashboard
                      </span>
                      {pathname === "/" && (
                        <div className="ml-auto w-2 h-2 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {sidebarItems.map(({ label, href, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={label}
                      className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3 ${
                        isActivePath(href)
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md"
                          : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm hover:scale-[1.01]"
                      }`}
                    >
                      <Link href={href}>
                        <div
                          className={`p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:p-2 ${
                            isActivePath(href)
                              ? "bg-white/20 group-hover:bg-white/30"
                              : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium group-data-[collapsible=icon]:hidden">
                          {label}
                        </span>
                        {isActivePath(href) && (
                          <div className="ml-auto w-2 h-2 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarContent>
          <SidebarFooter className="mt-auto p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="group-data-[collapsible=icon]:hidden">
                  System Online
                </span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-1 flex-col min-w-0">
          <header className="w-full bg-white dark:bg-gray-900 shadow-md border-b z-50 dark:border-gray-800 sticky top-0">
            <div className="flex items-center justify-between p-4 min-w-0">
              <SidebarTrigger className="h-8 w-8 text-gray-500 flex-shrink-0" />

              <div
                ref={searchContainerRef}
                className="relative flex items-center gap-2 flex-shrink min-w-0"
              >
                <div className="relative flex items-center">
                  <Input
                    type="search"
                    name="query"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Search for products..."
                    className="w-[200px] sm:w-[300px] pl-10 dark:bg-gray-800 dark:border-gray-700"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {/* Result Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <ul>
                      {searchResults.map((product) => {
                        const mainImage =
                          product.product_images?.find(
                            (img) => img.is_primary
                          ) || product.product_images?.[0];
                        const { price, label } = getBestPriceAndLabel(product);
                        return (
                          <li
                            key={product.id}
                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setShowDropdown(false);
                              setSearchQuery("");
                              setIsSearchFocused(false);
                              router.push(`/staff/products/${product.id}`);
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
                                {product.name}
                              </div>
                              {product.category && (
                                <div className="text-xs text-gray-400 truncate">
                                  {product.category}
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
                    </ul>
                  </div>
                )}

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="flex-shrink-0"
                >
                  {theme === "dark" ? (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                  ) : (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                  )}
                </Button>

                {/* Avatar & Dropdown */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-9 w-9 cursor-pointer border-2 border-[#ff7a5c] flex-shrink-0">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url || undefined}
                          alt="User avatar"
                        />
                        <AvatarFallback>
                          {user.user_metadata?.full_name
                            ? getInitials(user.user_metadata.full_name)
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
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 min-w-0 overflow-auto">
            <div className="w-full max-w-full">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
