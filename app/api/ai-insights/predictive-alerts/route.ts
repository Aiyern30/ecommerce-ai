import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const alerts = [];

    // Get products with low stock for stockout predictions
    const { data: lowStockProducts } = await supabaseAdmin
      .from("products")
      .select("name, stock_quantity, grade")
      .lt("stock_quantity", 200) // Alert when stock below 200
      .eq("status", "published")
      .eq("is_active", true)
      .order("stock_quantity", { ascending: true })
      .limit(10);

    // Generate stockout alerts for critical products
    lowStockProducts?.forEach((product, index) => {
      if (product.stock_quantity < 100) {
        const probability = Math.max(
          60,
          Math.min(95, 100 - product.stock_quantity)
        );

        alerts.push({
          id: `stockout-${index}`,
          type: "stockout",
          product: product.name,
          probability,
          timeframe: product.stock_quantity < 50 ? "1-2 days" : "3-5 days",
          impact: `${
            product.stock_quantity < 50 ? "Critical" : "High"
          } - Current stock: ${product.stock_quantity} m³`,
          action: `Reorder ${Math.max(
            500,
            1000 - product.stock_quantity
          )} m³ of ${product.grade} grade`,
        });
      }
    });

    // Get recent order trends for demand analysis
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: recentOrders } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        name,
        quantity,
        orders!inner(created_at)
      `
      )
      .gte("orders.created_at", sevenDaysAgo)
      .order("quantity", { ascending: false });

    // Analyze demand patterns
    if (recentOrders && recentOrders.length > 0) {
      const productDemand = recentOrders.reduce((acc, item) => {
        const productName = item.name;
        acc[productName] = (acc[productName] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);

      // Find products with highest recent demand
      const sortedDemand = Object.entries(productDemand)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      sortedDemand.forEach(([productName, totalQuantity], index) => {
        if (totalQuantity > 50) {
          // Only alert for significant demand
          alerts.push({
            id: `demand-spike-${index}`,
            type: "demand_spike",
            product: productName,
            probability: Math.min(85, 60 + Math.floor(totalQuantity / 10)),
            timeframe: "Next 7-10 days",
            impact: `Medium - Recent 7-day demand: ${totalQuantity} m³`,
            action: `Monitor inventory and consider increasing stock by 30-50%`,
          });
        }
      });
    }

    // Generate delivery alerts based on order status
    const { data: processingOrders } = await supabaseAdmin
      .from("orders")
      .select("id, created_at, status")
      .eq("status", "processing")
      .lt(
        "created_at",
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      ); // Orders older than 3 days

    if (processingOrders && processingOrders.length > 0) {
      alerts.push({
        id: "delivery-delay-1",
        type: "delivery_delay",
        product: "Multiple Orders",
        probability: 70,
        timeframe: "Immediate attention needed",
        impact: `${processingOrders.length} orders have been processing for 3+ days`,
        action: "Review processing workflow and contact logistics team",
      });
    }

    return NextResponse.json(alerts.slice(0, 5)); // Return top 5 alerts
  } catch (error) {
    console.error("Error generating predictive alerts:", error);
    return NextResponse.json(
      { error: "Failed to generate alerts" },
      { status: 500 }
    );
  }
}
