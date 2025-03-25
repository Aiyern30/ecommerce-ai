"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Edit, Eye } from "lucide-react";
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

const orders = [
  {
    id: "#12345922",
    products: [
      { image: "/placeholder.svg", name: "Product 1" },
      { image: "/placeholder.svg", name: "Product 2" },
    ],
    itemCount: 8,
    date: "Jan 12, 2023",
    dateObj: new Date(2023, 0, 12),
    customer: "Ronald Jones",
    revenue: "$329.20",
    revenueValue: 329.2,
    netProfit: "$95.78",
    netProfitValue: 95.78,
    status: "Pending",
  },
  {
    id: "#12345001",
    products: [
      { image: "/placeholder.svg", name: "Product 3" },
      { image: "/placeholder.svg", name: "Product 4" },
    ],
    itemCount: 6,
    date: "Nov 4, 2023",
    dateObj: new Date(2023, 10, 4),
    customer: "Jacob McKinney",
    revenue: "$158.23",
    revenueValue: 158.23,
    netProfit: "$68.41",
    netProfitValue: 68.41,
    status: "Shipping",
  },
  {
    id: "#12345004",
    products: [{ image: "/placeholder.svg", name: "Product 5" }],
    itemCount: 3,
    date: "Aug 30, 2023",
    dateObj: new Date(2023, 7, 30),
    customer: "Samuel Murphy",
    revenue: "$175.25",
    revenueValue: 175.25,
    netProfit: "$35.05",
    netProfitValue: 35.05,
    status: "On Hold",
  },
  {
    id: "#12345005",
    products: [
      { image: "/placeholder.svg", name: "Product 6" },
      { image: "/placeholder.svg", name: "Product 7" },
    ],
    itemCount: 5,
    date: "Aug 08, 2023",
    dateObj: new Date(2023, 7, 8),
    customer: "Philip Wells",
    revenue: "$423.01",
    revenueValue: 423.01,
    netProfit: "$83.80",
    netProfitValue: 83.8,
    status: "Completed",
  },
  {
    id: "#12345008",
    products: [
      { image: "/placeholder.svg", name: "Product 8" },
      { image: "/placeholder.svg", name: "Product 9" },
    ],
    itemCount: 4,
    date: "Oct 28, 2023",
    dateObj: new Date(2023, 9, 28),
    customer: "Annie Bell",
    revenue: "$329.71",
    revenueValue: 329.71,
    netProfit: "$64.52",
    netProfitValue: 64.52,
    status: "Shipping",
  },
  {
    id: "#12345007",
    products: [
      { image: "/placeholder.svg", name: "Product 10" },
      { image: "/placeholder.svg", name: "Product 11" },
    ],
    itemCount: 6,
    date: "Apr 27, 2023",
    dateObj: new Date(2023, 3, 27),
    customer: "Gregory Nguyen",
    revenue: "$597.95",
    revenueValue: 597.95,
    netProfit: "$91.04",
    netProfitValue: 91.04,
    status: "Completed",
  },
  {
    id: "#12345003",
    products: [{ image: "/placeholder.svg", name: "Product 12" }],
    itemCount: 2,
    date: "May 3, 2023",
    dateObj: new Date(2023, 4, 3),
    customer: "Deborah Harris",
    revenue: "$125.43",
    revenueValue: 125.43,
    netProfit: "$17.05",
    netProfitValue: 17.05,
    status: "Pending",
  },
  {
    id: "#12345009",
    products: [
      { image: "/placeholder.svg", name: "Product 13" },
      { image: "/placeholder.svg", name: "Product 14" },
    ],
    itemCount: 5,
    date: "Oct 18, 2023",
    dateObj: new Date(2023, 9, 18),
    customer: "Jenny Hendrix",
    revenue: "$483.98",
    revenueValue: 483.98,
    netProfit: "$43.78",
    netProfitValue: 43.78,
    status: "On Hold",
  },
  {
    id: "#12345010",
    products: [{ image: "/placeholder.svg", name: "Product 15" }],
    itemCount: 3,
    date: "Jul 12, 2023",
    dateObj: new Date(2023, 6, 12),
    customer: "Diana Cooper",
    revenue: "$352.21",
    revenueValue: 352.21,
    netProfit: "$65.12",
    netProfitValue: 65.12,
    status: "Completed",
  },
  {
    id: "#12345011",
    products: [
      { image: "/placeholder.svg", name: "Product 16" },
      { image: "/placeholder.svg", name: "Product 17" },
    ],
    itemCount: 2,
    date: "Jun 28, 2023",
    dateObj: new Date(2023, 5, 28),
    customer: "Max Williamson",
    revenue: "$418.04",
    revenueValue: 418.04,
    netProfit: "$49.46",
    netProfitValue: 49.46,
    status: "Completed",
  },
];

export function OrdersTable() {
  const { filters, isFiltersApplied } = useOrdersFilter();

  const filteredOrders = useMemo(() => {
    if (!isFiltersApplied) return orders;

    return orders.filter((order) => {
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
              <TableHead className="hidden lg:table-cell">Net Profit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
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
  );
}
