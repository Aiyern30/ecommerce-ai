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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // This would query:
      // - Products with highest order_items count
      // - Revenue by category
      // - Stock levels vs sales velocity
      // - Price distribution analysis

      const mockData: ProductPerformanceData = {
        topSellingProducts: [
          {
            name: "Premium Oak Flooring",
            sales: 145,
            revenue: 181250,
            category: "Flooring",
          },
          {
            name: "Bamboo Panels",
            sales: 98,
            revenue: 87220,
            category: "Panels",
          },
          {
            name: "Teak Decking",
            sales: 67,
            revenue: 140700,
            category: "Decking",
          },
          {
            name: "Pine Lumber",
            sales: 234,
            revenue: 46800,
            category: "Lumber",
          },
        ],
        categoryPerformance: [
          {
            category: "Flooring",
            products: 23,
            revenue: 245000,
            avgPrice: 1250,
          },
          { category: "Panels", products: 18, revenue: 156000, avgPrice: 890 },
          {
            category: "Decking",
            products: 12,
            revenue: 198000,
            avgPrice: 2100,
          },
          { category: "Lumber", products: 45, revenue: 89000, avgPrice: 200 },
        ],
        lowStockProducts: [
          {
            name: "Mahogany Planks",
            stock: 5,
            category: "Lumber",
            reorderLevel: 20,
          },
          {
            name: "Cedar Shingles",
            stock: 8,
            category: "Roofing",
            reorderLevel: 25,
          },
          {
            name: "Walnut Flooring",
            stock: 3,
            category: "Flooring",
            reorderLevel: 15,
          },
        ],
        priceAnalysis: [
          { priceRange: "RM0-500", products: 45, sales: 234 },
          { priceRange: "RM500-1000", products: 23, sales: 156 },
          { priceRange: "RM1000-2000", products: 18, sales: 89 },
          { priceRange: "RM2000+", products: 12, sales: 45 },
        ],
      };

      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchData();
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
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value) => [`${value} units`, "Sales"]} />
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
