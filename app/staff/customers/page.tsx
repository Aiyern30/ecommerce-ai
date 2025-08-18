/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Trash2,
  Users,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User as SupabaseUser } from "@supabase/supabase-js";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { formatDate } from "@/lib/utils/format";
import { useDeviceType } from "@/utils/useDeviceTypes";

// Types
interface Customer {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  status: "active" | "inactive" | "banned";
  role: "customer" | "admin" | "staff";
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

interface CustomerFilters {
  search: string;
  sortBy:
    | "date-new"
    | "date-old"
    | "name-asc"
    | "name-desc"
    | "email-asc"
    | "email-desc";
  status: "all" | "active" | "inactive" | "banned";
  role: "all" | "customer" | "admin" | "staff";
}

// Empty State Component
function EmptyCustomersState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Users className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No customers found</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        Your customer base will appear here once users start signing up.
      </TypographyP>
    </div>
  );
}

// No Results State Component
function NoCustomerResultsState({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No matching customers</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        No customers match your current search criteria. Try adjusting your
        filters or search terms.
      </TypographyP>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}

// Grid Skeleton Component
function CustomerGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-4 rounded-sm" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Customer Card Component
function CustomerCard({
  customer,
  isSelected,
  onSelect,
  onViewDetails,
}: {
  customer: Customer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "inactive":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "banned":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "staff":
        return <User className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <Card
      className="p-6 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={() => onViewDetails(customer.id)}
    >
      <div
        className="absolute top-4 right-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(customer.id)}
          aria-label={`Select customer ${customer.full_name || customer.email}`}
        />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={customer.avatar_url} />
          <AvatarFallback>
            {getInitials(customer.full_name, customer.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {customer.full_name || "No name"}
          </h3>
          <div className="flex items-center gap-2">
            {getRoleIcon(customer.role)}
            <span className="text-sm text-gray-500 capitalize">
              {customer.role}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate" title={customer.email}>
            {customer.email}
          </span>
        </div>

        {customer.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </div>
        )}

        {customer.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{customer.location}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>Joined {formatDate(customer.created_at)}</span>
        </div>

        {customer.last_sign_in_at && (
          <div className="flex items-center gap-2 text-gray-600">
            <User className="h-4 w-4 flex-shrink-0" />
            <span>Last seen {formatDate(customer.last_sign_in_at)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 mt-4 border-t">
        <Badge className={getStatusColor(customer.status)}>
          {customer.status}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(customer.id);
          }}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    sortBy: "date-new",
    status: "all",
    role: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customersToDelete, setCustomersToDelete] = useState<Customer[]>([]);
  const { isMobile } = useDeviceType();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const itemsPerPage = 12;

  // Fetch customers from custom API route
  const fetchCustomers = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/list-users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      // Get current user's role to determine filtering
      const currentUserRole =
        authUser?.app_metadata?.role || authUser?.user_metadata?.role;

      // Map Supabase Auth users to Customer type
      const mappedUsers = (data.users || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        phone: user.phone || "",
        location: user.user_metadata?.location || "",
        status: user.user_metadata?.status || "active",
        // Check both raw_app_meta_data and user_metadata for role
        role:
          user.raw_app_meta_data?.role ||
          user.user_metadata?.role ||
          "customer",
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
      }));

      // Filter based on current user's role
      let filteredUsers = mappedUsers;

      if (currentUserRole === "staff") {
        // Staff users should only see customers (not other staff or admins)
        filteredUsers = mappedUsers.filter(
          (user: { role: string }) => user.role === "customer"
        );
      } else if (currentUserRole === "admin") {
        // Admins can see everyone (no filtering needed)
        filteredUsers = mappedUsers;
      } else {
        // Regular customers shouldn't see this page, but if they do, show only customers
        filteredUsers = mappedUsers.filter(
          (user: { role: string }) => user.role === "customer"
        );
      }

      setCustomers(filteredUsers);
    } catch (error: any) {
      console.error("Error fetching customers:", error.message);
      toast.error("Failed to fetch customers");
      setCustomers([]);
    }
    setLoading(false);
  }, [authUser]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting initial session:", error.message);
        // Only show error for unexpected issues
        if (
          error.message !== "Auth session missing!" &&
          error.message !== "JWT expired"
        ) {
          toast.error("Authentication error occurred");
        }
      }
      setAuthUser(session?.user || null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "Auth state change:",
        event,
        session?.user?.email || "no user"
      );
      setAuthUser(session?.user || null);

      // Refetch customers when user signs in
      if (event === "SIGNED_IN") {
        fetchCustomers();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchCustomers]);

  const updateFilter = (key: keyof CustomerFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      sortBy: "date-new",
      status: "all",
      role: "all",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleSelectAllCustomers = () => {
    if (
      selectedCustomers.length === currentPageData.length &&
      currentPageData.length > 0
    ) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(currentPageData.map((customer) => customer.id));
    }
  };

  const clearCustomerSelection = () => {
    setSelectedCustomers([]);
  };

  const openDeleteDialog = () => {
    const customersToConfirm = customers.filter((c) =>
      selectedCustomers.includes(c.id)
    );
    setCustomersToDelete(customersToConfirm);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCustomers = async () => {
    if (selectedCustomers.length === 0) return;

    setLoading(true);
    try {
      // You cannot delete Supabase Auth users from the client.
      // You need to call an admin API route to delete users.
      // For now, just show a toast and clear selection.
      toast.info("User deletion requires admin API. Not implemented.");
      clearCustomerSelection();
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customers:", error);
      toast.error(
        error instanceof Error
          ? `Error deleting customers: ${error.message}`
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filter and sort customers
  const filteredCustomers = customers.filter((customer) => {
    // Search filter
    if (
      filters.search &&
      !customer.full_name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      !customer.email.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (filters.status !== "all" && customer.status !== filters.status) {
      return false;
    }

    // Role filter
    if (filters.role !== "all" && customer.role !== filters.role) {
      return false;
    }

    return true;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (filters.sortBy) {
      case "name-asc":
        return (a.full_name || a.email).localeCompare(b.full_name || b.email);
      case "name-desc":
        return (b.full_name || b.email).localeCompare(a.full_name || a.email);
      case "email-asc":
        return a.email.localeCompare(b.email);
      case "email-desc":
        return b.email.localeCompare(a.email);
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

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const currentPageData = sortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <TypographyH2 className="border-none pb-0">Customers</TypographyH2>
          {authUser && (
            <TypographyP className="text-muted-foreground">
              Logged in as: {authUser.email}
            </TypographyP>
          )}
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
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    updateFilter("status", value as CustomerFilters["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.role}
                  onValueChange={(value) =>
                    updateFilter("role", value as CustomerFilters["role"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Role Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    updateFilter("sortBy", value as CustomerFilters["sortBy"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-new">Newest First</SelectItem>
                    <SelectItem value="date-old">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                    <SelectItem value="email-desc">Email (Z-A)</SelectItem>
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
              placeholder="Search by name or email..."
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
                updateFilter("status", value as CustomerFilters["status"])
              }
            >
              <SelectTrigger className="w-full sm:w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.role}
              onValueChange={(value) =>
                updateFilter("role", value as CustomerFilters["role"])
              }
            >
              <SelectTrigger className="w-full sm:w-[140px] h-9">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                updateFilter("sortBy", value as CustomerFilters["sortBy"])
              }
            >
              <SelectTrigger className="w-full sm:w-[160px] h-9">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-new">Newest First</SelectItem>
                <SelectItem value="date-old">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                <SelectItem value="email-desc">Email (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {showFilters && (
        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>Refine your customer search.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-0">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={
                  selectedCustomers.length === currentPageData.length &&
                  currentPageData.length > 0
                }
                onCheckedChange={toggleSelectAllCustomers}
              />
              <label
                htmlFor="selectAll"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select all on this page ({currentPageData.length})
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedCustomers.length > 0 && (
            <>
              <span className="text-sm text-gray-500">
                {selectedCustomers.length} selected
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
                    Delete Selected ({selectedCustomers.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the following{" "}
                      {customersToDelete.length} customer(s)? This action cannot
                      be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {customersToDelete.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center gap-3 p-2 border rounded-md"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={customer.avatar_url} />
                          <AvatarFallback>
                            {customer.full_name?.charAt(0) ||
                              customer.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">
                            {customer.full_name || "No name"}
                          </span>
                          <div className="text-sm text-gray-500">
                            {customer.email}
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
                    <Button
                      variant="destructive"
                      onClick={handleDeleteCustomers}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCustomerSelection}
              >
                Clear Selection
              </Button>
            </>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {sortedCustomers.length} Results
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <CustomerGridSkeleton />
      ) : customers.length === 0 ? (
        <EmptyCustomersState />
      ) : sortedCustomers.length === 0 ? (
        <NoCustomerResultsState onClearFilters={clearAllFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentPageData.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              isSelected={selectedCustomers.includes(customer.id)}
              onSelect={toggleCustomerSelection}
              onViewDetails={(id) => router.push(`/staff/customers/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
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
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
