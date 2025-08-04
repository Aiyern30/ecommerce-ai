/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { Card, CardContent } from "@/components/ui/";
import { Button } from "@/components/ui/";
import { ChevronDown, Calendar, DollarSign } from "lucide-react";
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
      <div className="bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg">
        <p className="font-medium">
          RM{" "}
          {new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2 }).format(
            value
          )}
        </p>
        <p className="text-gray-300 text-sm">{label}</p>
      </div>
    );
  }
  return null;
};

function generateHourlyPeriods() {
  const periods = [];
  const today = new Date();

  // Generate 24 hours (0-23)
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

    // Format hour for display (12-hour format)
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
      .reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);

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

  useEffect(() => {
    async function fetchRevenue() {
      setLoading(true);
      try {
        let since: Date;
        let queryData;

        if (filter === "day") {
          // For daily view, get today's data only
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
          // For week/month views, get historical data
          const daysBack = filter === "week" ? 56 : 180; // 8 weeks or 6 months
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

        // Generate periods based on filter
        const periods =
          filter === "day"
            ? generateHourlyPeriods()
            : filter === "week"
            ? generateWeeklyPeriods(8)
            : generateMonthlyPeriods(6);

        // Group revenue by period
        const chartData = groupRevenueByPeriod(orders || [], periods);

        // Calculate totals for paid orders only
        const paidOrders =
          orders?.filter((order) => order.payment_status === "paid") || [];
        const total = paidOrders.reduce(
          (sum, order) => sum + parseFloat(order.total || "0"),
          0
        );
        const orderCount = paidOrders.length;

        setData(chartData);
        setTotalRevenue(total);
        setTotalOrders(orderCount);
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

  return (
    <Card className="col-span-full">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Revenue Overview
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentFilterLabel} breakdown
                </p>
              </div>
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
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
                            ? "bg-green-600"
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

          {/* Summary Stats */}
          <div className="flex items-center gap-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalOrders}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Paid Orders
              </p>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalRevenue)}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
            </div>
            {totalOrders > 0 && (
              <div>
                <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {formatCurrency(totalRevenue / totalOrders)}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg Order Value
                </p>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="h-[240px] w-full">
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
                <BarChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: filter === "day" ? 20 : 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    className="dark:stroke-gray-700"
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: filter === "day" ? 10 : 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-gray-600 dark:text-gray-400"
                    angle={filter === "day" ? -45 : 0}
                    textAnchor={filter === "day" ? "end" : "middle"}
                    height={filter === "day" ? 60 : 30}
                  />
                  <YAxis hide={true} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={filter === "day" ? 16 : 20}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
