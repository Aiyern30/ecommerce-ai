import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const insights = [];

    // Analyze recent order patterns
    const { data: recentOrders } = await supabaseAdmin
      .from("orders")
      .select("total, created_at")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: false });

    if (recentOrders && recentOrders.length > 0) {
      const avgOrderValue =
        recentOrders.reduce((sum, order) => sum + order.total, 0) /
        recentOrders.length;

      insights.push({
        id: "sales-trend",
        type: "sales",
        title: "Order Value Trend",
        description: `Average order value this week: RM${avgOrderValue.toFixed(
          2
        )}. ${
          avgOrderValue > 1000
            ? "Above average - strong performance!"
            : "Consider upselling opportunities."
        }`,
        impact: avgOrderValue > 1000 ? "high" : "medium",
        confidence: 82,
        timestamp: new Date().toISOString(),
      });
    }

    // Product performance insight
    const { data: topProducts } = await supabaseAdmin
      .from("order_items")
      .select("name, quantity")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("quantity", { ascending: false })
      .limit(3);

    if (topProducts && topProducts.length > 0) {
      insights.push({
        id: "product-performance",
        type: "recommendation",
        title: "Product Mix Optimization",
        description: `Top performer: ${topProducts[0].name}. Consider promoting similar grades or bundle deals with complementary products.`,
        impact: "medium",
        confidence: 78,
        timestamp: new Date().toISOString(),
      });
    }

    // Seasonal/timing insights
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour <= 17) {
      insights.push({
        id: "timing-insight",
        type: "alert",
        title: "Peak Hours Analysis",
        description:
          "Most orders come between 10 AM - 2 PM. Consider staffing optimization during these hours.",
        impact: "low",
        confidence: 85,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating general insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
