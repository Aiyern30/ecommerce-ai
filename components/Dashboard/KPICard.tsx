"use client";

import { Card, CardContent } from "@/components/ui/";
import {
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Package,
  Users,
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
    }).format(amount);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  const renderGrowthIndicator = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <div className="flex items-center gap-1 text-sm">
        <span
          className={`font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {Math.abs(growth).toFixed(2)}%
        </span>
        {isPositive ? (
          <ChevronUp className="h-4 w-4 text-green-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-red-600" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold">
                  {kpiData
                    ? formatCurrency(kpiData.totalRevenue)
                    : formatCurrency(0)}
                </h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                RM
              </div>
            </div>
            {kpiData && renderGrowthIndicator(kpiData.revenueGrowth)}
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <h3 className="text-2xl font-bold">
                  {kpiData ? formatNumber(kpiData.totalOrders) : "0"}
                </h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            {kpiData && renderGrowthIndicator(kpiData.ordersGrowth)}
          </div>
        </CardContent>
      </Card>

      {/* Total Products */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Published Products
                </p>
                <h3 className="text-2xl font-bold">
                  {kpiData ? formatNumber(kpiData.totalProducts) : "0"}
                </h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Package className="h-4 w-4" />
              </div>
            </div>
            {kpiData && renderGrowthIndicator(kpiData.productsGrowth)}
          </div>
        </CardContent>
      </Card>

      {/* Open Enquiries */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Open Enquiries
                </p>
                <h3 className="text-2xl font-bold">
                  {kpiData ? formatNumber(kpiData.totalEnquiries) : "0"}
                </h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
