"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Users, UserCheck, Repeat, MapPin } from "lucide-react";
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

interface CustomerInsightsData {
  totalCustomers: number;
  repeatCustomers: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  orderFrequency: Array<{ frequency: string; customers: number }>;
  topStates: Array<{ state: string; customers: number; orders: number }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    value: number;
    color: string;
  }>;
}

export function CustomerInsights() {
  const [data, setData] = useState<CustomerInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // This would query:
      // - Unique users with orders
      // - Users with multiple orders
      // - Geographic distribution from addresses
      // - Customer segmentation by order value/frequency

      const mockData: CustomerInsightsData = {
        totalCustomers: 1247,
        repeatCustomers: 423,
        averageOrderValue: 285.5,
        customerLifetimeValue: 1250.75,
        orderFrequency: [
          { frequency: "1 order", customers: 824 },
          { frequency: "2-3 orders", customers: 298 },
          { frequency: "4-5 orders", customers: 89 },
          { frequency: "6+ orders", customers: 36 },
        ],
        topStates: [
          { state: "Selangor", customers: 345, orders: 892 },
          { state: "Kuala Lumpur", customers: 234, orders: 567 },
          { state: "Johor", customers: 189, orders: 423 },
          { state: "Penang", customers: 156, orders: 334 },
          { state: "Perak", customers: 123, orders: 245 },
        ],
        customerSegments: [
          { segment: "High Value", count: 89, value: 2500, color: "#10b981" },
          { segment: "Regular", count: 456, value: 850, color: "#3b82f6" },
          { segment: "Occasional", count: 567, value: 320, color: "#f59e0b" },
          { segment: "New", count: 135, value: 150, color: "#6b7280" },
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
      {/* Customer KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Customers
                </p>
                <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {data?.totalCustomers.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Repeat Customers
                </p>
                <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {data?.repeatCustomers}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {(
                    ((data?.repeatCustomers || 0) /
                      (data?.totalCustomers || 1)) *
                    100
                  ).toFixed(1)}
                  % retention
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
                <Repeat className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Order Value
                </p>
                <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  RM{data?.averageOrderValue.toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-900/10 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Customer LTV
                </p>
                <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  RM{data?.customerLifetimeValue.toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Frequency */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Customer Order Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.orderFrequency}>
                  <XAxis dataKey="frequency" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="customers" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.customerSegments}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    label={({ segment, count }) => `${segment}: ${count}`}
                  >
                    {data?.customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Top States by Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.topStates.map((state, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {state.state}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {state.customers} customers
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {state.orders}
                  </p>
                  <p className="text-xs text-gray-500">orders</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
