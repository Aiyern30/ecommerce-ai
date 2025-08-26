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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Order } from "@/type/order";
import { TypographyH1 } from "@/components/ui/Typography";
import { StatsCards } from "@/components/StatsCards";
import { formatDate, getPaymentStatusColor } from "@/lib/utils/format";

// Loading skeleton component
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

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setIsLoading(true);

      // Enhanced query similar to staff page - fetch orders with addresses and order_items
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

  // Filter and sort orders
  useEffect(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.order_items || []).some((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.payment_status === paymentFilter
      );
    }

    // Apply sorting
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
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy]);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user, loadOrders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Calculate stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= thirtyDaysAgo;
  }).length;

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
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            {searchQuery && <span>• Filtered by "{searchQuery}"</span>}
            {statusFilter !== "all" && <span>• Status: {statusFilter}</span>}
            {paymentFilter !== "all" && <span>• Payment: {paymentFilter}</span>}
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
                  You haven't placed any orders yet. Start shopping to see your
                  orders here and track their progress.
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
            <div className="space-y-6">
              {filteredOrders.map((order) => (
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
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            order.status
                          )} transition-colors`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${getPaymentStatusColor(
                            order.payment_status
                          )} transition-colors`}
                        >
                          {order.payment_status.charAt(0).toUpperCase() +
                            order.payment_status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      {/* Total Amount */}
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

                      {/* Items Count */}
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

                      {/* Shipping Address */}
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
                              {order.addresses.city}, {order.addresses.state}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Contact */}
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

                    {/* Action Buttons */}
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

                    {/* Expanded Order Items */}
                    {expandedOrderId === order.id && (
                      <div className="mt-6 pt-6 border-t bg-gray-50 dark:bg-gray-900 -mx-6 px-6 pb-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Package className="h-5 w-5" />
                          Order Items ({order.order_items?.length || 0})
                        </h4>

                        {order.order_items && order.order_items.length > 0 ? (
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
    </div>
  );
}
