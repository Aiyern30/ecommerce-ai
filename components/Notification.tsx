"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Badge,
} from "@/components/ui/";
import Link from "next/link";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "promotion" | "system";
}

export default function NotificationSheet() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Order Shipped",
      message: "Your order #12345 has been shipped and is on its way.",
      time: "Just now",
      read: false,
      type: "order",
    },
    {
      id: 2,
      title: "Flash Sale",
      message: "50% off on all summer items! Limited time offer.",
      time: "2 hours ago",
      read: false,
      type: "promotion",
    },
    {
      id: 3,
      title: "Account Update",
      message: "Your account information has been updated successfully.",
      time: "Yesterday",
      read: true,
      type: "system",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const markAsRead = (id: number) => {
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    toast.success("All notifications marked as read", {
      duration: 3000,
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success("All notifications cleared", {
      duration: 3000,
    });
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-800";
      case "promotion":
        return "bg-green-100 text-green-800";
      case "system":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col h-full p-4 pt-0">
        <SheetHeader className="px-0">
          <div className="flex justify-between items-center">
            <SheetTitle className="font-bold">Notifications</SheetTitle>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllNotifications}
                  >
                    Clear all
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <Bell className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-xl">No notifications</p>
              <p className="text-gray-400 text-sm mt-2">
                We&apos;ll notify you when something arrives
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type.charAt(0).toUpperCase() +
                          notification.type.slice(1)}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <h3 className="font-medium mt-1">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-500 hover:text-blue-600 self-start ml-2"
                      title="Mark as read"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t pt-4">
            <Link href="/Notifications">
              <Button className="w-full mt-4" onClick={() => setIsOpen(false)}>
                View Notification
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
