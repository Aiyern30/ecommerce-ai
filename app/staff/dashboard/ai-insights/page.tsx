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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import { TypographyH1 } from "@/components/ui/Typography";

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
  type: "stockout" | "demand_spike" | "delivery_delay" | "price_change";
  product: string;
  probability: number;
  timeframe: string;
  impact: string;
  action: string;
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
      console.log("Starting to fetch AI insights..."); // Debug log

      // Fetch daily summary
      try {
        const summaryResponse = await fetch("/api/ai-insights/daily-summary");
        console.log("Summary response status:", summaryResponse.status); // Debug log

        if (summaryResponse.ok) {
          const summary = await summaryResponse.json();
          console.log("Daily summary data:", summary); // Debug log
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
        console.log("Alerts response status:", alertsResponse.status); // Debug log

        if (alertsResponse.ok) {
          const alerts = await alertsResponse.json();
          console.log("Predictive alerts data:", alerts); // Debug log
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

      // Fetch general insights
      try {
        const insightsResponse = await fetch("/api/ai-insights/general");
        console.log("Insights response status:", insightsResponse.status); // Debug log

        if (insightsResponse.ok) {
          const generalInsights = await insightsResponse.json();
          console.log("General insights data:", generalInsights); // Debug log
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <TypographyH1 className="!mb-0">AI Insights Dashboard</TypographyH1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
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
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Daily AI Summary -{" "}
              {new Date(dailySummary.date).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Top Product</span>
                </div>
                <p className="font-semibold">
                  {dailySummary.topSellingProduct}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Order Growth</span>
                </div>
                <p className="font-semibold text-green-600">
                  +{dailySummary.orderGrowth}%
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">
                    Contractor Activity
                  </span>
                </div>
                <p className="font-semibold text-blue-600">
                  +{dailySummary.contractorActivity}%
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Stock Risks</span>
                </div>
                <p className="text-sm text-red-600">
                  {dailySummary.stockRisks.join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Predictive Analytics & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {predictiveAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${getAlertTypeColor(
                    alert.type
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-xs">
                          {alert.probability}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.timeframe}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1">
                        {alert.type.replace("_", " ").toUpperCase()}:{" "}
                        {alert.product}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {alert.impact}
                      </p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        💡 Recommended Action: {alert.action}
                      </p>
                    </div>
                    <Bell className="w-5 h-5 text-orange-500 animate-pulse" />
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
