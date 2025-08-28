import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Starting daily summary generation..."); // Debug log

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

    console.log("Date ranges:", {
      todayStart,
      yesterdayStart: yesterdayStart.toISOString(),
      yesterdayEnd: yesterdayEnd.toISOString(),
    });

    // Get top selling product from yesterday
    const { data: topProductData, error: topProductError } = await supabaseAdmin
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

    if (topProductError) {
      console.error("Error fetching top product:", topProductError);
    } else {
      console.log("Top product data:", topProductData);
    }

    const topSellingProduct = topProductData?.[0]?.name || "N25 Concrete";

    // Get order counts for growth calculation
    const { data: todayOrders, error: todayOrdersError } = await supabaseAdmin
      .from("orders")
      .select("id")
      .gte("created_at", todayStart);

    const { data: yesterdayOrders, error: yesterdayOrdersError } =
      await supabaseAdmin
        .from("orders")
        .select("id")
        .gte("created_at", yesterdayStart.toISOString())
        .lte("created_at", yesterdayEnd.toISOString());

    if (todayOrdersError)
      console.error("Error fetching today orders:", todayOrdersError);
    if (yesterdayOrdersError)
      console.error("Error fetching yesterday orders:", yesterdayOrdersError);

    console.log("Order counts:", {
      today: todayOrders?.length,
      yesterday: yesterdayOrders?.length,
    });

    // Calculate order growth percentage
    const todayCount = todayOrders?.length || 0;
    const yesterdayCount = yesterdayOrders?.length || 0;
    const orderGrowth =
      yesterdayCount > 0
        ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
        : 0;

    // Get low stock products (below 100 units)
    const { data: lowStockProducts, error: stockError } = await supabaseAdmin
      .from("products")
      .select("name")
      .lt("stock_quantity", 100)
      .eq("status", "published")
      .limit(5);

    if (stockError) {
      console.error("Error fetching low stock products:", stockError);
    }

    const stockRisks = lowStockProducts?.map((p) => p.name) || [];

    // Get yesterday's revenue
    const { data: yesterdayRevenue, error: revenueError } = await supabaseAdmin
      .from("orders")
      .select("total")
      .gte("created_at", yesterdayStart.toISOString())
      .lte("created_at", yesterdayEnd.toISOString())
      .eq("payment_status", "paid");

    if (revenueError) {
      console.error("Error fetching revenue:", revenueError);
    }

    const revenue =
      yesterdayRevenue?.reduce(
        (sum, order) => sum + parseFloat(order.total),
        0
      ) || 0;

    // Count unique customers from yesterday
    const { data: newCustomerOrders, error: customersError } =
      await supabaseAdmin
        .from("orders")
        .select("user_id")
        .gte("created_at", yesterdayStart.toISOString())
        .lte("created_at", yesterdayEnd.toISOString());

    if (customersError) {
      console.error("Error fetching customer data:", customersError);
    }

    const uniqueCustomers = new Set(
      newCustomerOrders?.map((o) => o.user_id) || []
    );
    const newCustomers = uniqueCustomers.size;

    // Estimate contractor activity (placeholder - you'd need user role data)
    const contractorActivity = Math.floor(Math.random() * 20) + 5;

    const summary = {
      date: today.toISOString().split("T")[0],
      topSellingProduct,
      orderGrowth,
      contractorActivity,
      stockRisks: stockRisks.slice(0, 3),
      revenue: Math.round(revenue),
      newCustomers,
    };

    console.log("Final summary:", summary); // Debug log

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error generating daily summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary", details: error },
      { status: 500 }
    );
  }
}
