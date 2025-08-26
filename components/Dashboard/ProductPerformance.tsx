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
} from "recharts";

interface ProductPerformanceData {
  categoryPerformance: Array<{
    category: string;
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
    category: string;
  }>;
  topStockProducts: Array<{
    name: string;
    price: number | null;
    stock: number;
    category: string;
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
                    {category.category}
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
                  <XAxis
                    dataKey="priceRange"
                    label={{
                      value: "Price Range",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#3b82f6", fontSize: 13 },
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Products",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fill: "#3b82f6", fontSize: 13 },
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="products" fill="#3b82f6" />
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
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.category}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-green-600 dark:text-green-400 font-bold">
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
