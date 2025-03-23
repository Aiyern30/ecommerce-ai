"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronDown,
  Home,
  Inbox,
  Layers,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/";
import { Input } from "@/components/ui/";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Badge } from "@/components/ui/";
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
import { usePathname } from "next/navigation";
interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();
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
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r bg-[#1a2352]">
          <SidebarHeader className="flex h-14 items-center border-b border-gray-700 px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-white"
            >
              <ShoppingBag className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold">fastcart</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-2">
            <SidebarMenu className="grid items-start px-4 text-sm font-medium">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg bg-blue-800 px-3 py-2 text-white transition-all"
                >
                  <Link href="#">
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
                  <Link href="#">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
                <Badge className="absolute right-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  16
                </Badge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Link href="#">
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
                  <Link href="#">
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
                  <Link href="#">
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
                  <Link href="#">
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
          <div>
            <header className="w-full bg-white dark:bg-gray-900 shadow-md border-b z-50 dark:border-gray-800">
              <div className="container mx-auto flex items-center justify-between p-4 flex-nowrap">
                <div className="flex items-center gap-8">
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
                <nav className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg border-b lg:hidden dark:border-gray-800">
                  <div className="container mx-auto p-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search for products..."
                        className="w-full pl-10 dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>

                    <ul className="flex flex-col gap-4">
                      {[...primaryNavItems, ...secondaryNavItems].map(
                        ({ name, path }) => (
                          <li key={path}>
                            <Link
                              href={path}
                              className={`block w-full hover:font-semibold dark:text-gray-300 ${
                                isActive(path)
                                  ? "text-black dark:text-white font-semibold"
                                  : ""
                              }`}
                              onClick={() => setMenuOpen(false)}
                            >
                              {name}
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </nav>
              )}
            </header>
          </div>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
