import { supabaseAdmin } from "@/lib/supabase/admin";
import { CreateNotificationData } from "@/type/notification";

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
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}
