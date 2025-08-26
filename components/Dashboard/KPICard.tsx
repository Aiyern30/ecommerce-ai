"use client";

import { Card, CardContent } from "@/components/ui/";
import { ShoppingBag, Package, Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { StatsCards } from "../StatsCards";
import { formatCurrency } from "@/lib/utils/currency";

interface KpiData {
  totalRevenue: number;
  revenueGrowth: number;
  revenueHasValidComparison: boolean;
  totalOrders: number;
  ordersGrowth: number;
  ordersHasValidComparison: boolean;
  totalProducts: number;
  productsGrowth: number;
  productsHasValidComparison: boolean;
  totalEnquiries: number;
}

export function KpiCards() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKpiData() {
      try {
        const res = await fetch("/api/admin/kpi-metrics");
        const data = await res.json();
        setKpiData(data);
      } catch (error) {
        console.error("Failed to fetch KPI data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchKpiData();
  }, []);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

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
      value: kpiData
        ? formatCurrency(kpiData.totalRevenue, true)
        : formatCurrency(0, true),
      growth: kpiData?.revenueGrowth || 0,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-600",
      bgGradient:
        "from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/10",
      description: "Revenue this period",
      hideGrowth: !kpiData?.revenueHasValidComparison,
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
      hideGrowth: !kpiData?.ordersHasValidComparison,
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
      hideGrowth: !kpiData?.productsHasValidComparison,
    },
    {
      title: "Open Enquiries",
      value: kpiData ? formatNumber(kpiData.totalEnquiries) : "0",
      growth: 0,
      icon: Users,
      gradient: "from-purple-500 to-violet-600",
      bgGradient:
        "from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10",
      description: "Pending enquiries",
      hideGrowth: true,
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {kpiCards.map((card, index) => (
        <StatsCards key={index} {...card} />
      ))}
    </div>
  );
}
