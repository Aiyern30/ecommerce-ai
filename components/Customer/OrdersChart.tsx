/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/";
import { Button } from "@/components/ui/";
import {
  ChevronDown,
  TrendingUp,
  BarChart3,
  TrendingDown,
  Activity,
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
import { formatCurrency } from "@/lib/utils/currency";
import { Order } from "@/type/order";

interface OrdersData {
  period: string;
  orders: number;
  amount: number;
  date: string;
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
    const ordersValue = payload[0]?.value || 0;
    // Get the amount from the original data point
    const amountValue = payload[0]?.payload?.amount || 0;

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-gray-900 dark:text-white text-lg">
          {`${ordersValue} Orders`}
        </p>
        <p className="font-semibold text-green-600 dark:text-green-400 text-sm">
          {formatCurrency(amountValue)}
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {label}
        </p>
      </div>
    );
  }
  return null;
};

function generateSmartPeriods(orders: Order[], filterType: FilterType) {
  if (!orders || orders.length === 0) {
    return [];
  }

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

function groupOrdersByPeriod(orders: Order[], periods: any[]) {
  return periods.map((period) => {
    const periodOrders = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= period.start && orderDate <= period.end;
    });

    const totalAmount = periodOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    return {
      period: period.label,
      orders: periodOrders.length,
      amount: totalAmount,
      date: period.sortDate,
    };
  });
}

interface OrdersChartProps {
  orders: Order[];
}

export function OrdersChart({ orders }: OrdersChartProps) {
  const [data, setData] = useState<OrdersData[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [previousPeriodOrders, setPreviousPeriodOrders] = useState(0);
  const [dataSpanDays, setDataSpanDays] = useState(0);
  const { isMobile } = useDeviceType();

  useEffect(() => {
    if (!orders || orders.length === 0) {
      setData([]);
      setTotalOrders(0);
      setTotalAmount(0);
      setPreviousPeriodOrders(0);
      setDataSpanDays(0);
      return;
    }

    const earliestOrder = new Date(orders[0].created_at);
    const latestOrder = new Date(orders[orders.length - 1].created_at);
    const daysDiff = Math.ceil(
      (latestOrder.getTime() - earliestOrder.getTime()) / (1000 * 60 * 60 * 24)
    );
    setDataSpanDays(daysDiff);

    let filteredOrders = orders;
    const now = new Date();

    if (filter === "today") {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      filteredOrders = orders.filter(
        (order) => new Date(order.created_at) >= startOfDay
      );
    } else if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filteredOrders = orders.filter(
        (order) => new Date(order.created_at) >= weekAgo
      );
    } else if (filter === "30days") {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      filteredOrders = orders.filter(
        (order) => new Date(order.created_at) >= monthAgo
      );
    }

    const periods = generateSmartPeriods(filteredOrders, filter);
    const chartData = groupOrdersByPeriod(filteredOrders, periods);

    const total = chartData.reduce((sum, item) => sum + item.orders, 0);
    const totalSpent = chartData.reduce((sum, item) => sum + item.amount, 0);

    const midPoint = Math.floor(chartData.length / 2);
    const previousPeriodData = chartData.slice(0, midPoint);

    const prevTotal = previousPeriodData.reduce(
      (sum, item) => sum + item.orders,
      0
    );

    setData(chartData);
    setTotalOrders(total);
    setTotalAmount(totalSpent);
    setPreviousPeriodOrders(prevTotal);
  }, [orders, filter]);

  const getFilterOptions = () => {
    const baseOptions = [
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
    ];

    if (dataSpanDays >= 14) {
      baseOptions.push({
        value: "30days" as FilterType,
        label: "Monthly",
        desc: "Last 30 days",
        icon: "📈",
      });
    }

    baseOptions.push({
      value: "all" as FilterType,
      label: "All Time",
      desc: `${dataSpanDays} days of data`,
      icon: "🎯",
    });

    return baseOptions;
  };

  const filterOptions = getFilterOptions();
  const currentFilterOption =
    filterOptions.find((opt) => opt.value === filter) || filterOptions[0];

  const ordersChange =
    previousPeriodOrders > 0
      ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100
      : totalOrders > 0
      ? 100
      : 0;

  const maxOrders = Math.max(...data.map((d) => d.orders), 0);
  const avgAmount = data.length > 0 ? totalAmount / data.length : 0;

  const StatCard = ({
    title,
    value,
    trend,
    color = "blue",
  }: {
    title: string;
    value: string | number;
    trend?: number;
    color?: string;
  }) => (
    <div
      className={`${
        isMobile ? "p-4" : "p-6"
      } bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } font-medium text-gray-600 dark:text-gray-400 mb-1`}
          >
            {title}
          </p>
          <h4
            className={`${
              isMobile ? "text-xl" : "text-2xl"
            } font-bold text-${color}-600 dark:text-${color}-400`}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </h4>
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : trend < 0
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Activity className="h-3 w-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="col-span-full bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 border-0 shadow-xl">
      <CardContent className={isMobile ? "p-4" : "p-8"}>
        <div className="flex flex-col gap-6">
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
                } bg-gradient-to-br from-blue-500 via-indigo-400 to-purple-500 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-700 rounded-xl shadow-lg`}
              >
                <BarChart3
                  className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} text-white`}
                />
              </div>
              <div>
                <h3
                  className={`${
                    isMobile ? "text-lg" : "text-2xl"
                  } font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent`}
                >
                  Your Purchase Analytics
                </h3>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-indigo-600 dark:text-indigo-400 font-medium`}
                >
                  {totalOrders} orders • {formatCurrency(totalAmount)} total
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
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div
              className={`${
                isMobile ? "h-[280px] p-2" : "h-[400px] p-6"
              } w-full`}
            >
              {data.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Orders Yet
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      Start shopping to see your purchase analytics
                    </p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{
                      top: isMobile ? 10 : 20,
                      right: isMobile ? 10 : 30,
                      left: isMobile ? 0 : 10,
                      bottom: isMobile ? 10 : 20,
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
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="period"
                      tick={{
                        fontSize: isMobile ? 10 : 12,
                        fill: "currentColor",
                      }}
                      tickLine={false}
                      axisLine={false}
                      className="text-gray-600 dark:text-gray-400"
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 60 : 40}
                      interval={isMobile && data.length > 6 ? 1 : 0}
                    />
                    <YAxis
                      tick={{
                        fontSize: isMobile ? 10 : 12,
                        fill: "currentColor",
                      }}
                      tickLine={false}
                      axisLine={false}
                      className="text-gray-600 dark:text-gray-400"
                      width={isMobile ? 30 : 60}
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
                      strokeWidth={isMobile ? 2 : 3}
                      dot={{
                        fill: "#3b82f6",
                        strokeWidth: 2,
                        r: isMobile ? 3 : 4,
                      }}
                      activeDot={{
                        r: isMobile ? 5 : 6,
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

          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Orders"
                value={totalOrders}
                trend={ordersChange}
                color="blue"
              />
              <StatCard
                title="Total Spent"
                value={formatCurrency(totalAmount)}
                color="green"
              />
              <StatCard title="Peak Period" value={maxOrders} color="purple" />
              <StatCard
                title={`Avg per ${
                  filter === "today"
                    ? "4hrs"
                    : filter === "week"
                    ? "Day"
                    : filter === "30days"
                    ? "Week"
                    : "Period"
                }`}
                value={formatCurrency(avgAmount)}
                color="amber"
              />
            </div>
          )}

          <div className="flex items-center justify-center">
            <div
              className={`flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full ${
                isMobile ? "text-xs" : "text-sm"
              }`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                {dataSpanDays === 0
                  ? "No purchase history yet"
                  : `${dataSpanDays} days of purchase history`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
