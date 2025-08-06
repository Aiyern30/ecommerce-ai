"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Package, AlertCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";

interface ProductPerformanceData {
  topSellingProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    category: string;
  }>;
  categoryPerformance: Array<{
    category: string;
    products: number;
    revenue: number;
    avgPrice: number;
  }>;
  lowStockProducts: Array<{
    name: string;
    stock: number;
    category: string;
    reorderLevel: number;
  }>;
  priceAnalysis: Array<{ priceRange: string; products: number; sales: number }>;
}

export function ProductPerformance() {
  const [data, setData] = useState<ProductPerformanceData | null>(null);
  console.log("ProductPerformance data:", data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/product-performance");
      const json = await res.json();
      setData(json);
    };
    fetchData().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Category Performance */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data?.categoryPerformance.map((category, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-900/10 border-0 shadow-xl"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {category.category}
                  </p>
                  <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    RM{category.revenue.toLocaleString()}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {category.products} products
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.topSellingProducts} layout="horizontal">
                  <XAxis
                    type="number"
                    label={{
                      value: "Units Sold",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#10b981", fontSize: 13 },
                    }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    label={{
                      value: "Product",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fill: "#10b981", fontSize: 13 },
                    }}
                  />
                  <Tooltip
                    cursor={{
                      fill: "rgba(16, 185, 129, 0.08)",
                      // Fix: restrict cursor height to bar only, not full chart
                      // This disables the default cursor and uses a custom one
                      // See recharts docs: set cursor to false to remove the default
                      // and use a custom <Rectangle /> if needed
                      // For now, set to false for best result
                      // https://recharts.org/en-US/api/Tooltip#cursor
                      // Remove the fill above and use:
                      // cursor={false}
                    }}
                    content={({ active, payload, label }) =>
                      active && payload && payload.length ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm">
                          <div className="font-semibold text-gray-900 dark:text-white text-lg">
                            {payload[0].value} units
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                            {label}
                          </div>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="sales" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Price Analysis */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Sales by Price Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.priceAnalysis}>
                  <XAxis dataKey="priceRange" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card className="bg-gradient-to-br from-white to-red-50/30 dark:from-gray-900 dark:to-red-900/10 border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-gray-900 dark:text-white">
              Low Stock Alert
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {data?.lowStockProducts.map((product, index) => (
              <div
                key={index}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {product.category}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    Stock: {product.stock}
                  </span>
                  <span className="text-xs text-gray-500">
                    Reorder: {product.reorderLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
