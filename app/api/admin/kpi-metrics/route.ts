/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const now = new Date();

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

        if (previousValue > 0) {
          return {
            growth: ((currentValue - previousValue) / previousValue) * 100,
            hasValidComparison: true,
          };
        }
      }

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

    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid");

    if (revenueError) {
      console.error("Revenue query error:", revenueError);
      throw revenueError;
    }

    const totalRevenue =
      revenueData?.reduce((sum, order) => sum + Number(order.total || 0), 0) ||
      0;
    const revenueGrowthData = calculateGrowthWithFallback(
      revenueData || [],
      (order) => Number(order.total || 0)
    );

    const {
      data: ordersData,
      count: totalOrders,
      error: ordersError,
    } = await supabaseAdmin
      .from("orders")
      .select("created_at", { count: "exact" });

    if (ordersError) {
      console.error("Orders query error:", ordersError);
      throw ordersError;
    }

    const ordersGrowthData = calculateCountGrowthWithFallback(ordersData || []);

    const {
      data: productsData,
      count: totalProducts,
      error: productsError,
    } = await supabaseAdmin
      .from("products")
      .select("created_at", { count: "exact" })
      .eq("status", "published");

    if (productsError) {
      console.error("Products query error:", productsError);
      throw productsError;
    }

    const productsGrowthData = calculateCountGrowthWithFallback(
      productsData || []
    );

    let totalEnquiries = 0;
    try {
      const { count, error } = await supabaseAdmin
        .from("enquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      if (error) {
        console.error("Enquiries query error:", error);
        throw error;
      }
      totalEnquiries = count || 0;
    } catch (enquiryError) {
      console.warn("Enquiries table not found or accessible:", enquiryError);
    }

    const result = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueGrowth: Math.round(revenueGrowthData.growth * 100) / 100,
      revenueHasValidComparison: revenueGrowthData.hasValidComparison,
      totalOrders: totalOrders || 0,
      ordersGrowth: Math.round(ordersGrowthData.growth * 100) / 100,
      ordersHasValidComparison: ordersGrowthData.hasValidComparison,
      totalProducts: totalProducts || 0,
      productsGrowth: Math.round(productsGrowthData.growth * 100) / 100,
      productsHasValidComparison: productsGrowthData.hasValidComparison,
      totalEnquiries,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Failed to fetch KPI metrics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch KPI metrics",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
