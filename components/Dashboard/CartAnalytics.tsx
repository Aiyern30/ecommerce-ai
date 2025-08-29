"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { ShoppingCart, AlertTriangle, TrendingDown, Clock } from "lucide-react";
import { StatsCards } from "@/components/StatsCards";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CartAnalyticsData {
  abandonedCarts: number;
  averageCartValue: number;
  conversionRate: number;
  cartsByHour: Array<{ hour: string; carts: number; abandoned: number }>;
  topAbandonedProducts: Array<{
    name: string;
    abandoned_count: number;
    value: number;
  }>;
  cartAgeDistribution: Array<{
    ageRange: string;
    count: number;
    color: string;
  }>;
}

export function CartAnalytics() {
  const [data, setData] = useState<CartAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/cart-analytics");
      const json = await res.json();
      setData(json);
    };
    fetchData().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCards
          title="Abandoned Carts"
          value={data?.abandonedCarts?.toString() || "0"}
          description="Last 30 days"
          icon={AlertTriangle}
          gradient="from-red-500 to-red-600"
          bgGradient="from-white to-red-50/30 dark:from-gray-900 dark:to-red-900/10"
          hideGrowth={true}
        />

        <StatsCards
          title="Avg Cart Value"
          value={formatCurrency(data?.averageCartValue || 0, true)}
          description="Including abandoned"
          icon={ShoppingCart}
          gradient="from-blue-500 to-blue-600"
          bgGradient="from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10"
          hideGrowth={true}
        />

        <StatsCards
          title="Conversion Rate"
          value={`${data?.conversionRate || 0}%`}
          description="Cart to order"
          icon={TrendingDown}
          gradient="from-green-500 to-green-600"
          bgGradient="from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10"
          hideGrowth={true}
        />

        <StatsCards
          title="Recovery Potential"
          value={formatCurrency(
            (data?.abandonedCarts || 0) * (data?.averageCartValue || 0),
            true
          )}
          description="Lost revenue"
          icon={Clock}
          gradient="from-purple-500 to-purple-600"
          bgGradient="from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10"
          hideGrowth={true}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Cart Activity by Time Period (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.cartsByHour}
                  margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                  barCategoryGap="20%"
                  maxBarSize={80}
                >
                  <XAxis
                    dataKey="hour"
                    type="category"
                    interval={0}
                    tick={{ fontSize: 10 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tickLine={false}
                    axisLine={{ stroke: "#374151", strokeWidth: 1 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#374151", strokeWidth: 1 }}
                    label={{
                      value: "Carts",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fill: "#6b7280",
                        fontSize: 12,
                        fontWeight: 500,
                      },
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
                    content={({ active, payload, label }) =>
                      active && payload && payload.length ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                            {label}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Total:{" "}
                                <span className="font-semibold">
                                  {
                                    payload.find((p) => p.dataKey === "carts")
                                      ?.value
                                  }
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded"></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Abandoned:{" "}
                                <span className="font-semibold">
                                  {
                                    payload.find(
                                      (p) => p.dataKey === "abandoned"
                                    )?.value
                                  }
                                </span>
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
                              Conversion:{" "}
                              {payload.find((p) => p.dataKey === "carts")
                                ?.value &&
                              (payload.find((p) => p.dataKey === "carts")
                                ?.value as number) > 0
                                ? (
                                    (((payload.find(
                                      (p) => p.dataKey === "carts"
                                    )?.value as number) -
                                      ((payload.find(
                                        (p) => p.dataKey === "abandoned"
                                      )?.value as number) || 0)) /
                                      (payload.find(
                                        (p) => p.dataKey === "carts"
                                      )?.value as number)) *
                                    100
                                  ).toFixed(1)
                                : "0"}
                              %
                            </div>
                          </div>
                        </div>
                      ) : null
                    }
                  />
                  <Bar
                    dataKey="carts"
                    fill="#3b82f6"
                    name="Total Carts"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="abandoned"
                    fill="#ef4444"
                    name="Abandoned"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {data?.cartsByHour && data.cartsByHour.length === 0 && (
              <div className="flex items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No cart activity</p>
                  <p className="text-sm">
                    No carts created in the last 30 days
                  </p>
                </div>
              </div>
            )}
            {data?.cartsByHour && data.cartsByHour.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {data.cartsByHour.reduce(
                        (sum, item) => sum + item.carts,
                        0
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Carts
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {data.cartsByHour.reduce(
                        (sum, item) => sum + item.abandoned,
                        0
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Abandoned
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {data.cartsByHour.length > 0 &&
                      data.cartsByHour.reduce(
                        (sum, item) => sum + item.carts,
                        0
                      ) > 0
                        ? (
                            (data.cartsByHour.reduce(
                              (sum, item) =>
                                sum + (item.carts - item.abandoned),
                              0
                            ) /
                              data.cartsByHour.reduce(
                                (sum, item) => sum + item.carts,
                                0
                              )) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Conversion
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Abandoned Cart Age
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col gap-4">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={data?.cartAgeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="count"
                    label={({ ageRange, count }) => `${ageRange}: ${count}`}
                  >
                    {data?.cartAgeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload && payload.length ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl shadow-xl">
                          <div className="font-semibold text-gray-900 dark:text-white text-lg">
                            {payload[0].payload.ageRange}
                          </div>
                          <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                            {payload[0].value} carts
                          </div>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Enhanced legend */}
              <div className="flex flex-wrap gap-4 justify-center mt-2">
                {data?.cartAgeDistribution.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: entry.color }}
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {entry.ageRange}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({entry.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Abandoned Products */}
      <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Most Abandoned Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.topAbandonedProducts?.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {product.name || "Unknown Product"}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.abandoned_count || 0} times abandoned
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(product.value)}
                  </p>
                  <p className="text-xs text-gray-500">Lost value</p>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No abandoned products data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
