/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase/browserClient";
import Image from "next/image";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { toast } from "sonner";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Package,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  List,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Order } from "@/type/order";
import { TypographyH1 } from "@/components/ui/Typography";
import { StatsCards } from "@/components/StatsCards";
import {
  formatDate,
  getPaymentStatusConfig,
  getStatusBadgeConfig,
} from "@/lib/utils/format";
import HistoryBasedRecommendations from "@/components/HistoryBasedRecommendations";
import { OrdersChart } from "@/components/Customer/OrdersChart";

function OrderSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const user = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(3);

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setIsLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
          *,
          addresses (*),
          order_items (*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        toast.error("Failed to load orders");
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      setOrders(ordersData);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.order_items || []).some((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.payment_status === paymentFilter
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "highest":
          return b.total - a.total;
        case "lowest":
          return a.total - b.total;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy]);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user, loadOrders]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= thirtyDaysAgo;
  }).length;

  const totalOrdersFiltered = filteredOrders.length;
  const totalPages = Math.ceil(totalOrdersFiltered / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(currentPage - halfVisible, 1);
      const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (user === undefined || isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 flex flex-col gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-8 w-48" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 flex flex-col gap-8">
        <TypographyH1>YOUR ORDERS</TypographyH1>

        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCards
              icon={ShoppingBag}
              title="Total Orders"
              value={totalOrders.toString()}
            />
            <StatsCards
              icon={DollarSign}
              title="Total Spent"
              value={formatCurrency(totalSpent)}
            />
            <StatsCards
              icon={TrendingUp}
              title="Recent Orders"
              value={recentOrders.toString()}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Orders List
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Purchase Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search orders by ID or product name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div
                className="flex flex-wrap gap-2 sm:overflow-visible max-h-none
                overflow-y-auto max-h-[60vh] w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 w-full sm:w-auto h-9"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {showFilters ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Amount</SelectItem>
                    <SelectItem value="lowest">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showFilters && (
              <Card className="p-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  <CardDescription>Refine your order search.</CardDescription>
                </CardHeader>
              </Card>
            )}

            {orders.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 pt-2 border-t">
                <span className="font-medium">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalOrders)} of{" "}
                  {totalOrders} orders
                  {currentOrders.length !== totalOrders &&
                    ` (Page ${currentPage} of ${totalPages})`}
                </span>
                {searchQuery && <span>• Filtered by "{searchQuery}"</span>}
                {statusFilter !== "all" && (
                  <span>• Status: {statusFilter}</span>
                )}
                {paymentFilter !== "all" && (
                  <span>• Payment: {paymentFilter}</span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-8">
              {orders.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-16 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 text-gray-900">
                      No orders yet
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      You haven't placed any orders yet. Start shopping to see
                      your orders here and track their progress.
                    </p>
                    <Link href="/products">
                      <Button size="lg" className="px-8">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Start Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 text-gray-900">
                      No orders found
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      No orders match your current filters. Try adjusting your
                      search criteria or clear all filters.
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setPaymentFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-6">
                    {currentOrders.map((order) => (
                      <Card
                        key={order.id}
                        className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden"
                      >
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <CardTitle className="text-xl flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                  <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <span className="text-gray-900 dark:text-gray-100">
                                    Order #{order.id.slice(-8).toUpperCase()}
                                  </span>
                                  <p className="text-sm font-normal text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Placed on {formatDate(order.created_at)}
                                  </p>
                                </div>
                              </CardTitle>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const config = getStatusBadgeConfig(
                                  order.status
                                );
                                return (
                                  <Badge
                                    variant={config.variant}
                                    className={`mb-4 ${config.className}`}
                                  >
                                    {config.label}
                                  </Badge>
                                );
                              })()}

                              {(() => {
                                const config = getPaymentStatusConfig(
                                  order.payment_status
                                );
                                return (
                                  <Badge
                                    variant={config.variant}
                                    className={`mb-4 ${config.className}`}
                                  >
                                    {config.label}
                                  </Badge>
                                );
                              })()}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Total Amount
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {formatCurrency(order.total)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <Package className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Items
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {order.order_items?.length || 0}
                                </p>
                              </div>
                            </div>

                            {order.addresses && (
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                  <MapPin className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="max-w-[160px] truncate">
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Shipping To
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {order.addresses.city},{" "}
                                    {order.addresses.state}
                                  </p>
                                </div>
                              </div>
                            )}

                            {order.addresses?.phone && (
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                  <Phone className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Contact
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {order.addresses.phone}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                              href={`/profile/orders/${order.id}`}
                              className="flex-1"
                            >
                              <Button
                                variant="default"
                                className="w-full flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Full Details
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              onClick={() => toggleOrderDetails(order.id)}
                              className="flex items-center gap-2 sm:w-auto"
                            >
                              {expandedOrderId === order.id
                                ? "Hide Items"
                                : "Show Items"}
                              {expandedOrderId === order.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {expandedOrderId === order.id && (
                            <div className="mt-6 pt-6 border-t bg-gray-50 dark:bg-gray-900 -mx-6 px-6 pb-6">
                              <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <Package className="h-5 w-5" />
                                Order Items ({order.order_items?.length || 0})
                              </h4>

                              {order.order_items &&
                              order.order_items.length > 0 ? (
                                <div className="grid gap-4">
                                  {order.order_items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-sm transition-shadow"
                                    >
                                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                        {item.image_url ? (
                                          <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <Package className="h-6 w-6 text-gray-400" />
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                          {item.name}
                                        </h5>
                                        {item.grade && (
                                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            Grade: {item.grade}
                                          </p>
                                        )}
                                        {item.variant_type && (
                                          <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Variant: {item.variant_type}
                                          </p>
                                        )}
                                      </div>

                                      <div className="text-right">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                          {formatCurrency(item.price)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p>No items found for this order</p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                            Showing {startIndex + 1} to{" "}
                            {Math.min(endIndex, totalOrdersFiltered)} of{" "}
                            {totalOrdersFiltered} orders
                            <span className="block sm:inline sm:ml-2">
                              (Page {currentPage} of {totalPages})
                            </span>
                          </div>

                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                              className="flex items-center gap-1 px-2 sm:px-3"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span className="hidden sm:inline">Previous</span>
                            </Button>

                            <div className="flex items-center gap-1 sm:hidden">
                              {currentPage > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePageClick(1)}
                                  className="w-8 h-8 text-xs"
                                >
                                  1
                                </Button>
                              )}

                              {currentPage > 2 && (
                                <span className="text-gray-400 text-xs px-1">
                                  ...
                                </span>
                              )}

                              <Button
                                variant="default"
                                size="sm"
                                className="w-8 h-8 text-xs"
                              >
                                {currentPage}
                              </Button>

                              {currentPage < totalPages - 1 && (
                                <span className="text-gray-400 text-xs px-1">
                                  ...
                                </span>
                              )}

                              {currentPage < totalPages && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePageClick(totalPages)}
                                  className="w-8 h-8 text-xs"
                                >
                                  {totalPages}
                                </Button>
                              )}
                            </div>

                            <div className="hidden sm:flex items-center gap-1">
                              {getPageNumbers().map((page, index, array) => (
                                <React.Fragment key={page}>
                                  {index === 0 && page > 1 && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageClick(1)}
                                        className="w-10 h-10"
                                      >
                                        1
                                      </Button>
                                      {page > 2 && (
                                        <span className="px-2 text-gray-400 text-sm">
                                          ...
                                        </span>
                                      )}
                                    </>
                                  )}

                                  <Button
                                    variant={
                                      currentPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handlePageClick(page)}
                                    className="w-10 h-10"
                                  >
                                    {page}
                                  </Button>

                                  {index === array.length - 1 &&
                                    page < totalPages && (
                                      <>
                                        {page < totalPages - 1 && (
                                          <span className="px-2 text-gray-400 text-sm">
                                            ...
                                          </span>
                                        )}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handlePageClick(totalPages)
                                          }
                                          className="w-10 h-10"
                                        >
                                          {totalPages}
                                        </Button>
                                      </>
                                    )}
                                </React.Fragment>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                              className="flex items-center gap-1 px-2 sm:px-3"
                            >
                              <span className="hidden sm:inline">Next</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          {totalPages > 5 && (
                            <div className="flex items-center justify-center gap-2 sm:hidden">
                              <span className="text-xs text-gray-500">
                                Jump to:
                              </span>

                              <Select
                                value={String(currentPage)}
                                onValueChange={(value) =>
                                  handlePageClick(Number(value))
                                }
                              >
                                <SelectTrigger className="h-7 w-[100px] text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                  <SelectValue placeholder="Select page" />
                                </SelectTrigger>

                                <SelectContent>
                                  {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                  ).map((page) => (
                                    <SelectItem key={page} value={String(page)}>
                                      Page {page}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {orders.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900">
                    No analytics yet
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start placing orders to see your purchase analytics and
                    trends.
                  </p>
                  <Link href="/products">
                    <Button size="lg" className="px-8">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Start Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <OrdersChart orders={orders} />
            )}
          </TabsContent>
        </Tabs>

        {orders.length > 0 && (
          <div className="mt-16">
            <HistoryBasedRecommendations userOrders={orders} />
          </div>
        )}

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/profile">
            <Button size="lg" className="w-full sm:w-auto px-8">
              <User className="mr-2 h-5 w-5" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
