/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Package,
  Users,
  Calendar,
  Bell,
  BarChart3,
  Target,
  Zap,
  RefreshCw,
  Sparkles,
  Lightbulb,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import { TypographyH1, TypographyP } from "@/components/ui/Typography";
import { formatDate } from "@/lib/utils/format";
import { formatCurrency } from "@/lib/utils/currency";
import { StatsCards } from "@/components/StatsCards";
import Link from "next/link";
import DemandSpikeStockInfo from "@/components/DemandSpikeStockInfo";

interface AIInsight {
  id: string;
  type: "sales" | "prediction" | "alert" | "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  timestamp: string;
  data?: any;
}

interface DailySummary {
  date: string;
  topSellingProduct: string;
  orderGrowth: number;
  contractorActivity: number;
  stockRisks: string[];
  revenue: number;
  newCustomers: number;
}

interface PredictiveAlert {
  id: string;
  type:
    | "stockout"
    | "demand_spike"
    | "delivery_delay"
    | "price_change"
    | "weather_impact"
    | "price_optimization";
  product: string;
  productId?: string;
  currentStock?: number; // Add current stock
  suggestedRestock?: {
    // Add restock suggestion
    amount: number;
    reasoning: string;
    targetLevel: number;
  };
  probability: number;
  timeframe: string;
  impact: string;
  action: string;
  priority?: number; // Add priority field
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadAIInsights = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Starting to fetch AI insights...");

      // Fetch daily summary
      try {
        const summaryResponse = await fetch("/api/ai-insights/daily-summary");
        console.log("Summary response status:", summaryResponse.status);

        if (summaryResponse.ok) {
          const summary = await summaryResponse.json();
          console.log("Daily summary data:", summary);
          setDailySummary(summary);
        } else {
          console.error(
            "Failed to fetch daily summary:",
            summaryResponse.statusText
          );
        }
      } catch (summaryError) {
        console.error("Error fetching daily summary:", summaryError);
      }

      // Fetch predictive alerts
      try {
        const alertsResponse = await fetch(
          "/api/ai-insights/predictive-alerts"
        );

        if (alertsResponse.ok) {
          const alerts = await alertsResponse.json();
          setPredictiveAlerts(alerts);
        } else {
          console.error(
            "Failed to fetch predictive alerts:",
            alertsResponse.statusText
          );
        }
      } catch (alertsError) {
        console.error("Error fetching predictive alerts:", alertsError);
      }

      try {
        const insightsResponse = await fetch("/api/ai-insights/general");

        if (insightsResponse.ok) {
          const generalInsights = await insightsResponse.json();
          console.log("General insights data:", generalInsights);
          setInsights(generalInsights);
        } else {
          console.error(
            "Failed to fetch general insights:",
            insightsResponse.statusText
          );
        }
      } catch (insightsError) {
        console.error("Error fetching general insights:", insightsError);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load AI insights:", error);
      // Only load mock data if specifically requested or in development
      if (process.env.NODE_ENV === "development") {
        console.log("Loading mock data for development...");
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAIInsights();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAIInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAIInsights]);

  const loadMockData = () => {
    setDailySummary({
      date: new Date().toISOString().split("T")[0],
      topSellingProduct: "N25 Concrete",
      orderGrowth: 12,
      contractorActivity: 18,
      stockRisks: ["Mortar 1:4", "N30 Concrete"],
      revenue: 45600,
      newCustomers: 7,
    });

    setPredictiveAlerts([
      {
        id: "1",
        type: "stockout",
        product: "N25 Concrete",
        probability: 85,
        timeframe: "3-5 days",
        impact: "High - May affect 15+ pending orders",
        action: "Increase production order by 200 m³",
      },
      {
        id: "2",
        type: "demand_spike",
        product: "Mortar 1:3",
        probability: 72,
        timeframe: "Next week",
        impact: "Medium - Expected 40% demand increase",
        action: "Prepare additional inventory",
      },
    ]);

    setInsights([
      {
        id: "1",
        type: "sales",
        title: "Contractor Segment Growth",
        description:
          "Contractor customers increased orders by 15% this week, primarily for N25 and N30 grades.",
        impact: "high",
        confidence: 89,
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        type: "recommendation",
        title: "Pricing Optimization",
        description:
          "Consider 5% price increase on Mortar 1:4 - demand remains strong and competitors charge 8% more.",
        impact: "medium",
        confidence: 76,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sales":
        return <TrendingUp className="w-4 h-4" />;
      case "prediction":
        return <Target className="w-4 h-4" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4" />;
      case "recommendation":
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "stockout":
        return "border-red-300 bg-red-50 dark:bg-red-900/20";
      case "demand_spike":
        return "border-blue-300 bg-blue-50 dark:bg-blue-900/20";
      case "delivery_delay":
        return "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "border-gray-300 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  // Enhanced helper functions for navigation
  const getProductEditLink = (alert: PredictiveAlert) => {
    // If we have a specific product ID, go directly to edit
    if (alert.productId) {
      return `/staff/products/${alert.productId}/edit`;
    }

    // For system-wide alerts, go to relevant management pages
    if (
      alert.product === "Multiple Orders" ||
      alert.product === "Order Processing System"
    ) {
      return "/staff/orders";
    }

    if (alert.product === "All Concrete Products") {
      return "/staff/products";
    }

    // For products without ID, search in products list
    return `/staff/products?search=${encodeURIComponent(alert.product)}`;
  };

  const getProductViewLink = (alert: PredictiveAlert) => {
    // If we have a specific product ID, go directly to view
    if (alert.productId) {
      return `/staff/products/${alert.productId}`;
    }

    // For system-wide alerts
    if (
      alert.product === "Multiple Orders" ||
      alert.product === "Order Processing System"
    ) {
      return "/staff/orders?status=processing";
    }

    if (alert.product === "All Concrete Products") {
      return "/staff/products?type=concrete";
    }

    // For products without ID, search in products list
    return `/staff/products?search=${encodeURIComponent(alert.product)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <TypographyH1 className="!mb-0">AI Insights Dashboard</TypographyH1>
            <TypographyP className="text-gray-600 dark:text-gray-400 text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </TypographyP>
          </div>
        </div>

        <Button
          onClick={loadAIInsights}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Insights
        </Button>
      </div>

      {/* Daily Summary */}
      {dailySummary && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daily AI Summary - {formatDate(dailySummary.date)}
            </h2>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatsCards
              title="Top Selling Product"
              value={dailySummary.topSellingProduct}
              description="Best performer today"
              icon={Package}
              gradient="from-green-500 to-emerald-600"
              bgGradient="from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10"
              hideGrowth={true}
            />

            <StatsCards
              title="Order Growth"
              value={`${dailySummary.orderGrowth > 0 ? "+" : ""}${
                dailySummary.orderGrowth
              }%`}
              description="vs yesterday"
              growth={dailySummary.orderGrowth}
              icon={TrendingUp}
              gradient="from-blue-500 to-blue-600"
              bgGradient="from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10"
            />

            <StatsCards
              title="Daily Revenue"
              value={formatCurrency(dailySummary.revenue)}
              description="Yesterday's total"
              icon={DollarSign}
              gradient="from-purple-500 to-purple-600"
              bgGradient="from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10"
              hideGrowth={true}
            />

            <StatsCards
              title="New Customers"
              value={dailySummary.newCustomers.toString()}
              description="First-time buyers"
              icon={Users}
              gradient="from-orange-500 to-red-600"
              bgGradient="from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-900/10"
              hideGrowth={true}
            />
          </div>

          {/* Stock Risks Alert */}
          {dailySummary.stockRisks.length > 0 && (
            <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-red-800 dark:text-red-300">
                    Stock Risk Alert
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Low inventory detected: {dailySummary.stockRisks.join(", ")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Predictive Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Predictive Analytics & Alerts
            </div>
            {predictiveAlerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {predictiveAlerts.length} Active Alert
                {predictiveAlerts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <TypographyP className="text-sm text-gray-600 dark:text-gray-400">
            AI-powered predictions based on recent trends and inventory levels
          </TypographyP>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : predictiveAlerts.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  All Clear!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No immediate alerts detected. Your operations are running
                  smoothly.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {predictiveAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`relative overflow-hidden rounded-xl border-2 ${getAlertTypeColor(
                    alert.type
                  )} hover:shadow-lg transition-all duration-300`}
                >
                  {/* Priority stripe */}
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${
                      alert.probability > 80
                        ? "bg-red-500"
                        : alert.probability > 60
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  ></div>

                  <div className="p-6 pl-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header with badges */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Badge
                            className={`text-xs font-semibold ${
                              alert.probability > 80
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : alert.probability > 60
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {alert.probability}% Confidence
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.timeframe}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {alert.type.replace("_", " ")}
                          </Badge>
                        </div>

                        {/* Alert title and product */}
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {alert.type === "demand_spike"
                              ? "📈 Demand Surge Predicted"
                              : alert.type === "stockout"
                              ? "⚠️ Stock Depletion Risk"
                              : alert.type === "delivery_delay"
                              ? "🚚 Delivery Delays"
                              : "🔔 System Alert"}
                          </h3>
                          <p className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 break-words">
                            {alert.product}
                          </p>
                        </div>

                        {/* Enhanced impact description for all alert types */}
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border">
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-medium">Impact:</span>{" "}
                            {alert.impact}
                          </p>

                          {/* Show current stock and restock info for stock alerts */}
                          {alert.type === "stockout" &&
                            alert.currentStock !== undefined &&
                            alert.suggestedRestock && (
                              <div className="mt-2 p-2 sm:p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border-l-4 border-red-400">
                                <div className="text-xs space-y-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">
                                        Current Stock:
                                      </span>
                                      <span className="font-bold text-red-600 dark:text-red-400">
                                        {alert.currentStock} m³
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">
                                        Suggested Restock:
                                      </span>
                                      <span className="font-bold text-green-600 dark:text-green-400">
                                        +{alert.suggestedRestock.amount} m³
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      Target Level:
                                    </span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                      {alert.suggestedRestock.targetLevel} m³
                                    </span>
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400 italic mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded text-xs leading-relaxed">
                                    <span className="font-medium">
                                      Reasoning:
                                    </span>{" "}
                                    {alert.suggestedRestock.reasoning}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Enhanced info for demand spike alerts with current stock */}
                          {alert.type === "demand_spike" && alert.productId && (
                            <DemandSpikeStockInfo
                              productId={alert.productId}
                              growthRate={extractGrowthRate(alert.impact)}
                            />
                          )}
                        </div>

                        {/* Recommended action */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                          <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
                            💡{" "}
                            <span className="font-semibold">
                              Recommended Action:
                            </span>
                          </p>
                          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                            {alert.action}
                          </p>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <Link
                            href={getProductEditLink(alert)}
                            className="flex-1 sm:flex-initial"
                          >
                            <Button
                              size="sm"
                              variant="default"
                              className="text-xs w-full sm:w-auto"
                            >
                              {alert.type === "stockout"
                                ? "Manage Inventory"
                                : alert.type === "demand_spike"
                                ? "Adjust Stock"
                                : alert.type === "delivery_delay"
                                ? "Review Orders"
                                : "Take Action"}
                            </Button>
                          </Link>

                          <Link
                            href={getProductViewLink(alert)}
                            className="flex-1 sm:flex-initial"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs w-full sm:w-auto"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Right side indicator - hidden on mobile, shown as top indicator */}
                      <div className="lg:hidden flex items-center justify-between mb-3">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                            alert.probability > 80
                              ? "bg-red-100 dark:bg-red-900/30"
                              : alert.probability > 60
                              ? "bg-yellow-100 dark:bg-yellow-900/30"
                              : "bg-blue-100 dark:bg-blue-900/30"
                          }`}
                        >
                          <Bell
                            className={`w-4 h-4 ${
                              alert.probability > 80
                                ? "text-red-600"
                                : alert.probability > 60
                                ? "text-yellow-600"
                                : "text-blue-600"
                            }`}
                          />
                          <div className="text-center">
                            <div
                              className={`text-xs font-bold ${
                                alert.probability > 80
                                  ? "text-red-600"
                                  : alert.probability > 60
                                  ? "text-yellow-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {alert.probability > 80
                                ? "High"
                                : alert.probability > 60
                                ? "Medium"
                                : "Low"}{" "}
                              Priority
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop right side indicator */}
                      <div className="hidden lg:flex flex-col items-center space-y-2">
                        <div
                          className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
                            alert.probability > 80
                              ? "bg-red-100 dark:bg-red-900/30"
                              : alert.probability > 60
                              ? "bg-yellow-100 dark:bg-yellow-900/30"
                              : "bg-blue-100 dark:bg-blue-900/30"
                          }`}
                        >
                          <Bell
                            className={`w-6 h-6 animate-pulse ${
                              alert.probability > 80
                                ? "text-red-600"
                                : alert.probability > 60
                                ? "text-yellow-600"
                                : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-xs font-bold ${
                              alert.probability > 80
                                ? "text-red-600"
                                : alert.probability > 60
                                ? "text-yellow-600"
                                : "text-blue-600"
                            }`}
                          >
                            {alert.probability > 80
                              ? "High"
                              : alert.probability > 60
                              ? "Medium"
                              : "Low"}
                          </div>
                          <div className="text-xs text-gray-500">Priority</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* General AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(insight.type)}
                  {insight.title}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs ${getImpactColor(insight.impact)}`}
                  >
                    {insight.impact} impact
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                {insight.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Generated: {new Date(insight.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Powered Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
            >
              <BarChart3 className="w-5 h-5 mb-2" />
              <span className="font-medium">Generate Sales Report</span>
              <span className="text-xs text-gray-500">
                AI-powered weekly analysis
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
            >
              <Target className="w-5 h-5 mb-2" />
              <span className="font-medium">Demand Forecast</span>
              <span className="text-xs text-gray-500">
                Next 30 days prediction
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
            >
              <Package className="w-5 h-5 mb-2" />
              <span className="font-medium">Inventory Optimization</span>
              <span className="text-xs text-gray-500">
                AI stock recommendations
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to extract growth rate from impact text
const extractGrowthRate = (impact: string): number => {
  const match = impact.match(/(\d+\.?\d*)% increase/);
  return match ? parseFloat(match[1]) : 0;
};
