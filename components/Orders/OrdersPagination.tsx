"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Edit, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
} from "@/components/ui/";
import { isAfter, isBefore } from "date-fns";
import { useOrdersFilter } from "./OrdersFilterContext";

// Generate more sample data for pagination
const generateOrders = (count: number) => {
  const statuses = ["Pending", "Shipping", "Completed", "On Hold"];
  const customers = [
    "Ronald Jones",
    "Jacob McKinney",
    "Samuel Murphy",
    "Philip Wells",
    "Annie Bell",
    "Gregory Nguyen",
    "Deborah Harris",
    "Jenny Hendrix",
    "Diana Cooper",
    "Max Williamson",
    "Sarah Johnson",
    "Michael Smith",
    "Emily Davis",
    "Robert Wilson",
    "Jennifer Brown",
    "William Taylor",
    "Elizabeth Anderson",
    "David Thomas",
    "Jessica Jackson",
    "James White",
  ];

  const orders = [];

  for (let i = 1; i <= count; i++) {
    const id = `#${(Math.floor(Math.random() * 90000) + 10000).toString()}`;
    const productCount = Math.floor(Math.random() * 3) + 1;
    const products = Array.from({ length: productCount }, (_, index) => ({
      image: "/placeholder.svg",
      name: `Product ${i}-${index + 1}`,
    }));

    const itemCount = Math.floor(Math.random() * 8) + 1;

    // Random date in 2023
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    const dateObj = new Date(2023, month, day);
    const date = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const customer = customers[Math.floor(Math.random() * customers.length)];
    const revenueValue = Math.floor(Math.random() * 900) + 100 + Math.random();
    const revenue = `$${revenueValue.toFixed(2)}`;
    const netProfitValue = revenueValue * (Math.random() * 0.3 + 0.1);
    const netProfit = `$${netProfitValue.toFixed(2)}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    orders.push({
      id,
      products,
      itemCount,
      date,
      dateObj,
      customer,
      revenue,
      revenueValue,
      netProfit,
      netProfitValue,
      status,
    });
  }

  return orders;
};

const allOrders = generateOrders(100);

export function OrdersTablePaginated() {
  const { filters, isFiltersApplied } = useOrdersFilter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = useMemo(() => {
    if (!isFiltersApplied) return allOrders;

    return allOrders.filter((order) => {
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
      if (filters.startDate && isBefore(order.dateObj, filters.startDate)) {
        return false;
      }
      if (filters.endDate && isAfter(order.dateObj, filters.endDate)) {
        return false;
      }

      return true;
    });
  }, [filters, isFiltersApplied]);

  const sortedOrders = useMemo(() => {
    if (!isFiltersApplied) return filteredOrders;

    return [...filteredOrders].sort((a, b) => {
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
  }, [filteredOrders, filters.sortBy, isFiltersApplied]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Shipping":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "On Hold":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-hidden border rounded-md">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Net Profit
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {order.products.map((product, index) => (
                            <div
                              key={index}
                              className="h-8 w-8 rounded-md border border-white bg-gray-100 overflow-hidden"
                            >
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {order.itemCount} items
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {order.date}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.customer}
                    </TableCell>
                    <TableCell>{order.revenue}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {order.netProfit}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing{" "}
          {paginatedOrders.length > 0
            ? (currentPage - 1) * itemsPerPage + 1
            : 0}{" "}
          to {Math.min(currentPage * itemsPerPage, sortedOrders.length)} of{" "}
          {sortedOrders.length} orders
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 mx-0.5"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-1">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 mx-0.5"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
