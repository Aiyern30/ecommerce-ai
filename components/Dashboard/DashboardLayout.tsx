"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Home,
  Inbox,
  Layers,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Sun,
  Tag,
  Users,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
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

  const [searchText, setSearchText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        <Sidebar className="border-r bg-[#1a2352]">
          <SidebarHeader className="flex h-[69px] justify-center items-center border-b border-gray-700 px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-white"
            >
              <ShoppingBag className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold ">ShopYTL</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-2">
            <SidebarMenu className="grid items-start px-4 text-sm font-medium">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg bg-blue-800 px-3 py-2 text-white transition-all"
                >
                  <Link href="/staff/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="/staff/posts">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Posts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="/staff/orders">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="/staff/products">
                    <Package className="h-4 w-4" />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="/staff/categories">
                    <Layers className="h-4 w-4" />
                    <span>Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="/staff/customers">
                    <Users className="h-4 w-4" />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="/staff/reports">
                    <BarChart3 className="h-4 w-4" />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="#">
                    <Star className="h-4 w-4" />
                    <span>Coupons</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="#">
                    <Inbox className="h-4 w-4" />
                    <span>Inbox</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="mt-6">
              <h3 className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase">
                Other Information
              </h3>
              <SidebarMenu className="grid items-start px-4 text-sm font-medium">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                  >
                    <Link href="#">
                      <Tag className="h-4 w-4" />
                      <span>Knowledge Base</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                  >
                    <Link href="#">
                      <Tag className="h-4 w-4" />
                      <span>Product Updates</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase">
                Settings
              </h3>
              <SidebarMenu className="grid items-start px-4 text-sm font-medium">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                  >
                    <Link href="#">
                      <Users className="h-4 w-4" />
                      <span>Personal Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                  >
                    <Link href="#">
                      <Settings className="h-4 w-4" />
                      <span>Global Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>
          <SidebarFooter className="mt-auto p-4">
            <Card className="bg-blue-600 text-white border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Grow Business</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-100">
                  Explore our marketing solutions
                </p>
                <Button
                  size="sm"
                  className="mt-4 w-full bg-white text-blue-600 hover:bg-blue-50"
                >
                  Read More
                </Button>
              </CardContent>
            </Card>
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
