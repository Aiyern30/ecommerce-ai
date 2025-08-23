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
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Shield,
  User,
  Eye,
  UserX,
  MoreVertical,
  AlertTriangle,
  Clock,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import {
  Button,
  Input,
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Textarea,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { formatDate } from "@/lib/utils/format";
import { useDeviceType } from "@/utils/useDeviceTypes";
import { format, addDays, addWeeks, addMonths, isBefore } from "date-fns";

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
  // Ban info from app_metadata
  ban_info?: {
    reason?: string;
    banned_at?: string;
    banned_by?: string;
    banned_until?: string;
    previous_bans?: {
      reason?: string;
      banned_at?: string;
      banned_by?: string;
      banned_until?: string;
    }[];
    unbanned_at?: string;
    unbanned_by?: string;
  };
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
}

// Helper function to check if user is currently banned
const isCurrentlyBanned = (customer: Customer): boolean => {
  if (!customer.ban_info?.banned_until) return false;
  return isBefore(new Date(), new Date(customer.ban_info.banned_until));
};

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
        <Card
          key={i}
          className="p-6 min-h-[300px] flex flex-col justify-between relative"
        >
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
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-border">
            <div className="col-span-3">
              <Skeleton className="h-9 w-full rounded" />
            </div>
            <div className="col-span-1 flex justify-end">
              <Skeleton className="h-9 w-10 rounded" />
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Skeleton className="h-6 w-20 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Enhanced Ban Dialog Component
function BanUserDialog({
  customer,
  isOpen,
  onClose,
  onConfirm,
}: {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (banData: {
    banUntil: Date;
    reason: string;
    duration: string;
  }) => void;
}) {
  const [banUntil, setBanUntil] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [customDate, setCustomDate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBanUntil(null);
      setReason("");
      setSelectedDuration("");
      setCustomDate(false);
    }
  }, [isOpen]);

  const handleDurationSelect = (duration: string) => {
    setSelectedDuration(duration);
    const now = new Date();

    switch (duration) {
      case "1-day":
        setBanUntil(addDays(now, 1));
        setCustomDate(false);
        break;
      case "3-days":
        setBanUntil(addDays(now, 3));
        setCustomDate(false);
        break;
      case "1-week":
        setBanUntil(addWeeks(now, 1));
        setCustomDate(false);
        break;
      case "1-month":
        setBanUntil(addMonths(now, 1));
        setCustomDate(false);
        break;
      case "3-months":
        setBanUntil(addMonths(now, 3));
        setCustomDate(false);
        break;
      case "custom":
        setBanUntil(addDays(now, 1)); // Default to tomorrow
        setCustomDate(true);
        break;
      default:
        setBanUntil(null);
    }
  };

  const handleConfirm = () => {
    if (!banUntil || !reason.trim()) return;

    onConfirm({
      banUntil,
      reason: reason.trim(),
      duration: selectedDuration,
    });
  };

  if (!customer) return null;

  const isCurrentBan = isCurrentlyBanned(customer);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Ban className="h-5 w-5 text-orange-600" />
            {isCurrentBan ? "Extend Ban" : "Ban User"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isCurrentBan
              ? "This user is currently banned. You can extend or modify the ban."
              : "Select how long this user should be banned from accessing the platform."}
          </DialogDescription>
        </DialogHeader>

        {/* User Info Card */}
        <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage src={customer.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
              {customer.full_name?.charAt(0) || customer.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-foreground">
              {customer.full_name || "No name"}
            </div>
            <div className="text-sm text-muted-foreground">
              {customer.email}
            </div>
            {isCurrentBan && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-600 font-medium">
                  Currently banned until{" "}
                  {customer.ban_info?.banned_until
                    ? format(new Date(customer.ban_info.banned_until), "PPP")
                    : "-"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Ban Duration Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Ban Duration
            </label>
            <Select
              value={selectedDuration}
              onValueChange={handleDurationSelect}
            >
              <SelectTrigger className="w-full border-border bg-background">
                <SelectValue placeholder="Select ban duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-day">1 Day</SelectItem>
                <SelectItem value="3-days">3 Days</SelectItem>
                <SelectItem value="1-week">1 Week</SelectItem>
                <SelectItem value="1-month">1 Month</SelectItem>
                <SelectItem value="3-months">3 Months</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Picker */}
          {customDate && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Custom Ban End Date
              </label>
              <div className="rounded-lg border border-border bg-background p-4">
                <Calendar
                  mode="single"
                  selected={banUntil ?? undefined}
                  onSelect={(date) => setBanUntil(date ?? null)}
                  className="w-full"
                  disabled={(date) => isBefore(date, new Date())}
                  fromDate={new Date()}
                />
              </div>
            </div>
          )}

          {/* Selected Date Display */}
          {banUntil && (
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Ban Details
                </span>
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                User will be banned until:{" "}
                <strong>{format(banUntil, "PPP 'at' p")}</strong>
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Duration: ~
                {Math.ceil(
                  (banUntil.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </div>
            </div>
          )}

          {/* Ban Reason */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Reason for Ban <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for banning this user..."
              className="min-h-[100px] border-border bg-background resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {reason.length}/500 characters
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                  Important Notice
                </div>
                <div className="text-red-700 dark:text-red-300">
                  The banned user will be immediately signed out and unable to
                  access their account until the ban expires. This action will
                  be logged for audit purposes.
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!banUntil || !reason.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Ban className="h-4 w-4 mr-2" />
            {isCurrentBan ? "Update Ban" : "Ban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Customer Card Component
function CustomerCard({
  customer,
  isSelected,
  onSelect,
  onViewDetails,
  onBanUser,
  onUnbanUser,
}: {
  customer: Customer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetails: (id: string) => void;
  onBanUser: (id: string) => void;
  onUnbanUser: (id: string) => void;
}) {
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

  const isBanned = isCurrentlyBanned(customer);

  return (
    <Card
      className={`p-6 min-h-[300px] flex flex-col justify-between hover:shadow-md dark:hover:shadow-lg transition-all duration-200 cursor-pointer relative border-border bg-card hover:bg-accent/50 ${
        isBanned ? "ring-2 ring-orange-200 dark:ring-orange-800" : ""
      }`}
      onClick={() => onViewDetails(customer.id)}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {isBanned ? (
          <Badge
            variant="destructive"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Ban className="h-3 w-3 mr-1" />
            Banned
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )}
      </div>

      {/* Checkbox */}
      <div
        className="absolute top-4 left-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(customer.id)}
          aria-label={`Select customer ${customer.full_name || customer.email}`}
          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Avatar
          className={`h-12 w-12 border-2 ${
            isBanned
              ? "border-orange-300 dark:border-orange-700"
              : "border-border"
          }`}
        >
          <AvatarImage src={customer.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
            {getInitials(customer.full_name, customer.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold truncate ${
              isBanned
                ? "text-orange-700 dark:text-orange-300"
                : "text-foreground"
            }`}
          >
            {customer.full_name || "No name"}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {getRoleIcon(customer.role)}
            </span>
            <span className="text-sm text-muted-foreground capitalize">
              {customer.role}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate" title={customer.email}>
            {customer.email}
          </span>
        </div>

        {customer.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </div>
        )}

        {customer.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{customer.location}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarIcon className="h-4 w-4 flex-shrink-0" />
          <span>Joined {formatDate(customer.created_at)}</span>
        </div>

        {customer.last_sign_in_at && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span>Last seen {formatDate(customer.last_sign_in_at)}</span>
          </div>
        )}

        {/* Ban Information */}
        {isBanned && customer.ban_info?.banned_until && (
          <div className="p-2 rounded bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Ban className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">
                Banned until{" "}
                {customer.ban_info?.banned_until
                  ? format(new Date(customer.ban_info.banned_until), "MMM dd, yyyy")
                  : "-"}
              </span>
            </div>
            {customer.ban_info?.reason && (
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Reason: {customer.ban_info.reason}
              </div>
            )}
            {customer.ban_info?.banned_by && (
              <div className="text-xs text-muted-foreground mt-1">
                By: {customer.ban_info.banned_by}
              </div>
            )}
            {customer.ban_info?.banned_at && (
              <div className="text-xs text-muted-foreground mt-1">
                Banned at: {customer.ban_info?.banned_at
                  ? format(new Date(customer.ban_info.banned_at), "PPP p")
                  : "-"}
              </div>
            )}
            {customer.ban_info?.unbanned_at && (
              <div className="text-xs text-green-600 mt-1">
                Unbanned at: {customer.ban_info?.unbanned_at
                  ? format(new Date(customer.ban_info.unbanned_at), "PPP p")
                  : "-"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button row */}
      <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-border">
        <div className="col-span-3 flex">
          <Button
            variant="outline"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(customer.id);
            }}
            className="border-border hover:bg-accent w-full"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
        <div className="col-span-1 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                onClick={(e) => e.stopPropagation()}
                className="border-border hover:bg-accent"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(customer.id);
                }}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isBanned ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnbanUser(customer.id);
                  }}
                  className="cursor-pointer text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onBanUser(customer.id);
                  }}
                  className="cursor-pointer text-orange-600 dark:text-orange-400 focus:text-orange-600 dark:focus:text-orange-400"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Ban User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customersToDelete, setCustomersToDelete] = useState<Customer[]>([]);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [customerToBan, setCustomerToBan] = useState<Customer | null>(null);
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
        // Use app_metadata.role if present, fallback to user_metadata.role
        role:
          user.app_metadata?.role ||
          user.user_metadata?.role ||
          user.raw_app_meta_data?.role || // fallback for legacy data
          "customer",
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        ban_info: user.app_metadata?.ban_info, // <-- get ban_info from app_metadata
        status:
          user.app_metadata?.ban_info?.banned_until &&
          new Date(user.app_metadata?.ban_info?.banned_until) > new Date()
            ? "banned"
            : "active",
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

  const handleBanUser = async (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    setCustomerToBan(customer);
    setIsBanDialogOpen(true);
  };

  const handleUnbanUser = async (customerId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/ban-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: customerId }),
      });

      if (!response.ok) throw new Error("Failed to unban user");

      toast.success("User has been unbanned successfully");
      fetchCustomers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    } finally {
      setLoading(false);
    }
  };

  const confirmBanUser = async (banData: {
    banUntil: Date;
    reason: string;
    duration: string;
  }) => {
    if (!customerToBan) return;

    try {
      setLoading(true);
      const response = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customerToBan.id,
          bannedUntil: banData.banUntil.toISOString(),
          reason: banData.reason,
        }),
      });

      if (!response.ok) throw new Error("Failed to ban user");

      toast.success(`User banned until ${format(banData.banUntil, "PPP")}`);
      setIsBanDialogOpen(false);
      setCustomerToBan(null);
      fetchCustomers();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    } finally {
      setLoading(false);
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
    if (filters.status !== "all") {
      if (filters.status === "banned" && !isCurrentlyBanned(customer)) {
        return false;
      }
      if (filters.status === "active" && isCurrentlyBanned(customer)) {
        return false;
      }
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
    <div className="flex flex-col gap-6 w-full max-w-full bg-background">
      <div className="flex items-center justify-between">
        <div>
          <TypographyH2 className="border-none pb-0 text-foreground">
            Customers
          </TypographyH2>
        </div>
      </div>

      {/* Filter Controls */}
      {isMobile ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 w-full h-9 border-border hover:bg-accent bg-transparent"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <DrawerContent className="bg-card border-border">
              <DrawerHeader>
                <DrawerTitle className="text-foreground">Filters</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-4">
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger className="border-border bg-background">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="banned">Banned Users</SelectItem>
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
                    className="flex-1 border-border hover:bg-accent"
                  >
                    Clear
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      size="sm"
                      className="flex-1 border-border hover:bg-accent"
                    >
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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-8 border-border bg-background text-foreground placeholder:text-muted-foreground"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger className="w-[140px] border-border bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 w-full sm:w-auto bg-transparent h-9 border-border hover:bg-accent"
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
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      Confirm Deletion
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Are you sure you want to delete the following{" "}
                      {customersToDelete.length} customer(s)? This action cannot
                      be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {customersToDelete.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center gap-3 p-2 border border-border rounded-md bg-muted/50"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={customer.avatar_url || "/placeholder.svg"}
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {customer.full_name?.charAt(0) ||
                              customer.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground">
                            {customer.full_name || "No name"}
                          </span>
                          <div className="text-sm text-muted-foreground">
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
                      className="border-border hover:bg-accent"
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
                className="border-border hover:bg-accent bg-transparent"
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
              onBanUser={handleBanUser}
              onUnbanUser={handleUnbanUser}
            />
          ))}
        </div>
      )}

      {/* Enhanced Ban User Dialog */}
      <BanUserDialog
        customer={customerToBan}
        isOpen={isBanDialogOpen}
        onClose={() => {
          setIsBanDialogOpen(false);
          setCustomerToBan(null);
        }}
        onConfirm={confirmBanUser}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="border-border hover:bg-accent"
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
            className="border-border hover:bg-accent"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
