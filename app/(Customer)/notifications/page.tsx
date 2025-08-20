"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Bell, Check, Trash2, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import Link from "next/link";

import { Notification } from "@/type/notification";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/lib/notification/client";

export default function NotificationsPage() {
  const user = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "unread" | "order" | "promotion" | "system"
  >("all");

  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const filterNotifications = useCallback(() => {
    let filtered = notifications;

    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.read);
    } else if (filter !== "all") {
      filtered = filtered.filter((n) => n.type === filter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, searchQuery]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    filterNotifications();
  }, [filterNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    if (success) {
      setNotifications((items) =>
        items.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      toast.success("Notification marked as read");
    } else {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    const success = await markAllNotificationsAsRead(user.id);
    if (success) {
      setNotifications((items) =>
        items.map((item) => ({ ...item, read: true }))
      );
      toast.success("All notifications marked as read");
    } else {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const success = await deleteNotification(id);
    if (success) {
      setNotifications((items) => items.filter((item) => item.id !== id));
      toast.success("Notification deleted");
    } else {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAllNotifications = async () => {
    if (!user?.id) return;
    const success = await clearAllNotifications(user.id);
    if (success) {
      setNotifications([]);
      toast.success("All notifications cleared");
    } else {
      toast.error("Failed to clear notifications");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300";
      case "promotion":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300";
      case "system":
        return "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300";
      case "payment":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300";
      case "shipping":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) {
    return (
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">NOTIFICATIONS</TypographyH1>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <TypographyP>Please login to view notifications</TypographyP>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-0 pb-4">
      <TypographyH1 className="my-8">NOTIFICATIONS</TypographyH1>

      {/* Only show filters/search if there are notifications */}
      {notifications.length > 0 && (
        <>
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <TypographyP className="!mt-0">
                  {notifications.length} total, {unreadCount} unread
                </TypographyP>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllNotifications}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as typeof filter)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter notifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="order">Orders</SelectItem>
                  <SelectItem value="promotion">Promotions</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm flex-1"
              />
            </div>
          </div>
        </>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          // Enhanced empty state UI, similar to cart page
          <div className="flex flex-col items-center justify-center text-center min-h-[60vh] space-y-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
              <Bell className="h-12 w-12 text-blue-600" />
            </div>
            <div className="space-y-3">
              <TypographyH3 className="text-gray-500 dark:text-gray-400 mb-2">
                {notifications.length === 0
                  ? "No notifications"
                  : "No notifications match your filters"}
              </TypographyH3>
              <TypographyP className="text-gray-400 dark:text-gray-500">
                {notifications.length === 0
                  ? "We'll notify you when something arrives"
                  : "Try adjusting your search or filter criteria"}
              </TypographyP>
            </div>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border ${
                notification.read
                  ? "border-gray-200 dark:border-gray-700"
                  : "border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getTypeColor(
                        notification.type
                      )}`}
                    >
                      {notification.type.charAt(0).toUpperCase() +
                        notification.type.slice(1)}
                    </span>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  <TypographyH3 className="text-gray-900 dark:text-white mb-2 !mt-0">
                    {notification.title}
                  </TypographyH3>
                  <TypographyP className="text-gray-600 dark:text-gray-300 !mt-0">
                    {notification.message}
                  </TypographyP>
                  {/* Show order details if present */}
                  {notification.order && (
                    <div className="mt-4 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-900/30 p-4 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Order
                        </span>
                        <Link
                          href={`/profile/orders/${notification.order.id}`}
                          target="_blank"
                          className="text-xs text-blue-600 dark:text-blue-300 underline hover:text-blue-800"
                          title={`View order ${notification.order.id}`}
                        >
                          #{notification.order.id}
                        </Link>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {notification.order.status.charAt(0).toUpperCase() +
                            notification.order.status.slice(1)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          {notification.order.payment_status
                            .charAt(0)
                            .toUpperCase() +
                            notification.order.payment_status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                          {new Date(
                            notification.order.created_at
                          ).toLocaleDateString("en-MY", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">
                          RM{notification.order.total?.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Total
                        </span>
                      </div>
                      {notification.order.order_items &&
                        notification.order.order_items.length > 0 && (
                          <div className="mt-2">
                            <div className="font-semibold text-xs mb-1">
                              Items:
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="bg-gray-100 dark:bg-gray-800">
                                    <th className="px-2 py-1 text-left">
                                      Name
                                    </th>
                                    <th className="px-2 py-1 text-left">
                                      Grade
                                    </th>
                                    <th className="px-2 py-1 text-center">
                                      Qty
                                    </th>
                                    <th className="px-2 py-1 text-left">
                                      Delivery
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {notification.order.order_items.map(
                                    (item) => (
                                      <tr
                                        key={item.id}
                                        className="border-b border-gray-100 dark:border-gray-800"
                                      >
                                        <td className="px-2 py-1">
                                          {item.name}
                                        </td>
                                        <td className="px-2 py-1">
                                          {item.grade}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                          {item.quantity}
                                        </td>
                                        <td className="px-2 py-1">
                                          {item.variant_type
                                            ? item.variant_type.replace(
                                                "_",
                                                " "
                                              )
                                            : "normal"}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-blue-500 hover:text-blue-600"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
