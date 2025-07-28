import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Notification } from "@/type/notification";

// Get user notifications
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
    return !error;
  } catch (error) {
    console.error("Error marking as read:", error);
    return false;
  }
}

// Mark all as read
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
    return !error;
  } catch (error) {
    console.error("Error marking all as read:", error);
    return false;
  }
}

// Delete single notification
export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);
    return !error;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

// Clear all
export async function clearAllNotifications(userId: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);
    return !error;
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    return false;
  }
}

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
