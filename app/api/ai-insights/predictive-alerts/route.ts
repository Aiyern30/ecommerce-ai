/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const alerts = [];

    // 1. Stock-out predictions with better error handling
    try {
      const { data: lowStockProducts, error: stockError } = await supabaseAdmin
        .from("products")
        .select("id, name, stock_quantity, grade, product_type")
        .lt("stock_quantity", 300)
        .eq("status", "published")
        .order("stock_quantity", { ascending: true })
        .limit(10);

      if (stockError) {
        console.error("Error fetching low stock products:", stockError);
      } else {
        lowStockProducts?.forEach((product, index) => {
          if (product.stock_quantity < 150) {
            const currentStock = product.stock_quantity;
            const daysUntilStockout = Math.max(
              1,
              Math.floor(currentStock / 50)
            );
            const probability = Math.max(
              65,
              Math.min(95, 100 - currentStock / 2)
            );

            const restockSuggestion = calculateRestockAmount(
              product,
              currentStock
            );

            alerts.push({
              id: `stockout-${index}`,
              type: "stockout",
              product: product.name,
              productId: product.id,
              currentStock: currentStock,
              suggestedRestock: restockSuggestion,
              probability: Math.round(probability),
              timeframe:
                daysUntilStockout <= 2
                  ? "1-2 days"
                  : daysUntilStockout <= 5
                  ? "3-5 days"
                  : "Within a week",
              impact: `${
                currentStock < 50
                  ? "Critical"
                  : currentStock < 100
                  ? "High"
                  : "Medium"
              } - Current stock: ${currentStock} m³. 
                       Estimated depletion in ${daysUntilStockout} days. 
                       Suggested restock: ${restockSuggestion.amount} m³`,
              action:
                currentStock < 50
                  ? `URGENT: Emergency reorder of ${restockSuggestion.amount} m³ (${restockSuggestion.reasoning})`
                  : `Reorder ${restockSuggestion.amount} m³ of ${product.grade} grade within 48 hours. ${restockSuggestion.reasoning}`,
            });
          }
        });
      }
    } catch (stockoutError) {
      console.error("Stock-out analysis failed:", stockoutError);
    }

    // 2. Demand spike predictions with better error handling
    try {
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      const fourteenDaysAgo = new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000
      ).toISOString();

      const [recentOrdersResult, previousOrdersResult] = await Promise.all([
        supabaseAdmin
          .from("order_items")
          .select(`name, quantity, product_id, orders!inner(created_at)`)
          .gte("orders.created_at", sevenDaysAgo),
        supabaseAdmin
          .from("order_items")
          .select(`name, quantity, product_id, orders!inner(created_at)`)
          .gte("orders.created_at", fourteenDaysAgo)
          .lt("orders.created_at", sevenDaysAgo),
      ]);

      const { data: recentOrders, error: recentError } = recentOrdersResult;
      const { data: previousOrders, error: previousError } =
        previousOrdersResult;

      if (recentError) {
        console.error("Error fetching recent orders:", recentError);
      }
      if (previousError) {
        console.error("Error fetching previous orders:", previousError);
      }

      if (recentOrders && previousOrders) {
        const recentDemand = recentOrders.reduce((acc, item) => {
          const key = `${item.product_id}:${item.name}`;
          acc[key] = (acc[key] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>);

        const previousDemand = previousOrders.reduce((acc, item) => {
          const key = `${item.product_id}:${item.name}`;
          acc[key] = (acc[key] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>);

        for (const [productKey, currentWeek] of Object.entries(recentDemand)) {
          try {
            const previousWeek = previousDemand[productKey] || 0;
            const growthRate =
              previousWeek > 0
                ? ((currentWeek - previousWeek) / previousWeek) * 100
                : 0;

            if (growthRate > 30 && currentWeek > 100) {
              const [productId, productName] = productKey.split(":");

              const { data: productInfo, error: productError } =
                await supabaseAdmin
                  .from("products")
                  .select("stock_quantity, grade, product_type")
                  .eq("id", productId)
                  .single();

              if (productError) {
                console.error(
                  `Error fetching product ${productId}:`,
                  productError
                );
                continue;
              }

              const currentStock = productInfo?.stock_quantity || 0;
              const suggestedIncrease = Math.min(
                Math.round((growthRate / 100) * currentStock),
                2000
              );

              alerts.push({
                id: `demand-spike-${productId}`,
                type: "demand_spike",
                product: productName,
                productId: productId,
                currentStock: currentStock,
                suggestedRestock: {
                  amount: suggestedIncrease,
                  reasoning: `Based on ${growthRate.toFixed(
                    1
                  )}% demand growth, recommend increasing stock to meet projected demand`,
                  targetLevel: currentStock + suggestedIncrease,
                },
                probability: Math.min(90, 60 + Math.floor(growthRate / 5)),
                timeframe: "Next 7-14 days",
                impact: `High growth trend: ${growthRate.toFixed(
                  1
                )}% increase (${currentWeek} m³ vs ${previousWeek} m³ last week). Current stock: ${currentStock} m³`,
                action: `Increase inventory by ${suggestedIncrease} m³ (${
                  currentStock > 0
                    ? ((suggestedIncrease / currentStock) * 100).toFixed(1)
                    : 0
                }% increase) and alert procurement team about trending demand`,
              });
            }
          } catch (itemError) {
            console.error(`Error processing product ${productKey}:`, itemError);
            continue;
          }
        }
      }
    } catch (demandError) {
      console.error("Demand spike analysis failed:", demandError);
    }

    // 3. Seasonal/weather-based predictions with error handling
    try {
      const currentMonth = new Date().getMonth() + 1;
      if ([6, 7, 8].includes(currentMonth)) {
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

      // Add monsoon season alerts for Malaysia (Nov-Mar)
      if ([11, 12, 1, 2, 3].includes(currentMonth)) {
        alerts.push({
          id: "monsoon-alert",
          type: "weather_impact",
          product: "Tremie Concrete Products",
          probability: 80,
          timeframe: "Next 4-6 weeks",
          impact:
            "Monsoon season - increased demand for tremie concrete due to water table issues",
          action:
            "Stock up on tremie 1, 2, and 3 grades. Prepare waterproofing additives.",
        });
      }
    } catch (weatherError) {
      console.error("Weather analysis failed:", weatherError);
    }

    // 4. Enhanced price volatility alerts with error handling
    try {
      const { data: highDemandLowStock, error: priceError } =
        await supabaseAdmin
          .from("products")
          .select("id, name, stock_quantity, normal_price, grade, product_type")
          .lt("stock_quantity", 500)
          .order("stock_quantity", { ascending: true })
          .limit(3);

      if (priceError) {
        console.error("Error fetching price optimization data:", priceError);
      } else if (highDemandLowStock && highDemandLowStock.length > 0) {
        const product = highDemandLowStock[0];

        let priceIncrease = "5-10%";
        if (
          product.product_type === "concrete" &&
          product.grade.includes("S")
        ) {
          priceIncrease = "8-12%";
        } else if (product.product_type === "mortar") {
          priceIncrease = "3-8%";
        }

        alerts.push({
          id: `price-optimization-${product.id}`,
          type: "price_optimization",
          product: product.name,
          productId: product.id,
          currentStock: product.stock_quantity,
          probability: 82,
          timeframe: "Immediate",
          impact: `Low stock + market demand = pricing opportunity. Current: RM${product.normal_price}. Market supports ${priceIncrease} increase.`,
          action: `Consider ${priceIncrease} price increase due to supply constraints. Monitor competitor pricing and customer response.`,
        });
      }
    } catch (priceError) {
      console.error("Price optimization analysis failed:", priceError);
    }

    try {
      const { data: processingOrders, error: deliveryError } =
        await supabaseAdmin
          .from("orders")
          .select("id, created_at, status")
          .eq("status", "processing")
          .lt(
            "created_at",
            new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          );

      if (deliveryError) {
        console.error("Error fetching processing orders:", deliveryError);
      } else if (processingOrders && processingOrders.length > 3) {
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
    } catch (deliveryError) {
      console.error("Delivery analysis failed:", deliveryError);
    }

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

    return NextResponse.json(prioritizedAlerts);
  } catch (error) {
    console.error("Error generating predictive alerts:", error);

    return NextResponse.json(
      {
        error: "Failed to generate alerts",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function calculateRestockAmount(
  product: {
    id: any;
    name: any;
    stock_quantity: any;
    grade: any;
    product_type: any;
  },
  currentStock: number
) {
  try {
    let baseAmount = 1000;
    let reasoning = "";

    const grade = product.grade || "";
    const productType = product.product_type || "";
    const currentMonth = new Date().getMonth() + 1;

    let seasonalMultiplier = 1.0;
    if ([6, 7, 8, 11, 12, 1, 2, 3].includes(currentMonth)) {
      seasonalMultiplier = 1.3;
      reasoning += " + Seasonal demand increase";
    }

    if (productType === "concrete") {
      if (grade.includes("N25") || grade.includes("N20")) {
        baseAmount = 1500;
        reasoning = "Popular residential grades - high turnover expected";
      } else if (grade.includes("S40") || grade.includes("S45")) {
        baseAmount = 600;
        reasoning = "Premium structural grade - specialized applications";
      } else if (grade.includes("S30") || grade.includes("S35")) {
        baseAmount = 800;
        reasoning = "Commercial structural grade - steady demand";
      } else if (grade.includes("N15") || grade.includes("N10")) {
        baseAmount = 1200;
        reasoning = "General purpose grade - consistent usage";
      }
    } else if (productType === "mortar") {
      if (grade.includes("M034")) {
        baseAmount = 700;
        reasoning = "High-strength mortar - structural masonry applications";
      } else if (grade.includes("M044")) {
        baseAmount = 850;
        reasoning = "Standard structural mortar - balanced demand";
      } else if (grade.includes("M054")) {
        baseAmount = 1000;
        reasoning = "Most popular mortar ratio - high demand";
      } else if (grade.includes("M064")) {
        baseAmount = 600;
        reasoning = "General purpose mortar - moderate usage";
      }
    }

    baseAmount = Math.round(baseAmount * seasonalMultiplier);

    if (currentStock < 20) {
      baseAmount *= 2.5;
      reasoning += " + CRITICAL emergency restock required";
    } else if (currentStock < 50) {
      baseAmount *= 1.8;
      reasoning += " + High priority restock needed";
    } else if (currentStock < 100) {
      baseAmount *= 1.3;
      reasoning += " + Standard restock recommended";
    }

    const popularGrades = ["N25", "N20", "M054", "M044"];
    if (popularGrades.some((pg) => grade.includes(pg))) {
      baseAmount *= 1.2;
      reasoning += " + Popular grade buffer applied";
    }

    const targetStock = Math.max(baseAmount, 1200 - currentStock);

    return {
      amount: Math.round(targetStock),
      reasoning:
        reasoning || "Standard restock calculation based on grade and demand",
      targetLevel: Math.round(currentStock + targetStock),
    };
  } catch (error) {
    console.error("Error calculating restock amount:", error);
    return {
      amount: 1000,
      reasoning: "Standard restock calculation (calculation error occurred)",
      targetLevel: currentStock + 1000,
    };
  }
}
