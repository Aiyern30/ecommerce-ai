import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notification/server";

export async function POST(request: Request) {
  try {
    const { id, staff_reply, status } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing enquiry ID" },
        { status: 400 }
      );
    }

    // Fetch enquiry to get user_id and name for notification
    const { data: enquiry, error: fetchError } = await supabaseAdmin
      .from("enquiries")
      .select("user_id, name, subject")
      .eq("id", id)
      .single();

    if (fetchError || !enquiry) {
      return NextResponse.json(
        { error: "Failed to fetch enquiry for notification" },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin
      .from("enquiries")
      .update({
        staff_reply,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send notification to user if staff_reply is updated
    if (staff_reply && staff_reply.trim().length > 0) {
      const notificationTitle = "Your Enquiry Has Been Answered";
      const notificationMessage = `Hi ${enquiry.name},\n\nYour enquiry "${enquiry.subject}" has been answered by our staff:\n\n"${staff_reply}"\n\nThank you for reaching out to us!`;

      await createNotification({
        user_id: enquiry.user_id,
        title: notificationTitle,
        message: notificationMessage,
        type: "system",
        id: id,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
