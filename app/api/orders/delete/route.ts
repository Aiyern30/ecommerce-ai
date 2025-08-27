import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Order IDs are required and must be an array" },
        { status: 400 }
      );
    }

    if (!ids.every((id) => typeof id === "string")) {
      return NextResponse.json(
        { error: "All order IDs must be strings" },
        { status: 400 }
      );
    }

    const { error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .delete()
      .in("order_id", ids);

    if (orderItemsError) {
      console.error("Error deleting order items:", orderItemsError);
      return NextResponse.json(
        { error: `Failed to delete order items: ${orderItemsError.message}` },
        { status: 500 }
      );
    }

    const { data: ordersData, error: ordersSelectError } = await supabaseAdmin
      .from("orders")
      .select("address_id")
      .in("id", ids);

    if (ordersSelectError) {
      console.error(
        "Error selecting orders for address cleanup:",
        ordersSelectError
      );
    }

    const { error: ordersError } = await supabaseAdmin
      .from("orders")
      .delete()
      .in("id", ids);

    if (ordersError) {
      console.error("Error deleting orders:", ordersError);
      return NextResponse.json(
        { error: `Failed to delete orders: ${ordersError.message}` },
        { status: 500 }
      );
    }

    if (ordersData && ordersData.length > 0) {
      const addressIds = ordersData
        .map((order) => order.address_id)
        .filter(Boolean);

      if (addressIds.length > 0) {
        const { data: otherOrders, error: otherOrdersError } =
          await supabaseAdmin
            .from("orders")
            .select("id")
            .in("address_id", addressIds);

        if (!otherOrdersError && (!otherOrders || otherOrders.length === 0)) {
          await supabaseAdmin.from("addresses").delete().in("id", addressIds);
        }
      }
    }

    return NextResponse.json(
      {
        message: `Successfully deleted ${ids.length} order(s)`,
        deletedIds: ids,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in delete orders API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting orders" },
      { status: 500 }
    );
  }
}
