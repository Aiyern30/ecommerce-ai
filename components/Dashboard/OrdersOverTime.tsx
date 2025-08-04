/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { Card, CardContent } from "@/components/ui/";
import { ChevronDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/";

interface OrdersData {
  time: string;
  Today: number;
  Yesterday: number;
}

interface Order {
  created_at: string;
  // ...other fields
}

const hours = Array.from({ length: 12 }, (_, i) => {
  const hour = 4 + i;
  const ampm = hour < 12 ? "am" : hour === 12 ? "pm" : `${hour - 12}pm`;
  return `${hour <= 12 ? hour : hour - 12}${ampm}`;
});

function groupOrdersByHour(orders: Order[], date: Date) {
  const result: Record<string, number> = {};
  hours.forEach((h) => (result[h] = 0));
  orders.forEach((order) => {
    const d = new Date(order.created_at);
    if (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    ) {
      const hour = d.getHours();
      if (hour >= 4 && hour < 16) {
        const label = `${hour <= 12 ? hour : hour - 12}${
          hour < 12 ? "am" : "pm"
        }`;
        if (result[label] !== undefined) result[label]++;
      }
    }
  });
  return result;
}

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
      <div className="bg-gray-800 text-white px-3 py-2 rounded-md text-xs">
        <p>{`${payload[0].value} Orders`}</p>
        {label && <p>{label}</p>}
      </div>
    );
  }
  return null;
};

export function OrdersOverTimeChart() {
  const [data, setData] = useState<OrdersData[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      // Fetch all orders from the last 2 days
      const since = new Date();
      since.setDate(since.getDate() - 1);
      since.setHours(0, 0, 0, 0);

      const { data: orders, error } = await supabase
        .from("orders")
        .select("created_at")
        .gte("created_at", since.toISOString());

      if (error) {
        // handle error
        return;
      }

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const todayCounts = groupOrdersByHour(orders, today);
      const yesterdayCounts = groupOrdersByHour(orders, yesterday);

      const chartData = hours.map((h) => ({
        time: h,
        Today: todayCounts[h],
        Yesterday: yesterdayCounts[h],
      }));

      setData(chartData);
    }

    fetchOrders();
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Orders Over Time</h3>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">Last 12 Hours</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </div>
          </div>
          <div className="h-[240px] w-full max-w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -40, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorYesterday"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Yesterday"
                  stroke="#94a3b8"
                  fillOpacity={1}
                  fill="url(#colorYesterday)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Today"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorToday)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
