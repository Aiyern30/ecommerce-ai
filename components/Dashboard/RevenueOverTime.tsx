/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { Card, CardContent } from "@/components/ui/";
import { Button } from "@/components/ui/";
import {
  ChevronDown,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueData {
  period: string;
  revenue: number;
  date: string;
}

interface Order {
  created_at: string;
  total: string;
  payment_status: string;
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
    const value = payload[0].value;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-gray-900 dark:text-white text-lg">
          {new Intl.NumberFormat("en-MY", {
            style: "currency",
            currency: "MYR",
            minimumFractionDigits: 2,
          }).format(value)}
        </p>
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

function groupRevenueByPeriod(orders: Order[], periods: any[]) {
  return periods.map((period) => {
    const revenue = orders
      .filter((order) => {
        const orderDate = new Date(order.created_at);
        return (
          orderDate >= period.start &&
          orderDate <= period.end &&
          order.payment_status === "paid"
        );
      })
      .reduce((sum, order) => sum + Number.parseFloat(order.total || "0"), 0);

    return {
      period: period.label,
      revenue: revenue,
      date: period.sortDate,
    };
  });
}

export function RevenueOverTime() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [filter, setFilter] = useState<FilterType>("month");
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [previousPeriodRevenue, setPreviousPeriodRevenue] = useState(0);

  useEffect(() => {
    async function fetchRevenue() {
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
            .select("created_at, total, payment_status")
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
            .select("created_at, total, payment_status")
            .gte("created_at", since.toISOString())
            .order("created_at", { ascending: true });
        }

        const { data: orders, error } = queryData;
        if (error) {
          console.error("Error fetching revenue:", error);
          return;
        }

        const periods =
          filter === "day"
            ? generateHourlyPeriods()
            : filter === "week"
            ? generateWeeklyPeriods(8)
            : generateMonthlyPeriods(6);

        const chartData = groupRevenueByPeriod(orders || [], periods);
        const paidOrders =
          orders?.filter((order) => order.payment_status === "paid") || [];
        const total = paidOrders.reduce(
          (sum, order) => sum + Number.parseFloat(order.total || "0"),
          0
        );
        const orderCount = paidOrders.length;

        // Calculate previous period for comparison
        // const currentPeriodData = chartData.slice(
        //   -Math.ceil(chartData.length / 2)
        // );
        const previousPeriodData = chartData.slice(
          0,
          Math.floor(chartData.length / 2)
        );
        const prevTotal = previousPeriodData.reduce(
          (sum, item) => sum + item.revenue,
          0
        );

        setData(chartData);
        setTotalRevenue(total);
        setTotalOrders(orderCount);
        setPreviousPeriodRevenue(prevTotal);
      } catch (error) {
        console.error("Error fetching revenue:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, [filter]);

  const filterOptions = [
    { value: "day" as FilterType, label: "Today", desc: "Hourly breakdown" },
    { value: "week" as FilterType, label: "Weekly", desc: "Last 8 weeks" },
    { value: "month" as FilterType, label: "Monthly", desc: "Last 6 months" },
  ];

  const currentFilterLabel =
    filterOptions.find((opt) => opt.value === filter)?.label || "Today";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const revenueChange =
    previousPeriodRevenue > 0
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0;

  return (
    <Card className="col-span-full bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Revenue Overview
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {currentFilterLabel} breakdown
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
                            ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
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

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Revenue
                  </p>
                  <h4 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalRevenue)}
                  </h4>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    revenueChange >= 0
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {revenueChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(revenueChange).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Paid Orders
              </p>
              <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalOrders.toLocaleString()}
              </h4>
            </div>

            {totalOrders > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Avg Order Value
                </p>
                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalRevenue / totalOrders)}
                </h4>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="h-[320px] w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full animate-pulse"></div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Loading chart...
                    </span>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: filter === "day" ? 40 : 20,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#059669"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-600"
                      opacity={0.5}
                    />
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
                    />
                    <YAxis hide={true} />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#revenueGradient)"
                      radius={[8, 8, 0, 0]}
                      barSize={filter === "day" ? 20 : 24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
