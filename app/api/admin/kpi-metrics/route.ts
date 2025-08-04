import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get cookies() synchronously
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Revenue (paid orders only)
    const { data: revenue, error: revenueError } = await supabase
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid");

    if (revenueError) throw revenueError;

    const totalRevenue =
      revenue?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const recentRevenue =
      revenue
        ?.filter((order) => new Date(order.created_at) >= thirtyDaysAgo)
        .reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;

    const previousRevenue =
      revenue
        ?.filter(
          (order) =>
            new Date(order.created_at) >= sixtyDaysAgo &&
            new Date(order.created_at) < thirtyDaysAgo
        )
        .reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;

    const revenueGrowth =
      previousRevenue > 0
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Orders
    const {
      data: orders,
      count: totalOrders,
      error: ordersError,
    } = await supabase.from("orders").select("created_at", { count: "exact" });

    if (ordersError) throw ordersError;

    const recentOrders =
      orders?.filter((order) => new Date(order.created_at) >= thirtyDaysAgo)
        .length || 0;

    const previousOrders =
      orders?.filter(
        (order) =>
          new Date(order.created_at) >= sixtyDaysAgo &&
          new Date(order.created_at) < thirtyDaysAgo
      ).length || 0;

    const ordersGrowth =
      previousOrders > 0
        ? ((recentOrders - previousOrders) / previousOrders) * 100
        : 0;

    // Products
    const {
      data: products,
      count: totalProducts,
      error: productsError,
    } = await supabase
      .from("products")
      .select("created_at", { count: "exact" })
      .eq("status", "published");

    if (productsError) throw productsError;

    const recentProducts =
      products?.filter(
        (product) => new Date(product.created_at) >= thirtyDaysAgo
      ).length || 0;

    const previousProducts =
      products?.filter(
        (product) =>
          new Date(product.created_at) >= sixtyDaysAgo &&
          new Date(product.created_at) < thirtyDaysAgo
      ).length || 0;

    const productsGrowth =
      previousProducts > 0
        ? ((recentProducts - previousProducts) / previousProducts) * 100
        : 0;

    // Users (commented out, see note above)
    // let newUsers = 0;
    // let usersGrowth = 0;
    // try {
    //   const { data: allUsers, error: usersError } = await supabase
    //     .from("users") // <-- use your custom users table if you have one
    //     .select("created_at");
    //   if (usersError) throw usersError;
    //   newUsers =
    //     allUsers?.filter((user) => new Date(user.created_at) >= thirtyDaysAgo)
    //       .length || 0;
    //   const previousNewUsers =
    //     allUsers?.filter(
    //       (user) =>
    //         new Date(user.created_at) >= sixtyDaysAgo &&
    //         new Date(user.created_at) < thirtyDaysAgo
    //     ).length || 0;
    //   usersGrowth =
    //     previousNewUsers > 0
    //       ? ((newUsers - previousNewUsers) / previousNewUsers) * 100
    //       : 0;
    // } catch (e) {
    //   // ignore users error if table doesn't exist
    // }

    return NextResponse.json({
      totalRevenue,
      revenueGrowth,
      totalOrders: totalOrders || 0,
      ordersGrowth,
      totalProducts: totalProducts || 0,
      productsGrowth,
      // newUsers,
      // usersGrowth,
    });
  } catch (error) {
    console.error("Error fetching KPI metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI metrics" },
      { status: 500 }
    );
  }
}
