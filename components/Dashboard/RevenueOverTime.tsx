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
import { useDeviceType } from "@/utils/useDeviceTypes";
import { formatCurrency } from "@/lib/utils/currency";
import { StatsCards } from "../StatsCards";

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

type FilterType = "today" | "week" | "30days" | "all";

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

// Period generation logic copied from OrdersOverTime, but for revenue
function generateSmartPeriods(orders: Order[], filterType: FilterType) {
  if (!orders || orders.length === 0) return [];
  const sortedOrders = orders.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const earliestOrder = new Date(sortedOrders[0].created_at);
  const latestOrder = new Date(
    sortedOrders[sortedOrders.length - 1].created_at
  );
  const now = new Date();

  if (filterType === "today") {
    const periods = [];
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    for (let hour = 0; hour < 24; hour += 4) {
      const start = new Date(startOfDay);
      start.setHours(hour);
      const end = new Date(startOfDay);
      end.setHours(hour + 3, 59, 59, 999);
      const startHour =
        hour === 0
          ? "12am"
          : hour < 12
          ? `${hour}am`
          : hour === 12
          ? "12pm"
          : `${hour - 12}pm`;
      const endHour =
        hour + 3 >= 24
          ? "12am"
          : hour + 3 < 12
          ? `${hour + 3}am`
          : hour + 3 === 12
          ? "12pm"
          : `${hour + 3 - 12}pm`;
      periods.push({
        start,
        end,
        label: `${startHour}-${endHour}`,
        sortDate: start.toISOString(),
      });
    }
    return periods;
  }
  if (filterType === "week") {
    const periods = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      periods.push({
        start,
        end,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        }),
        sortDate: start.toISOString(),
      });
    }
    return periods;
  }
  if (filterType === "30days") {
    const periods = [];
    for (let week = 4; week >= 0; week--) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (week * 7 + 6));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() - week * 7);
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
  if (filterType === "all") {
    const daysDiff = Math.ceil(
      (latestOrder.getTime() - earliestOrder.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff <= 7) {
      const periods = [];
      const start = new Date(earliestOrder);
      start.setHours(0, 0, 0, 0);
      while (start <= now) {
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        periods.push({
          start: new Date(start),
          end: new Date(end),
          label: start.toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          }),
          sortDate: start.toISOString(),
        });
        start.setDate(start.getDate() + 1);
      }
      return periods;
    } else if (daysDiff <= 30) {
      const periods = [];
      const start = new Date(earliestOrder);
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      while (start <= now) {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        periods.push({
          start: new Date(start),
          end: new Date(end),
          label: `${start.getMonth() + 1}/${start.getDate()}-${
            end.getMonth() + 1
          }/${end.getDate()}`,
          sortDate: start.toISOString(),
        });
        start.setDate(start.getDate() + 7);
      }
      return periods;
    } else {
      const periods = [];
      const start = new Date(
        earliestOrder.getFullYear(),
        earliestOrder.getMonth(),
        1
      );
      while (start <= now) {
        const end = new Date(
          start.getFullYear(),
          start.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        periods.push({
          start: new Date(start),
          end: new Date(end),
          label: start.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          sortDate: start.toISOString(),
        });
        start.setMonth(start.getMonth() + 1);
      }
      return periods;
    }
  }
  return [];
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
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  console.log("Revenue data:", totalOrders);
  const [previousPeriodRevenue, setPreviousPeriodRevenue] = useState(0);
  const [currentPeriodRevenue, setCurrentPeriodRevenue] = useState(0);
  const [dataSpanDays, setDataSpanDays] = useState(0);
  const { isMobile } = useDeviceType();

  useEffect(() => {
    async function fetchRevenue() {
      setLoading(true);
      try {
        // Get all orders for the filter
        const { data: allOrders, error } = await supabase
          .from("orders")
          .select("created_at, total, payment_status")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching revenue:", error);
          return;
        }

        if (!allOrders || allOrders.length === 0) {
          setData([]);
          setTotalRevenue(0);
          setTotalOrders(0);
          setPreviousPeriodRevenue(0);
          setCurrentPeriodRevenue(0);
          setDataSpanDays(0);
          return;
        }

        // Calculate data span
        const earliestOrder = new Date(allOrders[0].created_at);
        const latestOrder = new Date(
          allOrders[allOrders.length - 1].created_at
        );
        const daysDiff = Math.ceil(
          (latestOrder.getTime() - earliestOrder.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        setDataSpanDays(daysDiff);

        // Filter orders based on selected filter
        let filteredOrders = allOrders;
        const now = new Date();

        if (filter === "today") {
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          filteredOrders = allOrders.filter(
            (order) => new Date(order.created_at) >= startOfDay
          );
        } else if (filter === "week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          filteredOrders = allOrders.filter(
            (order) => new Date(order.created_at) >= weekAgo
          );
        } else if (filter === "30days") {
          const monthAgo = new Date(now);
          monthAgo.setDate(now.getDate() - 30);
          filteredOrders = allOrders.filter(
            (order) => new Date(order.created_at) >= monthAgo
          );
        }
        // "all" uses all orders

        const periods = generateSmartPeriods(filteredOrders, filter);
        const chartData = groupRevenueByPeriod(filteredOrders, periods);

        const total = chartData.reduce((sum, item) => sum + item.revenue, 0);
        const paidOrders = filteredOrders.filter(
          (order) => order.payment_status === "paid"
        ).length;

        // Calculate previous/current period revenue for comparison
        const midPoint = Math.floor(chartData.length / 2);
        const previousPeriodData = chartData.slice(0, midPoint);
        const currentPeriodData = chartData.slice(midPoint);

        const prevTotal = previousPeriodData.reduce(
          (sum, item) => sum + item.revenue,
          0
        );
        const currTotal = currentPeriodData.reduce(
          (sum, item) => sum + item.revenue,
          0
        );

        setData(chartData);
        setTotalRevenue(total);
        setTotalOrders(paidOrders);
        setPreviousPeriodRevenue(prevTotal);
        setCurrentPeriodRevenue(currTotal);
      } catch (error) {
        console.error("Error fetching revenue:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, [filter]);

  // Filter options same as OrdersOverTime
  const filterOptions = [
    {
      value: "today" as FilterType,
      label: "Today",
      desc: "Last 24 hours",
      icon: "📅",
    },
    {
      value: "week" as FilterType,
      label: "This Week",
      desc: "Last 7 days",
      icon: "📊",
    },
    ...(dataSpanDays >= 14
      ? [
          {
            value: "30days" as FilterType,
            label: "Monthly",
            desc: "Last 30 days",
            icon: "📈",
          },
        ]
      : []),
    {
      value: "all" as FilterType,
      label: "All Time",
      desc: `${dataSpanDays} days of data`,
      icon: "🎯",
    },
  ];

  const currentFilterOption =
    filterOptions.find((opt) => opt.value === filter) || filterOptions[0];

  const revenueChange =
    previousPeriodRevenue > 0
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : totalRevenue > 0
      ? 100
      : 0;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
  const avgRevenue =
    data.length > 0 ? Math.round(totalRevenue / data.length) : 0;

  if (loading) {
    return (
      <Card className="col-span-full bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-xl">
        <CardContent className={isMobile ? "p-2" : "p-8"}>
          <div className={isMobile ? "space-y-4" : "space-y-8"}>
            <div
              className={`flex ${
                isMobile
                  ? "flex-col gap-3"
                  : "flex-row justify-between items-center"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${
                    isMobile ? "p-2" : "p-3"
                  } bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg`}
                >
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div>
                  <div
                    className={`${
                      isMobile ? "h-5 w-24" : "h-7 w-40"
                    } bg-gray-200 dark:bg-gray-700 rounded mb-2`}
                  />
                  <div
                    className={`${
                      isMobile ? "h-3 w-32" : "h-4 w-56"
                    } bg-gray-200 dark:bg-gray-700 rounded`}
                  />
                </div>
              </div>
              <div
                className={`${
                  isMobile ? "h-8 w-24" : "h-10 w-32"
                } bg-gray-200 dark:bg-gray-700 rounded-lg`}
              />
            </div>
            <div
              className={`grid ${
                isMobile ? "grid-cols-2 gap-3" : "grid-cols-4 gap-6"
              }`}
            >
              {[...Array(isMobile ? 2 : 4)].map((_, i) => (
                <div
                  key={i}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse"
                >
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
            <div
              className={
                isMobile
                  ? "bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-100 dark:border-gray-700"
                  : "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              }
            >
              <div
                className={isMobile ? "h-[220px] w-full" : "h-[320px] w-full"}
              >
                <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div
                className={`flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-xl">
      <CardContent className={isMobile ? "p-2" : "p-8"}>
        <div
          className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-8"}
        >
          <div
            className={`${
              isMobile
                ? "flex-col gap-3"
                : "flex-row justify-between items-center"
            } flex`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`${
                  isMobile ? "p-2" : "p-3"
                } bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg`}
              >
                <DollarSign
                  className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} text-white`}
                />
              </div>
              <div>
                <h3
                  className={`${
                    isMobile ? "text-lg" : "text-2xl"
                  } font-bold text-gray-900 dark:text-white`}
                >
                  Revenue Analytics
                </h3>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-gray-600 dark:text-gray-400 font-medium`}
                >
                  {totalRevenue.toLocaleString("en-MY", {
                    style: "currency",
                    currency: "MYR",
                  })}{" "}
                  total • {dataSpanDays} days of data
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm min-w-[120px]"
                >
                  <span className={isMobile ? "text-xs" : "text-sm"}>
                    {currentFilterOption.icon}
                  </span>
                  {currentFilterOption.label}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`${
                  isMobile ? "w-48" : "w-56"
                } bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
              >
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`flex items-center gap-3 ${
                      isMobile ? "p-3" : "p-4"
                    } hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <div className="flex flex-col">
                      <span
                        className={`font-semibold text-gray-900 dark:text-white ${
                          isMobile ? "text-sm" : "text-base"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span
                        className={`${
                          isMobile ? "text-xs" : "text-sm"
                        } text-gray-500 dark:text-gray-400`}
                      >
                        {option.desc}
                      </span>
                    </div>
                    {filter === option.value && (
                      <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <StatsCards
                title="Total Revenue"
                value={formatCurrency(totalRevenue)}
                description={`vs last period: ${Math.abs(revenueChange).toFixed(
                  1
                )}%`}
                icon={
                  revenueChange > 0
                    ? TrendingUp
                    : revenueChange < 0
                    ? TrendingDown
                    : Calendar
                }
                gradient="from-emerald-500 to-green-600"
                bgGradient="from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/10"
              />
              <StatsCards
                title="Current Period"
                value={formatCurrency(currentPeriodRevenue)}
                icon={
                  revenueChange > 0
                    ? TrendingUp
                    : revenueChange < 0
                    ? TrendingDown
                    : Calendar
                }
                gradient="from-blue-500 to-indigo-600"
                bgGradient="from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10"
              />
              <StatsCards
                title="Peak Period"
                value={formatCurrency(maxRevenue)}
                icon={
                  revenueChange > 0
                    ? TrendingUp
                    : revenueChange < 0
                    ? TrendingDown
                    : Calendar
                }
                gradient="from-orange-500 to-amber-600"
                bgGradient="from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-900/10"
              />
              <StatsCards
                title={`Avg per ${
                  filter === "today"
                    ? "4hrs"
                    : filter === "week"
                    ? "Day"
                    : filter === "30days"
                    ? "Week"
                    : "Period"
                }`}
                value={formatCurrency(avgRevenue)}
                icon={
                  revenueChange > 0
                    ? TrendingUp
                    : revenueChange < 0
                    ? TrendingDown
                    : Calendar
                }
                gradient="from-purple-500 to-violet-600"
                bgGradient="from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10"
              />
            </div>
          )}

          <div
            className={
              isMobile
                ? "bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-100 dark:border-gray-700"
                : "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            }
          >
            <div className={isMobile ? "h-[220px] w-full" : "h-[320px] w-full"}>
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
                      top: isMobile ? 10 : 20,
                      right: isMobile ? 10 : 20,
                      left: isMobile ? 0 : 0,
                      bottom: isMobile ? 10 : 20,
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
                      label={{
                        value: "Period",
                        position: "insideBottom",
                        offset: -10,
                        style: { fill: "#059669", fontSize: 13 },
                      }}
                      tick={{
                        fontSize: isMobile ? 10 : 12,
                        fill: "currentColor",
                      }}
                      tickLine={false}
                      axisLine={false}
                      className="text-gray-600 dark:text-gray-400"
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 40 : 30}
                      interval={isMobile && data.length > 6 ? 1 : 0}
                    />
                    <YAxis
                      label={{
                        value: "Revenue",
                        angle: -90,
                        position: "insideLeft",
                        offset: 5,
                        style: { fill: "#059669", fontSize: 13 },
                      }}
                      tick={{ fontSize: 12, fill: "currentColor" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("en-MY", {
                          style: "currency",
                          currency: "MYR",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(value)
                      }
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#revenueGradient)"
                      radius={[8, 8, 0, 0]}
                      barSize={filter === "today" ? 20 : 24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div
              className={`flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full ${
                isMobile ? "text-xs" : "text-sm"
              }`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {dataSpanDays === 0
                  ? "No data yet"
                  : `${dataSpanDays} days of revenue history`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
