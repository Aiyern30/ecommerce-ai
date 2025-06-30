"use client";

import { Button } from "@/components/ui/";
import { clearAllNotifications } from "./actions";
import { toast } from "sonner";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

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
    <div className="flex flex-col md:flex-row justify-between items-center">
      <div className="container mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between w-full p-4">
        <BreadcrumbNav showFilterButton={false} />
      </div>
      <div className="w-full sm:w-auto flex justify-center sm:justify-end">
        <Button variant="outline" onClick={handleClearAll}>
          Clear all notifications
        </Button>
      </div>
    </div>
  );
}
