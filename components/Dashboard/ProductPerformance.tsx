"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Package, AlertCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductPerformanceData {
  categoryPerformance: Array<{
    product_type: string;
    avgPrice: number;
    totalStock: number;
    totalProducts: number;
  }>;
  priceAnalysis: Array<{
    priceRange: string;
    products: number;
  }>;
  lowStockProducts: Array<{
    name: string;
    price: number | null;
    stock: number;
    product_type: string;
  }>;
  topStockProducts: Array<{
    name: string;
    price: number | null;
    stock: number;
    product_type: string;
  }>;
  topSellingProducts: Array<{
    name: string;
    product_type: string;
    productId: string;
    totalSold: number;
    totalRevenue: number;
  }>;
}

export function ProductPerformance() {
  const [data, setData] = useState<ProductPerformanceData | null>(null);
  console.log("Product Performance Data:", data);
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
                    {category.product_type}
                  </p>
                  <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    Avg Price: RM{category.avgPrice.toLocaleString()}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {category.totalProducts} products • {category.totalStock} in
                    stock
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
        {/* Price Analysis */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Products by Price Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.priceAnalysis}>
                  <defs>
                    <linearGradient
                      id="priceRangeBar"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="priceRange"
                    label={{
                      value: "Price Range",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#3b82f6", fontSize: 13 },
                    }}
                    tick={{ fontSize: 12, fill: "#3b82f6" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    label={{
                      value: "Products",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fill: "#6366f1", fontSize: 13 },
                    }}
                    tick={{ fontSize: 12, fill: "#6366f1" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(59, 130, 246, 0.12)" }}
                    content={({ active, payload, label }) =>
                      active && payload && payload.length ? (
                        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm">
                          <div className="font-semibold text-blue-700 dark:text-blue-200 text-lg">
                            {payload[0].value} products
                          </div>
                          <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            {label}
                          </div>
                        </div>
                      ) : null
                    }
                  />
                  <Bar
                    dataKey="products"
                    fill="url(#priceRangeBar)"
                    radius={[8, 8, 0, 0]}
                    barSize={32}
                    className="transition-all duration-200"
                  >
                    {data?.priceAnalysis.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        cursor="pointer"
                        fill="url(#priceRangeBar)"
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Stock Products */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Top Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {data?.topStockProducts.map((product, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-green-200 dark:border-green-800 shadow-sm transition-all duration-200
                    bg-gradient-to-br from-green-50/60 via-emerald-50/40 to-blue-50/60 dark:from-green-900/40 dark:via-emerald-900/30 dark:to-blue-900/40
                    hover:shadow-md hover:scale-[1.01] opacity-90"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.product_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        Stock: {product.stock}
                      </span>
                      <span className="text-xs text-gray-500">
                        Price:{" "}
                        {product.price !== null ? `RM${product.price}` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {data?.topSellingProducts.slice(0, 5).map((product) => (
              <div
                key={product.productId}
                className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm transition-all duration-200
                  bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-900/40 dark:via-indigo-900/30 dark:to-purple-900/40
                  hover:shadow-md hover:scale-[1.01] opacity-90"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.product_type}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      Total Sold: {product.totalSold}
                    </span>
                    <span className="text-xs text-gray-500">
                      Revenue: RM{product.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                  {product.product_type}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    Stock: {product.stock}
                  </span>
                  <span className="text-xs text-gray-500">
                    Price:{" "}
                    {product.price !== null ? `RM${product.price}` : "N/A"}
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
