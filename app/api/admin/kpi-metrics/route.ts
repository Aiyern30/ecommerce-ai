import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    // -------------------
    // 1️⃣ Revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid");

    if (revenueError) throw revenueError;

    const totalRevenue =
      revenueData?.reduce((sum, order) => sum + Number(order.total || 0), 0) ||
      0;

    const recentRevenue =
      revenueData
        ?.filter((o) => new Date(o.created_at) >= thirtyDaysAgo)
        .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

    const previousRevenue =
      revenueData
        ?.filter(
          (o) =>
            new Date(o.created_at) >= sixtyDaysAgo &&
            new Date(o.created_at) < thirtyDaysAgo
        )
        .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

    const revenueGrowth =
      previousRevenue > 0
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // -------------------
    // 2️⃣ Orders
    const {
      data: ordersData,
      count: totalOrders,
      error: ordersError,
    } = await supabase.from("orders").select("created_at", { count: "exact" });

    if (ordersError) throw ordersError;

    const recentOrders =
      ordersData?.filter((o) => new Date(o.created_at) >= thirtyDaysAgo)
        .length || 0;

    const previousOrders =
      ordersData?.filter(
        (o) =>
          new Date(o.created_at) >= sixtyDaysAgo &&
          new Date(o.created_at) < thirtyDaysAgo
      ).length || 0;

    const ordersGrowth =
      previousOrders > 0
        ? ((recentOrders - previousOrders) / previousOrders) * 100
        : 0;

    // -------------------
    // 3️⃣ Products
    const {
      data: productsData,
      count: totalProducts,
      error: productsError,
    } = await supabase
      .from("products")
      .select("created_at", { count: "exact" })
      .eq("status", "published");

    if (productsError) throw productsError;

    const recentProducts =
      productsData?.filter((p) => new Date(p.created_at) >= thirtyDaysAgo)
        .length || 0;

    const previousProducts =
      productsData?.filter(
        (p) =>
          new Date(p.created_at) >= sixtyDaysAgo &&
          new Date(p.created_at) < thirtyDaysAgo
      ).length || 0;

    const productsGrowth =
      previousProducts > 0
        ? ((recentProducts - previousProducts) / previousProducts) * 100
        : 0;

    // -------------------
    // 4️⃣ Open Enquiries (unread enquiries)
    let totalEnquiries = 0;
    try {
      const { count, error } = await supabase
        .from("enquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      if (error) throw error;

      totalEnquiries = count || 0;
    } catch {
      // silently ignore if enquiries table not found
    }

    // -------------------
    // ✅ Return
    return NextResponse.json({
      totalRevenue,
      revenueGrowth,
      totalOrders: totalOrders || 0,
      ordersGrowth,
      totalProducts: totalProducts || 0,
      productsGrowth,
      totalEnquiries,
    });
  } catch (error) {
    console.error("Error fetching KPI metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI metrics" },
      { status: 500 }
    );
  }
}
