import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get products with low stock for stockout predictions
    const { data: lowStockProducts } = await supabaseAdmin
      .from("products")
      .select("name, stock_quantity")
      .lt("stock_quantity", 100)
      .order("stock_quantity", { ascending: true })
      .limit(5);

    // Get recent order trends for demand spike predictions
    const { data: recentOrders } = await supabaseAdmin
      .from("order_items")
      .select("name, quantity, orders!inner(created_at)")
      .gte(
        "orders.created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("quantity", { ascending: false });

    const alerts = [];

    // Generate stockout alerts
    lowStockProducts?.forEach((product, index) => {
      if (product.stock_quantity < 50) {
        alerts.push({
          id: `stockout-${index}`,
          type: "stockout",
          product: product.name,
          probability: Math.max(60, 90 - product.stock_quantity),
          timeframe: product.stock_quantity < 20 ? "1-2 days" : "3-5 days",
          impact: `${
            product.stock_quantity < 20 ? "Critical" : "High"
          } - May affect pending orders`,
          action: `Increase production order by ${
            Math.ceil((100 - product.stock_quantity) / 50) * 100
          } m³`,
        });
      }
    });

    // Generate demand spike alerts (mock for now)
    if (recentOrders && recentOrders.length > 0) {
      alerts.push({
        id: "demand-spike-1",
        type: "demand_spike",
        product: recentOrders[0].name,
        probability: 75,
        timeframe: "Next week",
        impact: "Medium - Expected 40% demand increase",
        action: "Prepare additional inventory",
      });
    }

    return NextResponse.json(alerts.slice(0, 3));
  } catch (error) {
    console.error("Error generating predictive alerts:", error);
    return NextResponse.json(
      { error: "Failed to generate alerts" },
      { status: 500 }
    );
  }
}
