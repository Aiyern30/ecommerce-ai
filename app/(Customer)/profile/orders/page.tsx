"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";
import Image from "next/image";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { toast } from "sonner";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Search,
  Package,
  Eye,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";

interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_type?: string;
  image_url?: string;
}

interface Order {
  id: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
  shipping_address: ShippingAddress;
  payment_intent_id?: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const user = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available:", user);
      return;
    }

    console.log("=== LOADING ORDERS DEBUG ===");
    console.log("User ID:", user.id);

    try {
      // Use a simpler approach - fetch orders and order_items separately
      console.log("Fetching orders only (no JOIN)...");
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      console.log("Orders query result:", { ordersData, ordersError });

      if (ordersError) {
        console.error("Error loading orders:", ordersError);
        toast.error("Failed to load orders");
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        console.log("No orders found for user");
        setOrders([]);
        return;
      }

      console.log(
        `Found ${ordersData.length} orders, now fetching order items...`
      );

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);

          if (itemsError) {
            console.error(
              `Error fetching items for order ${order.id}:`,
              itemsError
            );
            return { ...order, order_items: [] };
          }

          console.log(`Order ${order.id} has ${orderItems?.length || 0} items`);
          return { ...order, order_items: orderItems || [] };
        })
      );

      console.log("=== SUCCESS - ORDERS LOADED ===");
      console.log("Final orders with items:", ordersWithItems);

      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error in loadOrders:", error);
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
          order.order_items.some((item) =>
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
      console.log("User authenticated, loading orders for:", user.id);
      loadOrders();
    }
  }, [user, loadOrders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (user === undefined || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with Search and Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Your Orders</h1>
          </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by order ID or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
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

              {/* Payment Filter */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-48">
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

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
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

            {/* Results Summary */}
            {orders.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
                {searchQuery && (
                  <span>• Filtered by &quot;{searchQuery}&quot;</span>
                )}
                {statusFilter !== "all" && (
                  <span>• Status: {statusFilter}</span>
                )}
                {paymentFilter !== "all" && (
                  <span>• Payment: {paymentFilter}</span>
                )}
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          {orders.length > 0 &&
            searchQuery === "" &&
            statusFilter === "all" &&
            paymentFilter === "all" && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {filteredOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">
                              Order #{order.id.slice(-8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(order.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                order.payment_status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            {formatCurrency(order.total)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/profile/orders/${order.id}`)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredOrders.length > 3 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Showing 3 of {filteredOrders.length} orders
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t placed any orders yet. Start shopping to see
                  your orders here.
                </p>
                <Link href="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No orders found</h2>
                <p className="text-gray-600 mb-6">
                  No orders match your current filters. Try adjusting your
                  search criteria.
                </p>
                <Button
                  variant="outline"
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
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-gray-500" />
                          Order #{order.id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={getStatusColor(order.status)}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getPaymentStatusColor(
                            order.payment_status
                          )}
                        >
                          {order.payment_status.charAt(0).toUpperCase() +
                            order.payment_status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">Total:</span>{" "}
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Items:</span>{" "}
                          {order.order_items.length}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/profile/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleOrderDetails(order.id)}
                          className="flex items-center gap-2"
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
                    </div>

                    {expandedOrderId === order.id && (
                      <div className="border-t pt-4 space-y-4">
                        {/* Order Items Preview */}
                        <div>
                          <h4 className="font-medium mb-3">Order Items</h4>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {order.order_items.slice(0, 6).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                  {item.image_url ? (
                                    <Image
                                      src={item.image_url}
                                      alt={item.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Package className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm truncate">
                                    {item.name}
                                  </h5>
                                  <p className="text-xs text-gray-600">
                                    Qty: {item.quantity} •{" "}
                                    {formatCurrency(item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.order_items.length > 6 && (
                              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                +{order.order_items.length - 6} more items
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="w-full sm:w-auto">Back to Profile</Button>
            </Link>
        </div>
      </div>
    </div>
  );
}