/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const now = new Date();

    // Try multiple fallback periods for more reliable comparisons
    const periods = [
      // Current vs Previous Month
      {
        current: new Date(now.getFullYear(), now.getMonth(), 1),
        previous: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        previousEnd: new Date(now.getFullYear(), now.getMonth(), 0),
      },
      // Last 30 days vs Previous 30 days
      {
        current: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        previous: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        previousEnd: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      // Last 7 days vs Previous 7 days
      {
        current: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        previous: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        previousEnd: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    // Helper function to calculate growth with multiple period fallbacks
    const calculateGrowthWithFallback = (
      data: any[],
      valueExtractor: (item: any) => number
    ) => {
      for (const period of periods) {
        const currentValue =
          data
            ?.filter((item) => new Date(item.created_at) >= period.current)
            .reduce((sum, item) => sum + valueExtractor(item), 0) || 0;

        const previousValue =
          data
            ?.filter((item) => {
              const itemDate = new Date(item.created_at);
              return (
                itemDate >= period.previous && itemDate <= period.previousEnd
              );
            })
            .reduce((sum, item) => sum + valueExtractor(item), 0) || 0;

        // If we have meaningful data for both periods, use this calculation
        if (previousValue > 0) {
          return {
            growth: ((currentValue - previousValue) / previousValue) * 100,
            hasValidComparison: true,
          };
        }
      }

      // No valid comparison found across all periods
      return { growth: 0, hasValidComparison: false };
    };

    const calculateCountGrowthWithFallback = (data: any[]) => {
      for (const period of periods) {
        const currentCount =
          data?.filter((item) => new Date(item.created_at) >= period.current)
            .length || 0;

        const previousCount =
          data?.filter((item) => {
            const itemDate = new Date(item.created_at);
            return (
              itemDate >= period.previous && itemDate <= period.previousEnd
            );
          }).length || 0;

        if (previousCount > 0) {
          return {
            growth: ((currentCount - previousCount) / previousCount) * 100,
            hasValidComparison: true,
          };
        }
      }

      return { growth: 0, hasValidComparison: false };
    };

    // Revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid");

    if (revenueError) throw revenueError;

    const totalRevenue =
      revenueData?.reduce((sum, order) => sum + Number(order.total || 0), 0) ||
      0;
    const revenueGrowthData = calculateGrowthWithFallback(
      revenueData || [],
      (order) => Number(order.total || 0)
    );

    // Orders
    const {
      data: ordersData,
      count: totalOrders,
      error: ordersError,
    } = await supabase.from("orders").select("created_at", { count: "exact" });

    if (ordersError) throw ordersError;

    const ordersGrowthData = calculateCountGrowthWithFallback(ordersData || []);

    // Products
    const {
      data: productsData,
      count: totalProducts,
      error: productsError,
    } = await supabase
      .from("products")
      .select("created_at", { count: "exact" })
      .eq("status", "published");

    if (productsError) throw productsError;

    const productsGrowthData = calculateCountGrowthWithFallback(
      productsData || []
    );

    // Open Enquiries
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

    return NextResponse.json({
      totalRevenue,
      revenueGrowth: Math.round(revenueGrowthData.growth * 100) / 100,
      revenueHasValidComparison: revenueGrowthData.hasValidComparison,
      totalOrders: totalOrders || 0,
      ordersGrowth: Math.round(ordersGrowthData.growth * 100) / 100,
      ordersHasValidComparison: ordersGrowthData.hasValidComparison,
      totalProducts: totalProducts || 0,
      productsGrowth: Math.round(productsGrowthData.growth * 100) / 100,
      productsHasValidComparison: productsGrowthData.hasValidComparison,
      totalEnquiries,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch KPI metrics" },
      { status: 500 }
    );
  }
}
