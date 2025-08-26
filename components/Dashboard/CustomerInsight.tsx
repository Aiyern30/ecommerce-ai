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
      const res = await fetch("/api/admin/customer_insights");
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
                  <defs>
                    <linearGradient id="orderFreqBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="frequency"
                    label={{
                      value: "Order Frequency",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#6366f1", fontSize: 13 },
                    }}
                    tick={{ fontSize: 12, fill: "#6366f1" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    label={{
                      value: "Customers",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fill: "#3b82f6", fontSize: 13 },
                    }}
                    tick={{ fontSize: 12, fill: "#3b82f6" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.12)" }}
                    content={({ active, payload, label }) =>
                      active && payload && payload.length ? (
                        <div className="bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm">
                          <p className="font-semibold text-indigo-700 dark:text-indigo-200 text-lg">
                            {payload[0].value} Customers
                          </p>
                          <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                            {label}
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar
                    dataKey="customers"
                    fill="url(#orderFreqBar)"
                    radius={[8, 8, 0, 0]}
                    barSize={32}
                    className="transition-all duration-200"
                  />
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
            <div className="h-[300px] flex flex-col gap-4">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={data?.customerSegments}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="count"
                    label={({ segment, count }) => `${segment}: ${count}`}
                  >
                    {data?.customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload && payload.length ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl shadow-xl">
                          <div className="font-semibold text-gray-900 dark:text-white text-lg">
                            {payload[0].payload.segment}
                          </div>
                          <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                            {payload[0].value} customers
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            RM{payload[0].payload.value.toLocaleString()} value
                          </div>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Enhanced legend */}
              <div className="flex flex-wrap gap-4 justify-center mt-2">
                {data?.customerSegments.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: entry.color }}
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {entry.segment}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({entry.count} customers, RM{entry.value.toLocaleString()}{" "}
                      value)
                    </span>
                  </div>
                ))}
              </div>
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
