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
  Target,
  Zap,
  RefreshCw,
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
import InsightCard from "@/components/InsightCard";

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
  currentStock?: number;
  suggestedRestock?: {
    amount: number;
    reasoning: string;
    targetLevel: number;
  };
  probability: number;
  timeframe: string;
  impact: string;
  action: string;
  priority?: number;
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

      try {
        const summaryResponse = await fetch("/api/ai-insights/daily-summary");

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
      if (process.env.NODE_ENV === "development") {
        console.log("Loading mock data for development...");
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAIInsights();
    const interval = setInterval(loadAIInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAIInsights]);

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

  const getProductEditLink = (alert: PredictiveAlert) => {
    if (alert.productId) {
      return `/staff/products/${alert.productId}/edit`;
    }

    if (
      alert.product === "Multiple Orders" ||
      alert.product === "Order Processing System"
    ) {
      return "/staff/orders";
    }

    if (alert.product === "All Concrete Products") {
      return "/staff/products";
    }

    return `/staff/products?search=${encodeURIComponent(alert.product)}`;
  };

  const getProductViewLink = (alert: PredictiveAlert) => {
    if (alert.productId) {
      return `/staff/products/${alert.productId}`;
    }

    if (
      alert.product === "Multiple Orders" ||
      alert.product === "Order Processing System"
    ) {
      return "/staff/orders?status=processing";
    }

    if (alert.product === "All Concrete Products") {
      return "/staff/products?type=concrete";
    }

    return `/staff/products?search=${encodeURIComponent(alert.product)}`;
  };

  return (
    <div className="space-y-6">
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
            <div className="space-y-6">
              {/* AI Processing Header */}
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI is Analyzing Your Data
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generating predictive insights and recommendations...
                    </p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"
                    style={{ width: "70%" }}
                  ></div>
                </div>
              </div>

              {/* AI Processing Steps */}
              <div className="grid gap-4">
                {[
                  {
                    step: "Analyzing inventory patterns...",
                    icon: "📊",
                    delay: "0s",
                  },
                  {
                    step: "Processing sales trends...",
                    icon: "📈",
                    delay: "1s",
                  },
                  {
                    step: "Generating predictions...",
                    icon: "🔮",
                    delay: "2s",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50"
                    style={{ animationDelay: item.delay }}
                  >
                    <div
                      className="text-2xl animate-bounce"
                      style={{ animationDelay: item.delay }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.step}
                        </span>
                        <div className="flex gap-1">
                          <div
                            className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0s" }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ))}
              </div>

              {/* Mock Alert Cards Being Generated */}
              <div className="space-y-4 mt-6">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                  Generating alerts...
                </div>

                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 animate-pulse"></div>

                    <div className="p-6 pl-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Badges skeleton */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="h-5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full w-20 animate-pulse"></div>
                            <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full w-16 animate-pulse"></div>
                            <div className="h-5 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full w-24 animate-pulse"></div>
                          </div>

                          {/* Title skeleton */}
                          <div className="space-y-2">
                            <div className="h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded w-1/2 animate-pulse"></div>
                          </div>

                          {/* Content skeleton */}
                          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-dashed border-gray-300 dark:border-gray-600">
                            <div className="space-y-2">
                              <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-full animate-pulse"></div>
                              <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-5/6 animate-pulse"></div>
                              <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-4/6 animate-pulse"></div>
                            </div>
                          </div>

                          {/* Action buttons skeleton */}
                          <div className="flex gap-2 pt-2">
                            <div className="h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded w-24 animate-pulse"></div>
                            <div className="h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded w-20 animate-pulse"></div>
                          </div>
                        </div>

                        {/* Priority indicator skeleton */}
                        <div className="flex flex-col items-center space-y-2">
                          <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-yellow-300 to-orange-300 animate-pulse flex items-center justify-center">
                            <Bell className="w-6 h-6 text-white animate-pulse" />
                          </div>
                          <div className="text-center">
                            <div className="h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded w-12 animate-pulse mb-1"></div>
                            <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-10 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Processing Footer */}
              <div className="text-center py-4 border-t border-dashed border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="font-medium">
                    AI processing complete in a few moments
                  </span>
                </div>
              </div>
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

                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border">
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-medium">Impact:</span>{" "}
                            {alert.impact}
                          </p>

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

                          {alert.type === "demand_spike" && alert.productId && (
                            <DemandSpikeStockInfo
                              productId={alert.productId}
                              growthRate={extractGrowthRate(alert.impact)}
                            />
                          )}
                        </div>

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

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              General AI Insights
            </h2>
          </div>
          {insights.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {insights.length} insight{insights.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {loading && insights.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="p-6 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Insights Available
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4 leading-relaxed">
                AI insights will appear here once sufficient data is collected.
                Check back later for personalized recommendations.
              </p>
              <Button
                onClick={loadAIInsights}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {/* Insights summary for mobile */}
        {insights.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200 dark:border-purple-800/50 sm:hidden">
            <div className="text-center">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                💡 <span className="font-medium">Quick Summary:</span>
                {insights.filter((i) => i.impact === "high").length > 0 &&
                  ` ${
                    insights.filter((i) => i.impact === "high").length
                  } high-impact insight${
                    insights.filter((i) => i.impact === "high").length > 1
                      ? "s"
                      : ""
                  }`}
                {insights.filter((i) => i.type === "recommendation").length >
                  0 &&
                  `, ${
                    insights.filter((i) => i.type === "recommendation").length
                  } recommendation${
                    insights.filter((i) => i.type === "recommendation").length >
                    1
                      ? "s"
                      : ""
                  }`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const extractGrowthRate = (impact: string): number => {
  const match = impact.match(/(\d+\.?\d*)% increase/);
  return match ? parseFloat(match[1]) : 0;
};
