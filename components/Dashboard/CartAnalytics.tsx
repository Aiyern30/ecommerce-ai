"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { ShoppingCart, AlertTriangle, TrendingDown, Clock } from "lucide-react";
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
        <Card className="bg-gradient-to-br from-white to-red-50/30 dark:from-gray-900 dark:to-red-900/10 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Abandoned Carts
                </p>
                <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {data?.abandonedCarts}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Cart Value
                </p>
                <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  RM{data?.averageCartValue.toFixed(2)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Including abandoned
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </p>
                <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {data?.conversionRate}%
                </h3>
                <p className="text-xs text-gray-500 mt-1">Cart to order</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Recovery Potential
                </p>
                <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  RM
                  {(
                    (data?.abandonedCarts || 0) * (data?.averageCartValue || 0)
                  ).toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Lost revenue</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Cart Activity by Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.cartsByHour}>
                  <XAxis
                    dataKey="hour"
                    label={{
                      value: "Hour",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#6b7280", fontSize: 13 },
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Carts",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fill: "#6b7280", fontSize: 13 },
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
                    content={({ active, payload, label }) =>
                      active && payload && payload.length ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm">
                          <div className="font-semibold text-gray-900 dark:text-white text-lg">
                            {payload.find((p) => p.dataKey === "carts")?.value}{" "}
                            Carts
                          </div>
                          <div className="font-semibold text-red-600 dark:text-red-400 text-lg">
                            {
                              payload.find((p) => p.dataKey === "abandoned")
                                ?.value
                            }{" "}
                            Abandoned
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                            {label}
                          </div>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="carts" fill="#3b82f6" name="Total Carts" />
                  <Bar dataKey="abandoned" fill="#ef4444" name="Abandoned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
            {data?.topAbandonedProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.abandoned_count} times abandoned
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600 dark:text-red-400">
                    RM{product.value}
                  </p>
                  <p className="text-xs text-gray-500">Lost value</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
