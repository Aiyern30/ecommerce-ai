"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/";
import { clearAllNotifications } from "./actions";
import { toast } from "sonner";

export function NotificationsHeader() {
  const handleClearAll = async () => {
    await clearAllNotifications();

    toast.success("Notifications cleared!", {
      description: "All notifications have been cleared successfully.",

      duration: 3000,
      style: { background: "#16a34a", color: "#fff" },
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
      </div>
      <Button variant="outline" onClick={handleClearAll}>
        Clear all notifications
      </Button>
    </div>
  );
}
