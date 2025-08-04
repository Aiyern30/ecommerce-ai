/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { Card, CardContent } from "@/components/ui/";
import { Button } from "@/components/ui/";
import { ChevronDown, Calendar, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface OrdersData {
  period: string;
  orders: number;
  date: string; // for sorting
}

interface Order {
  created_at: string;
}

type FilterType = "week" | "month";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm shadow-lg">
        <p className="font-medium">{`${payload[0].value} Orders`}</p>
        <p className="text-gray-300">{label}</p>
      </div>
    );
  }
  return null;
};

function generateWeeklyPeriods(weeksBack: number = 8) {
  const periods = [];
  const today = new Date();

  for (let i = weeksBack - 1; i >= 0; i--) {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() + 7 * i));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    periods.push({
      start: startOfWeek,
      end: endOfWeek,
      label: `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${
        endOfWeek.getMonth() + 1
      }/${endOfWeek.getDate()}`,
      sortDate: startOfWeek.toISOString(),
    });
  }

  return periods;
}

function generateMonthlyPeriods(monthsBack: number = 6) {
  const periods = [];
  const today = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    periods.push({
      start: startOfMonth,
      end: endOfMonth,
      label: startOfMonth.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      sortDate: startOfMonth.toISOString(),
    });
  }

  return periods;
}

function groupOrdersByPeriod(orders: Order[], periods: any[]) {
  return periods.map((period) => {
    const count = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= period.start && orderDate <= period.end;
    }).length;

    return {
      period: period.label,
      orders: count,
      date: period.sortDate,
    };
  });
}

export function OrdersOverTimeChart() {
  const [data, setData] = useState<OrdersData[]>([]);
  const [filter, setFilter] = useState<FilterType>("week");
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        // Calculate how far back to fetch data
        const daysBack = filter === "week" ? 56 : 180; // 8 weeks or 6 months
        const since = new Date();
        since.setDate(since.getDate() - daysBack);
        since.setHours(0, 0, 0, 0);

        const { data: orders, error } = await supabase
          .from("orders")
          .select("created_at")
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching orders:", error);
          return;
        }

        // Generate periods based on filter
        const periods =
          filter === "week"
            ? generateWeeklyPeriods(8)
            : generateMonthlyPeriods(6);

        // Group orders by period
        const chartData = groupOrdersByPeriod(orders || [], periods);

        // Calculate total orders for the period
        const total = chartData.reduce((sum, item) => sum + item.orders, 0);

        setData(chartData);
        setTotalOrders(total);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [filter]);

  const filterOptions = [
    { value: "week" as FilterType, label: "Weekly", desc: "Last 8 weeks" },
    { value: "month" as FilterType, label: "Monthly", desc: "Last 6 months" },
  ];

  const currentFilterLabel =
    filterOptions.find((opt) => opt.value === filter)?.label || "Weekly";

  return (
    <Card className="col-span-full">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Orders Over Time
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {totalOrders} total orders • {currentFilterLabel} view
                </p>
              </div>
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {currentFilterLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className="flex flex-col items-start gap-1 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          filter === option.value
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-4">
                      {option.desc}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Chart */}
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <span className="text-sm text-gray-500">
                    Loading chart...
                  </span>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorOrders"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    className="dark:stroke-gray-700"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Summary Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalOrders}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Orders
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.length > 0 ? Math.round(totalOrders / data.length) : 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Avg per {filter === "week" ? "Week" : "Month"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.max(...data.map((d) => d.orders), 0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Peak {filter === "week" ? "Week" : "Month"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
