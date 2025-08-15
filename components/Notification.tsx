/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  ScrollArea,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Skeleton,
} from "@/components/ui";
import Link from "next/link";
import { Notification } from "@/type/notification";
import {
  clearAllNotifications,
  deleteNotification,
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notification/client";

export default function NotificationSheet() {
  const user = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<Notification | null>(null);
  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (notificationToDelete) {
      const success = await deleteNotification(notificationToDelete.id);
      if (success) {
        setNotifications((items) =>
          items.filter((n) => n.id !== notificationToDelete.id)
        );
        setUnreadCount((prev) =>
          Math.max(0, prev - (notificationToDelete.read ? 0 : 1))
        );
        toast.success("Notification deleted");
      } else {
        toast.error("Failed to delete notification");
      }
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

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

  // Skeleton loading component for notifications
  const NotificationSkeleton = () => (
    <Card className="border dark:border-gray-700">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-2 w-2 rounded-full" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-16 mt-2" />
      </CardContent>
    </Card>
  );

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
          className="relative"
          onClick={() => setIsOpen(true)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="space-y-2 pb-4">
          <SheetTitle className="text-lg font-medium text-left">
            Notifications
          </SheetTitle>
          {isLoading ? (
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ) : (
            notifications.length > 0 && (
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
            )
          )}
        </SheetHeader>
        {/* Make notification content scrollable */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="space-y-4 mx-4">
                  {/* Generate 5 skeleton notification cards */}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <NotificationSkeleton key={index} />
                  ))}
                </div>
              ) : !user ? (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Bell className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <span className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Login Required
                    </span>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Please login to view your notifications.
                    </p>
                  </div>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button>Login to Continue</Button>
                  </Link>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Bell className="h-12 w-12 text-gray-500" />
                  </div>
                  <div className="space-y-3">
                    <span className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                      No notifications
                    </span>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      We'll notify you when something arrives.
                    </p>
                  </div>
                  <Link href="/products" onClick={() => setIsOpen(false)}>
                    <Button>Browse Products</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 mx-4">
                  {notifications.map((notification) => {
                    if (
                      !notification ||
                      !notification.id ||
                      !notification.title ||
                      !notification.message
                    )
                      return null;
                    const type = notification.type || "system";
                    return (
                      <Card
                        key={notification.id}
                        className={`transition-colors border dark:border-gray-700${
                          notification.read
                            ? "bg-gray-100 dark:bg-gray-800"
                            : "bg-white dark:bg-gray-900"
                        } hover:bg-gray-100 dark:hover:bg-gray-900/30`}
                      >
                        <CardHeader className="pb-2 flex flex-row items-center gap-2">
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
                          <span className="ml-auto flex gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 border rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 border rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleDeleteClick(notification)}
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardTitle className="text-base font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {notification.title}
                          </CardTitle>
                          <CardDescription className="block text-xs text-gray-500 mb-2 !mt-0">
                            {notification.message}
                          </CardDescription>
                          <span className="block text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {formatTime(notification.created_at)}
                          </span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        {isLoading ? (
          <div className="border-t p-4 space-y-4 bg-gray-100 dark:bg-gray-900/30">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-3/4 mx-auto" />
          </div>
        ) : (
          notifications.length > 0 && (
            <div className="border-t p-4 space-y-4 bg-gray-100 dark:bg-gray-900/30">
              <Link href="/notifications" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  View All Notifications
                </Button>
              </Link>
              <span className="block text-xs text-center text-gray-500 !mt-2">
                Manage your notifications and stay up to date
              </span>
            </div>
          )
        )}
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notification?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {notificationToDelete && (
            <div className="flex gap-4 p-4 border rounded-lg bg-gray-100 dark:bg-gray-900">
              <div className="flex-1">
                <span className="block font-medium text-gray-900 dark:text-white mb-1">
                  {notificationToDelete.title}
                </span>
                <span className="block text-xs text-gray-500 mb-2 !mt-0">
                  {notificationToDelete.message}
                </span>
                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {formatTime(notificationToDelete.created_at)}
                </span>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
