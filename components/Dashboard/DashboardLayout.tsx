"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  Home,
  Inbox,
  Layers,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/";
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
  SidebarTrigger,
} from "@/components/ui/";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
          <header className="flex h-14 items-center gap-4 border-b bg-gray-50 px-6">
            <SidebarTrigger className="h-8 w-8 text-gray-500" />
            <div className="w-full flex-1 flex items-center">
              <div className="relative w-full md:w-2/3 lg:w-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-white pl-8 shadow-none border-gray-200"
                />
              </div>
              <div className="ml-auto flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Inbox className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600"></span>
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                    R
                  </div>
                  <span>Randhir kumar</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </Button>
              </div>
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
