"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Plus, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  useOrdersFilter,
  OrdersFilterProvider,
} from "@/components/Staff/Orders/OrdersFilterContext";
import { OrdersTableFilters } from "@/components/Staff/Orders/OrdersTableFilter";
import { OrdersTablePaginated } from "@/components/Staff/Orders/OrdersPagination";
import { ExportDialog } from "@/components/Staff/Orders/ExportDialog";
import Link from "next/link";
import { generateOrders } from "@/components/Staff/Orders/OrderData";

function AllOrdersContent() {
  const allOrders = generateOrders(100);

  const [showFilters, setShowFilters] = useState(false);
  const { filters, updateFilter, applyFilters, isFiltersApplied } =
    useOrdersFilter();
  const [currentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredOrders = allOrders.filter((order) => {
    if (!isFiltersApplied) return true;

    // Filter by Order ID
    if (
      filters.orderId &&
      !order.id.toLowerCase().includes(filters.orderId.toLowerCase())
    ) {
      return false;
    }

    // Filter by Customer
    if (
      filters.customer &&
      !order.customer.toLowerCase().includes(filters.customer.toLowerCase())
    ) {
      return false;
    }

    // Filter by Status
    if (filters.status !== "all" && order.status !== filters.status) {
      return false;
    }

    // Filter by Revenue Range
    if (
      filters.minRevenue &&
      order.revenueValue < Number.parseFloat(filters.minRevenue)
    ) {
      return false;
    }
    if (
      filters.maxRevenue &&
      order.revenueValue > Number.parseFloat(filters.maxRevenue)
    ) {
      return false;
    }

    // Filter by Date Range
    if (filters.startDate && order.dateObj < filters.startDate) {
      return false;
    }
    if (filters.endDate) {
      const endDateWithTime = new Date(filters.endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (order.dateObj > endDateWithTime) {
        return false;
      }
    }

    return true;
  });
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!isFiltersApplied) return 0;

    switch (filters.sortBy) {
      case "newest":
        return b.dateObj.getTime() - a.dateObj.getTime();
      case "oldest":
        return a.dateObj.getTime() - b.dateObj.getTime();
      case "revenue-high":
        return b.revenueValue - a.revenueValue;
      case "revenue-low":
        return a.revenueValue - b.revenueValue;
      default:
        return 0;
    }
  });

  // Get current page data
  const currentPageData = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/Staff/Dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/Staff/Orders">Orders</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>All Orders</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">All Orders</h1>
          <div className="flex items-center gap-2">
            <ExportDialog
              currentPageData={currentPageData}
              allFilteredData={sortedOrders}
              isFiltered={isFiltersApplied}
            />
            <Link href="/Staff/Orders/New">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={filters.orderId}
              onChange={(e) => updateFilter("orderId", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 w-full sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? (
                <ChevronLeft className="ml-1 h-4 w-4" />
              ) : (
                <ChevronRight className="ml-1 h-4 w-4" />
              )}
            </Button>
            <Select
              value={filters.status}
              onValueChange={(value) => {
                updateFilter("status", value);
                applyFilters();
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Shipping">Shipping</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => {
                updateFilter("sortBy", value);
                applyFilters();
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="revenue-high">Highest Revenue</SelectItem>
                <SelectItem value="revenue-low">Lowest Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && <OrdersTableFilters />}

        <div className="w-full">
          <OrdersTablePaginated />
        </div>
      </div>
    </div>
  );
}

export default function AllOrdersPage() {
  return (
    <OrdersFilterProvider>
      <AllOrdersContent />
    </OrdersFilterProvider>
  );
}
