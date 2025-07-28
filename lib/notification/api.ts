import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CreateNotificationData } from "@/type/notification";

// Create notification (server-side)
export async function createNotification(
  data: CreateNotificationData
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      order_id: data.order_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error creating notification:", error);
      return false;
    }

    console.log("Notification created successfully");
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

// Get user notifications (client-side)
export async function getUserNotifications(
  userId: string
): Promise<Notification[]> {
  try {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(
  userId: string
): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

// Delete notification
export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("Error deleting notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

// Clear all notifications
export async function clearAllNotifications(userId: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error clearing all notifications:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    return false;
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  try {
    const supabase = createClientComponentClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}
