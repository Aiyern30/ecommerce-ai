import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, orderTotal } = await request.json();

    // Create notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title: "Order Confirmed",
        message: `Your order #${orderId.slice(
          -8
        )} totaling ${orderTotal} has been confirmed and is being processed.`,
        type: "order",
        order_id: orderId,
        created_at: new Date().toISOString(),
      });

    if (notificationError) {
      console.error("Notification creation error:", notificationError);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
