"use client";

import { useRef, useState, type ReactNode } from "react";
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
  FileText,
  BookOpen,
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
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Product } from "@/type/product";
interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [searchText, setSearchText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper function to check if a path is active
  const isActivePath = (path: string) => {
    if (path === "/staff/dashboard") {
      return pathname === "/staff/dashboard" || pathname === "/staff";
    }
    return pathname.startsWith(path);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];

      try {
        const res = await fetch("/api/search-similar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const result = await res.json();

        if (!Array.isArray(result)) {
          console.error("Expected array but got:", result);
          setSearchResults([]);
          setDropdownOpen(false);
          return;
        }

        setSearchResults(result);
        setDropdownOpen(true);
      } catch (err) {
        console.error("Image similarity search error:", err);
        setSearchResults([]);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];

        try {
          const res = await fetch("/api/search-similar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          });

          if (!res.ok) {
            const error = await res.json();
            console.error("API error:", error);
            setSearchResults([]);
            setDropdownOpen(false);
            return;
          }

          const json = await res.json();

          if (!Array.isArray(json)) {
            console.error("Expected array but got:", json);
            setSearchResults([]);
            setDropdownOpen(false);
            return;
          }

          setSearchResults(json);
          setDropdownOpen(true);
        } catch (error) {
          console.error("Image similarity search error:", error);
          setSearchResults([]);
          setDropdownOpen(false);
        }
      };

      reader.readAsDataURL(imageFile);
      return;
    }

    if (searchText.trim()) {
      try {
        const res = await fetch(
          `/api/search-products?query=${encodeURIComponent(searchText.trim())}`
        );

        if (!res.ok) {
          const error = await res.json();
          console.error("Product search API error:", error);
          setSearchResults([]);
          setDropdownOpen(false);
          return;
        }

        const json = await res.json();

        if (!Array.isArray(json)) {
          console.error("Expected array but got:", json);
          setSearchResults([]);
          setDropdownOpen(false);
          return;
        }

        setSearchResults(json);
        setDropdownOpen(true);
      } catch (error) {
        console.error("Keyword search error:", error);
        setSearchResults([]);
        setDropdownOpen(false);
      }
    }
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
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
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
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Dashboard"
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3 ${
                      isActivePath("/staff/dashboard")
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <Link href="/staff/dashboard">
                      <div
                        className={`p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:p-2 ${
                          isActivePath("/staff/dashboard")
                            ? "bg-white/20 group-hover:bg-white/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                        }`}
                      >
                        <Home className="h-4 w-4" />
                      </div>
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        Dashboard
                      </span>
                      {isActivePath("/staff/dashboard") && (
                        <div className="ml-auto w-2 h-2 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden"></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Posts"
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3 ${
                      isActivePath("/staff/posts")
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <Link href="/staff/posts">
                      <div
                        className={`p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:p-2 ${
                          isActivePath("/staff/posts")
                            ? "bg-white/20 group-hover:bg-white/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        Posts
                      </span>
                      {isActivePath("/staff/posts") && (
                        <div className="ml-auto w-2 h-2 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden"></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Blogs"
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3 ${
                      isActivePath("/staff/blogs")
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <Link href="/staff/blogs">
                      <div
                        className={`p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:p-2 ${
                          isActivePath("/staff/blogs")
                            ? "bg-white/20 group-hover:bg-white/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        Blogs
                      </span>
                      {isActivePath("/staff/blogs") && (
                        <div className="ml-auto w-2 h-2 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden"></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Products"
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3 ${
                      isActivePath("/staff/products")
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <Link href="/staff/products">
                      <div
                        className={`p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:p-2 ${
                          isActivePath("/staff/products")
                            ? "bg-white/20 group-hover:bg-white/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                        }`}
                      >
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        Products
                      </span>
                      {isActivePath("/staff/products") && (
                        <div className="ml-auto w-2 h-2 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden"></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Orders"
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3 ${
                      isActivePath("/staff/orders")
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <Link href="/staff/orders">
                      <div
                        className={`p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:p-2 ${
                          isActivePath("/staff/orders")
                            ? "bg-white/20 group-hover:bg-white/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                        }`}
                      >
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        Orders
                      </span>
                      {isActivePath("/staff/orders") && (
                        <div className="ml-auto w-2 h-2 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden"></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Customers"
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:py-3 ${
                      isActivePath("/staff/customers")
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-md"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <Link href="/staff/customers">
                      <div
                        className={`p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:p-2 ${
                          isActivePath("/staff/customers")
                            ? "bg-white/20 group-hover:bg-white/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                        }`}
                      >
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        Customers
                      </span>
                      {isActivePath("/staff/customers") && (
                        <div className="ml-auto w-2 h-2 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden"></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
        <SidebarInset>
          <header className="w-full bg-white dark:bg-gray-900 shadow-md border-b z-50 dark:border-gray-800">
            <div className="container mx-auto flex items-center justify-between p-4 flex-nowrap">
              <SidebarTrigger className="h-8 w-8 text-gray-500" />

              <form
                onSubmit={handleSearch}
                className="relative flex items-center gap-2"
                encType="multipart/form-data"
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                {/* Search Input */}
                <Input
                  type="text"
                  name="query"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for products..."
                  className="w-[300px] pl-10 dark:bg-gray-800 dark:border-gray-700"
                />

                {/* Result Dropdown */}
                <div className="absolute top-full mt-1 w-[300px] z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isDropdownOpen &&
                    searchResults.map((product: Product) => (
                      <Link
                        key={product.id}
                        href={`/staff/products/${product.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-200">
                          <Image
                            src={
                              product.image_url ||
                              product.product_images?.[0]?.image_url ||
                              "/placeholder.png"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            RM {product.price.toFixed(2)} /{" "}
                            {product.unit || "unit"}
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Upload Button */}
                <label htmlFor="image-upload-preview">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    title="Upload Image"
                    onClick={triggerFileInput}
                  >
                    🖼️
                  </Button>
                </label>

                {/* Uploaded Image Preview */}
                {imageFile && (
                  <div className="w-10 h-10 relative rounded overflow-hidden">
                    <Image
                      src={URL.createObjectURL(imageFile)}
                      alt="Uploaded"
                      fill
                      className="object-cover border rounded"
                    />
                  </div>
                )}

                {/* Theme Toggle */}
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

                {/* Avatar & Dropdown */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-9 w-9 cursor-pointer border-2 border-[#ff7a5c]">
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
              </form>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
