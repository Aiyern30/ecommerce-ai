"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Trash2,
  Package,
  Calendar,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
  Badge,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { formatDate } from "@/lib/utils/format";
import { useDeviceType } from "@/utils/useDeviceTypes";
import { Order } from "@/type/order";

interface OrderFilters {
  search: string;
  sortBy:
    | "date-new"
    | "date-old"
    | "amount-high"
    | "amount-low"
    | "order-number";
  status:
    | "all"
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "all" | "pending" | "paid" | "failed" | "refunded";
  dateRange: "all" | "today" | "week" | "month" | "year";
}

function EmptyOrdersState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No orders found</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        Orders will appear here once customers start placing them through your
        store.
      </TypographyP>
      <Link href="/staff/products">
        <Button className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Manage Products
        </Button>
      </Link>
    </div>
  );
}

function NoOrderResultsState({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No matching orders</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        No orders match your current search criteria. Try adjusting your filters
        or search terms.
      </TypographyP>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}

// Enhanced Order Table Skeleton
function OrderTableSkeletonEnhanced() {
  return (
    <div className="w-full border rounded-md bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-4 rounded-sm" />
              </TableHead>
              <TableHead className="min-w-[120px]">Order #</TableHead>
              <TableHead className="min-w-[150px]">Customer</TableHead>
              <TableHead className="min-w-[100px]">Items</TableHead>
              <TableHead className="min-w-[120px]">Total Amount</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Payment</TableHead>
              <TableHead className="min-w-[120px]">Shipping</TableHead>
              <TableHead className="min-w-[150px]">Created</TableHead>
              <TableHead className="text-right min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    sortBy: "date-new",
    status: "all",
    paymentStatus: "all",
    dateRange: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ordersToDelete, setOrdersToDelete] = useState<Order[]>([]);
  const { isMobile } = useDeviceType();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const itemsPerPage = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*),
        addresses (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error.message);
      toast.error("Failed to fetch orders");
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateFilter = (key: keyof OrderFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      sortBy: "date-new",
      status: "all",
      paymentStatus: "all",
      dateRange: "all",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAllOrders = () => {
    if (
      selectedOrders.length === currentPageData.length &&
      currentPageData.length > 0
    ) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentPageData.map((order) => order.id));
    }
  };

  const clearOrderSelection = () => {
    setSelectedOrders([]);
  };

  const openDeleteDialog = () => {
    const ordersToConfirm = orders.filter((o) => selectedOrders.includes(o.id));
    setOrdersToDelete(ordersToConfirm);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteOrders = async () => {
    if (selectedOrders.length === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .in("id", selectedOrders);

      if (error) {
        console.error("Error deleting orders:", error.message);
        toast.error(`Error deleting orders: ${error.message}`);
      } else {
        toast.success(
          `Successfully deleted ${selectedOrders.length} order(s)!`
        );
        clearOrderSelection();
        fetchOrders();
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getDateRangeFilter = (dateRange: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case "today":
        return (date: string) => new Date(date) >= today;
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return (date: string) => new Date(date) >= weekAgo;
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return (date: string) => new Date(date) >= monthAgo;
      case "year":
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        return (date: string) => new Date(date) >= yearAgo;
      default:
        return () => true;
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Filter by search term (order ID, customer name, or phone)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesOrderId = order.id.toLowerCase().includes(searchTerm);
      const matchesCustomer = order.addresses?.full_name
        ?.toLowerCase()
        .includes(searchTerm);
      const matchesPhone = order.addresses?.phone?.includes(searchTerm);

      if (!matchesOrderId && !matchesCustomer && !matchesPhone) {
        return false;
      }
    }

    // Filter by status
    if (filters.status !== "all" && order.status !== filters.status) {
      return false;
    }

    // Filter by payment status
    if (
      filters.paymentStatus !== "all" &&
      order.payment_status !== filters.paymentStatus
    ) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const dateFilter = getDateRangeFilter(filters.dateRange);
      if (!dateFilter(order.created_at)) {
        return false;
      }
    }

    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (filters.sortBy) {
      case "order-number":
        return a.id.localeCompare(b.id);
      case "amount-high":
        return b.total - a.total;
      case "amount-low":
        return a.total - b.total;
      case "date-new":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "date-old":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentPageData = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        variant: "secondary" as const,
        className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      },
      processing: {
        variant: "secondary" as const,
        className: "bg-blue-500 hover:bg-blue-600 text-white",
      },
      shipped: {
        variant: "default" as const,
        className: "bg-purple-500 hover:bg-purple-600 text-white",
      },
      delivered: {
        variant: "default" as const,
        className: "bg-green-500 hover:bg-green-600 text-white",
      },
      cancelled: {
        variant: "destructive" as const,
        className: "bg-red-500 hover:bg-red-600 text-white",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      pending: {
        variant: "secondary" as const,
        className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      },
      paid: {
        variant: "default" as const,
        className: "bg-green-500 hover:bg-green-600 text-white",
      },
      failed: {
        variant: "destructive" as const,
        className: "bg-red-500 hover:bg-red-600 text-white",
      },
      refunded: {
        variant: "secondary" as const,
        className: "bg-gray-500 hover:bg-gray-600 text-white",
      },
    };

    const config =
      statusConfig[paymentStatus as keyof typeof statusConfig] ||
      statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">Orders</TypographyH2>
        <div className="flex items-center gap-2">
          <Link href="/staff/orders/export">
            <Button variant="outline" size="sm">
              Export Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Controls */}
      {isMobile ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 w-full h-9"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-4">
                <Input
                  type="search"
                  placeholder="Search by order ID, customer name, or phone..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    updateFilter("status", value as OrderFilters["status"])
                  }
                >
                  <SelectTrigger>
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
                <Select
                  value={filters.paymentStatus}
                  onValueChange={(value) =>
                    updateFilter(
                      "paymentStatus",
                      value as OrderFilters["paymentStatus"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    updateFilter("sortBy", value as OrderFilters["sortBy"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-new">Newest First</SelectItem>
                    <SelectItem value="date-old">Oldest First</SelectItem>
                    <SelectItem value="amount-high">Highest Amount</SelectItem>
                    <SelectItem value="amount-low">Lowest Amount</SelectItem>
                    <SelectItem value="order-number">Order Number</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) =>
                    updateFilter(
                      "dateRange",
                      value as OrderFilters["dateRange"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearAllFilters();
                      setMobileFilterOpen(false);
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <DrawerClose asChild>
                    <Button size="sm" className="flex-1">
                      Apply
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by order ID, customer name, or phone..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 w-full sm:w-auto bg-transparent h-9"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filter
              {showFilters ? (
                <ChevronLeft className="ml-1 h-4 w-4" />
              ) : (
                <ChevronRight className="ml-1 h-4 w-4" />
              )}
            </Button>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                updateFilter("status", value as OrderFilters["status"])
              }
            >
              <SelectTrigger className="w-full sm:w-[140px] h-9">
                <SelectValue placeholder="Status" />
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
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) =>
                updateFilter(
                  "paymentStatus",
                  value as OrderFilters["paymentStatus"]
                )
              }
            >
              <SelectTrigger className="w-full sm:w-[160px] h-9">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                updateFilter("sortBy", value as OrderFilters["sortBy"])
              }
            >
              <SelectTrigger className="w-full sm:w-[160px] h-9">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-new">Newest First</SelectItem>
                <SelectItem value="date-old">Oldest First</SelectItem>
                <SelectItem value="amount-high">Highest Amount</SelectItem>
                <SelectItem value="amount-low">Lowest Amount</SelectItem>
                <SelectItem value="order-number">Order Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {showFilters && (
        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>Refine your order search.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  updateFilter("dateRange", value as OrderFilters["dateRange"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <>
              <span className="text-sm text-gray-500">
                {selectedOrders.length} selected
              </span>
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={openDeleteDialog}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedOrders.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the following{" "}
                      {ordersToDelete.length} order(s)? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {ordersToDelete.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center gap-3 p-2 border rounded-md"
                      >
                        <Package className="w-8 h-8 text-gray-400" />
                        <div>
                          <span className="font-medium">
                            #{order.id.slice(-8)}
                          </span>
                          <div className="text-sm text-gray-500">
                            {order.addresses?.full_name} -{" "}
                            {formatCurrency(order.total)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteOrders}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={clearOrderSelection}>
                Clear Selection
              </Button>
            </>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {sortedOrders.length} Results
        </div>
      </div>

      {loading ? (
        <OrderTableSkeletonEnhanced />
      ) : orders.length === 0 ? (
        <EmptyOrdersState />
      ) : sortedOrders.length === 0 ? (
        <NoOrderResultsState onClearFilters={clearAllFilters} />
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedOrders.length === currentPageData.length &&
                      currentPageData.length > 0
                    }
                    onCheckedChange={toggleSelectAllOrders}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[120px]">Order ID</TableHead>
                <TableHead className="min-w-[150px]">Customer</TableHead>
                <TableHead className="min-w-[100px]">Items</TableHead>
                <TableHead className="min-w-[120px]">Total Amount</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Payment</TableHead>
                <TableHead className="min-w-[120px]">Shipping</TableHead>
                <TableHead className="min-w-[150px]">Created</TableHead>
                <TableHead className="text-right min-w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => router.push(`/staff/orders/${order.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                        aria-label={`Select order ${order.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[120px]" title={order.id}>
                        #{order.id.slice(-8)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        <div
                          className="font-medium truncate"
                          title={order.addresses?.full_name}
                        >
                          {order.addresses?.full_name || "N/A"}
                        </div>
                        <div
                          className="text-sm text-gray-500 truncate"
                          title={order.addresses?.phone || ""}
                        >
                          {order.addresses?.phone || "No phone"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {order.order_items?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        {formatCurrency(order.total)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.payment_status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">Standard Shipping</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(order.created_at)}
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          router.push(`/staff/orders/${order.id}/edit`)
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
