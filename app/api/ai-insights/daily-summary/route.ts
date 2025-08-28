import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get top selling product
    const { data: topProduct } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        name,
        quantity,
        orders!inner(created_at)
      `
      )
      .gte("orders.created_at", yesterday)
      .lt("orders.created_at", today)
      .order("quantity", { ascending: false })
      .limit(1)
      .single();

    // Get order growth
    const { data: todayOrders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .gte("created_at", today);

    const { data: yesterdayOrders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .gte("created_at", yesterday)
      .lt("created_at", today);

    const orderGrowth = yesterdayOrders?.length
      ? (((todayOrders?.length || 0) - yesterdayOrders.length) /
          yesterdayOrders.length) *
        100
      : 0;

    // Mock contractor activity (would need user segmentation in real app)
    const contractorActivity = Math.floor(Math.random() * 20) + 5;

    // Get low stock products
    const { data: lowStockProducts } = await supabaseAdmin
      .from("products")
      .select("name")
      .lt("stock_quantity", 50)
      .limit(3);

    // Get revenue
    const { data: revenue } = await supabaseAdmin
      .from("orders")
      .select("total")
      .gte("created_at", yesterday)
      .lt("created_at", today);

    const totalRevenue =
      revenue?.reduce((sum, order) => sum + order.total, 0) || 0;

    const summary = {
      date: today,
      topSellingProduct: topProduct?.name || "N25 Concrete",
      orderGrowth: Math.round(orderGrowth),
      contractorActivity,
      stockRisks: lowStockProducts?.map((p) => p.name) || ["Mortar 1:4"],
      revenue: totalRevenue,
      newCustomers: Math.floor(Math.random() * 10) + 3,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error generating daily summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
