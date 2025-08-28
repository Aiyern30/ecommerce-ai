import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const alerts = [];

    // 1. Stock-out predictions
    const { data: lowStockProducts, error: stockError } = await supabaseAdmin
      .from("products")
      .select("name, stock_quantity, grade")
      .lt("stock_quantity", 300) // Increased threshold for earlier warning
      .eq("status", "published")
      .order("stock_quantity", { ascending: true })
      .limit(10);

    if (stockError) {
      console.error("Error fetching low stock products:", stockError);
    }

    // Generate stock-out alerts with different severity levels
    lowStockProducts?.forEach((product, index) => {
      if (product.stock_quantity < 150) {
        const daysUntilStockout = Math.max(
          1,
          Math.floor(product.stock_quantity / 50)
        );
        const probability = Math.max(
          65,
          Math.min(95, 100 - product.stock_quantity / 2)
        );

        alerts.push({
          id: `stockout-${index}`,
          type: "stockout",
          product: product.name,
          probability: Math.round(probability),
          timeframe:
            daysUntilStockout <= 2
              ? "1-2 days"
              : daysUntilStockout <= 5
              ? "3-5 days"
              : "Within a week",
          impact: `${
            product.stock_quantity < 50
              ? "Critical"
              : product.stock_quantity < 100
              ? "High"
              : "Medium"
          } - Current stock: ${
            product.stock_quantity
          } m³. Estimated depletion in ${daysUntilStockout} days`,
          action:
            product.stock_quantity < 50
              ? `URGENT: Emergency reorder of ${Math.max(
                  1000,
                  2000 - product.stock_quantity
                )} m³ required`
              : `Reorder ${Math.max(
                  500,
                  1500 - product.stock_quantity
                )} m³ of ${product.grade} grade within 48 hours`,
        });
      }
    });

    // 2. Demand spike predictions (enhanced)
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const fourteenDaysAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Get recent vs previous week data for trend analysis
    const { data: recentOrders } = await supabaseAdmin
      .from("order_items")
      .select(`name, quantity, orders!inner(created_at)`)
      .gte("orders.created_at", sevenDaysAgo);

    const { data: previousOrders } = await supabaseAdmin
      .from("order_items")
      .select(`name, quantity, orders!inner(created_at)`)
      .gte("orders.created_at", fourteenDaysAgo)
      .lt("orders.created_at", sevenDaysAgo);

    if (recentOrders && previousOrders) {
      // Analyze week-over-week growth
      const recentDemand = recentOrders.reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);

      const previousDemand = previousOrders.reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(recentDemand).forEach(
        ([productName, currentWeek], index) => {
          const previousWeek = previousDemand[productName] || 0;
          const growthRate =
            previousWeek > 0
              ? ((currentWeek - previousWeek) / previousWeek) * 100
              : 0;

          // Alert for significant growth trends
          if (growthRate > 30 && currentWeek > 100) {
            alerts.push({
              id: `demand-spike-${index}`,
              type: "demand_spike",
              product: productName,
              probability: Math.min(90, 60 + Math.floor(growthRate / 5)),
              timeframe: "Next 7-14 days",
              impact: `High growth trend: ${growthRate.toFixed(
                1
              )}% increase (${currentWeek} m³ vs ${previousWeek} m³ last week)`,
              action: `Increase inventory by ${Math.round(
                growthRate
              )}% and alert procurement team about trending demand`,
            });
          }
        }
      );
    }

    // 3. Seasonal/weather-based predictions
    const currentMonth = new Date().getMonth() + 1;
    if ([6, 7, 8].includes(currentMonth)) {
      // Rainy season
      alerts.push({
        id: "weather-seasonal",
        type: "weather_impact",
        product: "All Concrete Products",
        probability: 75,
        timeframe: "Next 2-4 weeks",
        impact:
          "Rainy season approaching - expect 20-30% increase in covered concrete demand",
        action:
          "Prepare additional covered storage and increase tremie concrete inventory",
      });
    }

    // 4. Price volatility alerts
    const { data: highDemandLowStock } = await supabaseAdmin
      .from("products")
      .select("name, stock_quantity, normal_price")
      .lt("stock_quantity", 500)
      .order("stock_quantity", { ascending: true })
      .limit(3);

    if (highDemandLowStock && highDemandLowStock.length > 0) {
      const product = highDemandLowStock[0];
      alerts.push({
        id: "price-optimization",
        type: "price_optimization",
        product: product.name,
        probability: 82,
        timeframe: "Immediate",
        impact:
          "Low stock + high demand = pricing opportunity. Current price: RM" +
          product.normal_price,
        action:
          "Consider 5-10% price increase due to supply constraints while restocking",
      });
    }

    // 5. Delivery optimization alerts
    const { data: processingOrders } = await supabaseAdmin
      .from("orders")
      .select("id, created_at, status")
      .eq("status", "processing")
      .lt(
        "created_at",
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      );

    if (processingOrders && processingOrders.length > 3) {
      alerts.push({
        id: "delivery-optimization",
        type: "delivery_delay",
        product: "Order Processing System",
        probability: 85,
        timeframe: "Immediate attention needed",
        impact: `${processingOrders.length} orders pending >48hrs. Risk of customer complaints and delayed deliveries`,
        action:
          "Review logistics workflow, contact delivery partners, and implement priority processing",
      });
    }

    // Sort alerts by priority (probability * impact factor)
    const prioritizedAlerts = alerts
      .map((alert) => ({
        ...alert,
        priority:
          alert.probability *
          (alert.type === "stockout"
            ? 1.2
            : alert.type === "delivery_delay"
            ? 1.1
            : 1.0),
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    console.log("Generated alerts count:", prioritizedAlerts.length);
    return NextResponse.json(prioritizedAlerts);
  } catch (error) {
    console.error("Error generating predictive alerts:", error);
    return NextResponse.json(
      { error: "Failed to generate alerts", details: error },
      { status: 500 }
    );
  }
}
