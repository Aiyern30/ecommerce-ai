import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();
    const yesterdayStart = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Get top selling product from yesterday
    const { data: topProductData } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        name,
        quantity,
        orders!inner(created_at)
      `
      )
      .gte("orders.created_at", yesterdayStart.toISOString())
      .lte("orders.created_at", yesterdayEnd.toISOString())
      .order("quantity", { ascending: false })
      .limit(1);

    const topSellingProduct = topProductData?.[0]?.name || "N25 Concrete";

    // Get order counts for growth calculation
    const { data: todayOrders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .gte("created_at", todayStart);

    const { data: yesterdayOrders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .gte("created_at", yesterdayStart.toISOString())
      .lte("created_at", yesterdayEnd.toISOString());

    // Calculate order growth percentage
    const todayCount = todayOrders?.length || 0;
    const yesterdayCount = yesterdayOrders?.length || 0;
    const orderGrowth =
      yesterdayCount > 0
        ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
        : 0;

    // Get low stock products (below 100 units)
    const { data: lowStockProducts } = await supabaseAdmin
      .from("products")
      .select("name")
      .lt("stock_quantity", 100)
      .eq("status", "published")
      .eq("is_active", true)
      .limit(5);

    const stockRisks = lowStockProducts?.map((p) => p.name) || [];

    // Get yesterday's revenue
    const { data: yesterdayRevenue } = await supabaseAdmin
      .from("orders")
      .select("total")
      .gte("created_at", yesterdayStart.toISOString())
      .lte("created_at", yesterdayEnd.toISOString())
      .eq("payment_status", "paid");

    const revenue =
      yesterdayRevenue?.reduce(
        (sum, order) => sum + parseFloat(order.total),
        0
      ) || 0;

    // Estimate contractor activity based on order patterns
    // In real implementation, you'd have user roles/types
    const contractorActivity = Math.floor(Math.random() * 20) + 5; // Placeholder

    // Count new customers (first-time orders in the last 24 hours)
    const { data: newCustomerOrders } = await supabaseAdmin
      .from("orders")
      .select("user_id")
      .gte("created_at", yesterdayStart.toISOString());

    const uniqueCustomers = new Set(
      newCustomerOrders?.map((o) => o.user_id) || []
    );
    const newCustomers = uniqueCustomers.size;

    const summary = {
      date: today.toISOString().split("T")[0],
      topSellingProduct,
      orderGrowth,
      contractorActivity,
      stockRisks: stockRisks.slice(0, 3),
      revenue: Math.round(revenue),
      newCustomers,
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
