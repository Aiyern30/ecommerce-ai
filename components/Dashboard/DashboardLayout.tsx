"use client";

import { useState, type ReactNode } from "react";
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
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalQuery = searchText;

    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      try {
        const res = await fetch("/api/search-by-image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data?.labels?.length > 0) {
          finalQuery += " " + data.labels.join(" ");
        }
      } catch (error) {
        console.error("Image search error:", error);
      }
    }

    try {
      const res = await fetch(
        `/api/search-products?query=${encodeURIComponent(finalQuery.trim())}`
      );
      const products = await res.json();
      setSearchResults(products);
      setDropdownOpen(true);
    } catch (error) {
      console.error("Product search failed:", error);
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
                  <Link href="/Staff/Dashboard">
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
                  <Link href="/Staff/Orders">
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
                  <Link href="/Staff/Products">
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
                  <Link href="/Staff/Categories">
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
                  <Link href="/Staff/Customers">
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
                  <Link href="/Staff/Reports">
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
                <Input
                  type="text"
                  name="query"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for products..."
                  className="w-[300px] pl-10 dark:bg-gray-800 dark:border-gray-700"
                />
                <div className="absolute top-full mt-1 w-[300px] z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isDropdownOpen &&
                    searchResults.map((product: Product) => (
                      <Link
                        key={product.id}
                        href={`/staff/products/${product.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {product.name}
                      </Link>
                    ))}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />

                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    title="Upload Image"
                  >
                    🖼️
                  </Button>
                </label>
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
