/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { Card, CardContent } from "@/components/ui/";
import { Button } from "@/components/ui/";
import {
  ChevronDown,
  Calendar,
  TrendingUp,
  BarChart3,
  TrendingDown,
} from "lucide-react";
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
import { useDeviceType } from "@/utils/useDeviceTypes";

interface OrdersData {
  period: string;
  orders: number;
  date: string;
}

interface Order {
  created_at: string;
}

type FilterType = "day" | "week" | "month";

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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-gray-900 dark:text-white text-lg">{`${payload[0].value} Orders`}</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {label}
        </p>
      </div>
    );
  }
  return null;
};

function generateHourlyPeriods() {
  const periods = [];
  const today = new Date();

  for (let hour = 0; hour < 24; hour++) {
    const startOfHour = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      0,
      0,
      0
    );
    const endOfHour = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      59,
      59,
      999
    );

    const displayHour =
      hour === 0
        ? "12am"
        : hour < 12
        ? `${hour}am`
        : hour === 12
        ? "12pm"
        : `${hour - 12}pm`;

    periods.push({
      start: startOfHour,
      end: endOfHour,
      label: displayHour,
      sortDate: startOfHour.toISOString(),
    });
  }
  return periods;
}

function generateWeeklyPeriods(weeksBack = 8) {
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

function generateMonthlyPeriods(monthsBack = 6) {
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

export function OrdersOverTime() {
  const [data, setData] = useState<OrdersData[]>([]);
  const [filter, setFilter] = useState<FilterType>("month");
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [previousPeriodOrders, setPreviousPeriodOrders] = useState(0);
  const { isMobile } = useDeviceType();

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        let since: Date;
        let queryData;

        if (filter === "day") {
          since = new Date();
          since.setHours(0, 0, 0, 0);
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);

          queryData = await supabase
            .from("orders")
            .select("created_at")
            .gte("created_at", since.toISOString())
            .lte("created_at", endOfDay.toISOString())
            .order("created_at", { ascending: true });
        } else {
          const daysBack = filter === "week" ? 56 : 180;
          since = new Date();
          since.setDate(since.getDate() - daysBack);
          since.setHours(0, 0, 0, 0);

          queryData = await supabase
            .from("orders")
            .select("created_at")
            .gte("created_at", since.toISOString())
            .order("created_at", { ascending: true });
        }

        const { data: orders, error } = queryData;
        if (error) {
          console.error("Error fetching orders:", error);
          return;
        }

        const periods =
          filter === "day"
            ? generateHourlyPeriods()
            : filter === "week"
            ? generateWeeklyPeriods(8)
            : generateMonthlyPeriods(6);

        const chartData = groupOrdersByPeriod(orders || [], periods);
        const total = chartData.reduce((sum, item) => sum + item.orders, 0);

        // Calculate previous period for comparison
        // const currentPeriodData = chartData.slice(
        //   -Math.ceil(chartData.length / 2)
        // );
        const previousPeriodData = chartData.slice(
          0,
          Math.floor(chartData.length / 2)
        );
        const prevTotal = previousPeriodData.reduce(
          (sum, item) => sum + item.orders,
          0
        );

        setData(chartData);
        setTotalOrders(total);
        setPreviousPeriodOrders(prevTotal);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [filter]);

  const filterOptions = [
    { value: "day" as FilterType, label: "Today", desc: "Hourly breakdown" },
    { value: "week" as FilterType, label: "Weekly", desc: "Last 8 weeks" },
    { value: "month" as FilterType, label: "Monthly", desc: "Last 6 months" },
  ];

  const currentFilterLabel =
    filterOptions.find((opt) => opt.value === filter)?.label || "Today";

  const ordersChange =
    previousPeriodOrders > 0
      ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100
      : 0;

  const maxOrders = Math.max(...data.map((d) => d.orders), 0);
  const avgOrders = data.length > 0 ? Math.round(totalOrders / data.length) : 0;

  return (
    <Card className="col-span-full bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 border-0 shadow-xl">
      <CardContent className={isMobile ? "p-2" : "p-8"}>
        <div
          className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-8"}
        >
          {/* Header */}
          {isMobile ? (
            <div className="flex flex-col gap-2 px-1 pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Orders Over Time
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                    {totalOrders} total orders • {currentFilterLabel} view
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
                    >
                      <Calendar className="h-4 w-4" />
                      {currentFilterLabel}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    {filterOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className="flex flex-col items-start gap-1 p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              filter === option.value
                                ? "bg-blue-500 shadow-lg shadow-blue-500/30"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {option.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-5">
                          {option.desc}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Orders Over Time
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {totalOrders} total orders • {currentFilterLabel} view
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    {currentFilterLabel}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setFilter(option.value)}
                      className="flex flex-col items-start gap-1 p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            filter === option.value
                              ? "bg-blue-500 shadow-lg shadow-blue-500/30"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-6">
                        {option.desc}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Chart */}
          <div
            className={
              isMobile
                ? "bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-100 dark:border-gray-700"
                : "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            }
          >
            <div className={isMobile ? "h-[260px] w-full" : "h-[360px] w-full"}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Loading chart...
                    </span>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{
                      top: isMobile ? 10 : 20,
                      right: isMobile ? 10 : 30,
                      left: isMobile ? 0 : 0,
                      bottom:
                        filter === "day"
                          ? isMobile
                            ? 20
                            : 40
                          : isMobile
                          ? 10
                          : 20,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="colorOrders"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="50%"
                          stopColor="#3b82f6"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="period"
                      tick={{
                        fontSize: filter === "day" ? 11 : 13,
                        fill: "currentColor",
                      }}
                      tickLine={false}
                      axisLine={false}
                      className="text-gray-600 dark:text-gray-400"
                      angle={filter === "day" ? -45 : 0}
                      textAnchor={filter === "day" ? "end" : "middle"}
                      height={filter === "day" ? 80 : 40}
                      label={{
                        value:
                          filter === "day"
                            ? "Hour"
                            : filter === "week"
                            ? "Week"
                            : "Month",
                        position: "insideBottom",
                        offset: -5,
                        style: { fill: "#6b7280", fontSize: 13 },
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "currentColor" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      className="text-gray-600 dark:text-gray-400"
                      label={{
                        value: "Orders",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        style: { fill: "#6b7280", fontSize: 13 },
                      }}
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-600"
                      opacity={0.5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{
                        r: 6,
                        stroke: "#3b82f6",
                        strokeWidth: 2,
                        fill: "#ffffff",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Orders
                  </p>
                  <h4 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {totalOrders.toLocaleString()}
                  </h4>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    ordersChange >= 0
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {ordersChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(ordersChange).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Average per{" "}
                {filter === "day"
                  ? "Hour"
                  : filter === "week"
                  ? "Week"
                  : "Month"}
              </p>
              <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
                {avgOrders}
              </h4>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Peak{" "}
                {filter === "day"
                  ? "Hour"
                  : filter === "week"
                  ? "Week"
                  : "Month"}
              </p>
              <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
                {maxOrders}
              </h4>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Growth Rate
              </p>
              <h4
                className={`text-3xl font-bold ${
                  ordersChange >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {ordersChange >= 0 ? "+" : ""}
                {ordersChange.toFixed(1)}%
              </h4>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
