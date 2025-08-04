"use client";

import { Card, CardContent } from "@/components/ui/";
import {
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState, useEffect } from "react";

interface KpiData {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalProducts: number;
  productsGrowth: number;
  totalEnquiries: number;
  enquiriesGrowth?: number;
}

export function KpiCards() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKpiData() {
      try {
        const res = await fetch("/api/admin/kpi-metrics");
        const data = await res.json();
        console.log("KPI data:", data);
        setKpiData(data);
      } catch (error) {
        console.error("Failed to fetch KPI data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchKpiData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  const renderGrowthIndicator = (growth: number, showBackground = true) => {
    const isPositive = growth >= 0;
    const isNeutral = growth === 0;

    if (isNeutral) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            <Activity className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-500">0.00%</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            showBackground
              ? isPositive
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : "bg-red-100 dark:bg-red-900/30"
              : ""
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`text-xs font-medium ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {Math.abs(growth).toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card
          key={i}
          className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-lg"
        >
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  const kpiCards = [
    {
      title: "Total Revenue",
      value: kpiData ? formatCurrency(kpiData.totalRevenue) : formatCurrency(0),
      growth: kpiData?.revenueGrowth || 0,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-600",
      bgGradient:
        "from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/10",
      description: "Revenue this period",
    },
    {
      title: "Total Orders",
      value: kpiData ? formatNumber(kpiData.totalOrders) : "0",
      growth: kpiData?.ordersGrowth || 0,
      icon: ShoppingBag,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient:
        "from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10",
      description: "Orders received",
    },
    {
      title: "Published Products",
      value: kpiData ? formatNumber(kpiData.totalProducts) : "0",
      growth: kpiData?.productsGrowth || 0,
      icon: Package,
      gradient: "from-orange-500 to-amber-600",
      bgGradient:
        "from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-900/10",
      description: "Active products",
    },
    {
      title: "Open Enquiries",
      value: kpiData ? formatNumber(kpiData.totalEnquiries) : "0",
      growth: kpiData?.enquiriesGrowth || 0,
      icon: Users,
      gradient: "from-purple-500 to-violet-600",
      bgGradient:
        "from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10",
      description: "Pending enquiries",
      hideGrowth: !kpiData?.enquiriesGrowth, // Hide growth if not provided
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={index}
            className={`bg-gradient-to-br ${card.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {card.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {card.value}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                  <div
                    className={`p-3 bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg flex items-center justify-center`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Growth Indicator */}
                {!card.hideGrowth && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    {renderGrowthIndicator(card.growth)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      vs last period
                    </span>
                  </div>
                )}

                {card.hideGrowth && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Real-time data
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
