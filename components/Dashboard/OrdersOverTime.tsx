"use client";

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
  May21: number;
  May22: number;
}

const data: OrdersData[] = [
  { time: "4am", May21: 5, May22: 8 },
  { time: "5am", May21: 3, May22: 4 },
  { time: "6am", May21: 6, May22: 12 },
  { time: "7am", May21: 8, May22: 8 },
  { time: "8am", May21: 12, May22: 20 },
  { time: "9am", May21: 10, May22: 16 },
  { time: "10am", May21: 14, May22: 24 },
  { time: "11am", May21: 18, May22: 32 },
  { time: "12pm", May21: 10, May22: 16 },
  { time: "1pm", May21: 8, May22: 12 },
  { time: "2pm", May21: 12, May22: 20 },
  { time: "3pm", May21: 10, May22: 16 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white px-3 py-2 rounded-md text-xs">
        <p>{`${payload[0].value} Orders`}</p>
        {label && <p>{`May 22, ${label}`}</p>}
      </div>
    );
  }
  return null;
};

export function OrdersOverTimeChart() {
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

          <div className="flex items-center gap-6 mb-2">
            <div>
              <h4 className="text-2xl font-bold">645</h4>
              <p className="text-sm text-gray-500">Orders on May 22</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold">472</h4>
              <p className="text-sm text-gray-500">Orders on May 21</p>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMay22" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorMay21" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="May21"
                  stroke="#94a3b8"
                  fillOpacity={1}
                  fill="url(#colorMay21)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="May22"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorMay22)"
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
