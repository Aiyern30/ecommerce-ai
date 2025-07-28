"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Badge,
} from "@/components/ui";
import Link from "next/link";
import {
  clearAllNotifications,
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notification/api";
import { Notification } from "@/type/notification";

export default function NotificationSheet() {
  const user = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchNotifications();
    }
  }, [isOpen, user?.id, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    if (success) {
      setNotifications((items) =>
        items.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
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
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } else {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleClearAllNotifications = async () => {
    if (!user?.id) return;
    const success = await clearAllNotifications(user.id);
    if (success) {
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
    } else {
      toast.error("Failed to clear notifications");
    }
  };

  const getTypeColor = (type: string | undefined) => {
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
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5 text-gray-400" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Bell className="h-5 w-5 text-gray-800 dark:text-gray-200" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col h-full p-4 pt-0 bg-white dark:bg-gray-900"
      >
        <SheetHeader className="px-0 border-b dark:border-gray-700">
          <div className="flex flex-col gap-2">
            <SheetTitle className="font-bold text-gray-900 dark:text-white">
              Notifications
            </SheetTitle>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllNotifications}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-xl">
                No notifications
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                We&apos;ll notify you when something arrives
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              // Defensive: skip if missing required fields
              if (
                !notification ||
                !notification.id ||
                !notification.title ||
                !notification.message
              )
                return null;
              const type = notification.type || "system";
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border dark:border-gray-700 ${
                    notification.read
                      ? "bg-gray-50 dark:bg-gray-800"
                      : "bg-white dark:bg-gray-900"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getTypeColor(
                            type
                          )}`}
                        >
                          {typeof type === "string"
                            ? type.charAt(0).toUpperCase() + type.slice(1)
                            : "System"}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                        )}
                      </div>
                      <h3 className="font-medium mt-1 text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 self-start ml-2"
                        title="Mark as read"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t dark:border-gray-700 pt-4">
            <Link href="/notifications">
              <Button className="w-full mt-4" onClick={() => setIsOpen(false)}>
                View All Notifications
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
