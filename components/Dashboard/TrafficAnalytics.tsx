"use client";

import { Card, CardContent } from "@/components/ui/";
import { ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

const data = [
  { day: 16, visits: 1800 },
  { day: 17, visits: 1600 },
  { day: 18, visits: 2000 },
  { day: 19, visits: 2200 },
  { day: 20, visits: 2600 },
  { day: 21, visits: 2400 },
  { day: 22, visits: 2200 },
  { day: 23, visits: 2300 },
  { day: 24, visits: 2100 },
  { day: 25, visits: 1900 },
  { day: 26, visits: 2000 },
  { day: 27, visits: 2200 },
  { day: 28, visits: 2400 },
  { day: 29, visits: 2500 },
  { day: 30, visits: 2700 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload: {
      amount: number;
    };
  }[];
  label: string;
}
// Find the highest point for the reference dot
const highestPoint = data.reduce(
  (max, point) => (point.visits > max.visits ? point : max),
  data[0]
);

export function TrafficAnalytics() {
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 rounded-md shadow-md">
          <p className="font-medium">{`Day ${label}`}</p>
          <p className="text-gray-600">{`Visits: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Traffic</h3>
            <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
              More
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-500 text-xs font-medium">
                  + 22%
                </span>
              </div>
              <p className="text-sm text-gray-500">Store Visits</p>
              <p className="text-2xl font-bold">8950</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-amber-500 text-xs font-medium">
                  - 24%
                </span>
              </div>
              <p className="text-sm text-gray-500">Visitors</p>
              <p className="text-2xl font-bold">1520</p>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Jan 16 - Jan 30 store visits chart
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  hide={true}
                  domain={["dataMin - 200", "dataMax + 200"]}
                />
                <Tooltip content={<CustomTooltip label={""} />} />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#f97316",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
                <ReferenceDot
                  x={highestPoint.day}
                  y={highestPoint.visits}
                  r={6}
                  fill="#f97316"
                  stroke="#fff"
                  strokeWidth={2}
                />
                <text
                  x={highestPoint.day + 5}
                  y={highestPoint.visits - 15}
                  textAnchor="middle"
                  fill="#f97316"
                  fontSize={12}
                  fontWeight="bold"
                >
                  2.5k
                </text>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-xs text-gray-500 px-2">
            {[16, 18, 20, 24, 26, 28, 30].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
