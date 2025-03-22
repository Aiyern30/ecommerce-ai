"use client";

import { useState, useEffect } from "react";
import { Check, Package, Tag, Bell, ChevronRight } from "lucide-react";
import { markAsRead } from "./actions";
import { toast } from "sonner";
import { Card, CardContent, Skeleton, Badge, Button } from "@/components/ui";

type NotificationType = "order" | "promotion" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
  image?: string;
}

interface NotificationsListProps {
  filter: NotificationType | "all";
}

export function NotificationsList({ filter }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching notifications from an API
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((notification) => notification.type === filter);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    toast.success("Notification marked as read", {
      description: "This notification has been marked as read.",

      duration: 3000,
      style: { background: "#16a34a", color: "#fff" },
    });
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "promotion":
        return <Tag className="h-5 w-5 text-green-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No notifications to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {filteredNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={notification.read ? "opacity-70" : ""}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                  </div>
                  {!notification.read && (
                    <Badge variant="default" className="ml-2">
                      New
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark as read
                      </Button>
                    )}
                    {notification.link && (
                      <Button variant="outline" size="sm">
                        View details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "Your order has been shipped!",
    description: "Order #12345 has been shipped and is on its way to you.",
    time: "Just now",
    read: false,
    link: "/orders/12345",
  },
  {
    id: "2",
    type: "promotion",
    title: "Flash Sale: 50% off all summer items",
    description:
      "Limited time offer! Get 50% off all summer items for the next 24 hours.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "system",
    title: "Account security alert",
    description:
      "We noticed a login from a new device. Please verify if this was you.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "4",
    type: "order",
    title: "Order delivered successfully",
    description: "Your order #12340 has been delivered. Enjoy your purchase!",
    time: "2 days ago",
    read: true,
    link: "/orders/12340",
  },
  {
    id: "5",
    type: "promotion",
    title: "New arrivals just for you",
    description: "Check out our latest collection based on your preferences.",
    time: "3 days ago",
    read: true,
  },
];
