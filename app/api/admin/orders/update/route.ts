import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
  "refunded",
] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

interface UpdateOrderRequest {
  orderId: string;
  status: OrderStatus;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateOrderRequest = await request.json();
    const { orderId, status } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status value
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    // Check if order exists first
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update the order status
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, status, updated_at")
      .single();

    if (error) {
      console.error("supabaseAdmin error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update order status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        status: data.status,
        updated_at: data.updated_at,
      },
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to retrieve order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, updated_at")
      .eq("id", orderId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        status: data.status,
        updated_at: data.updated_at,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
