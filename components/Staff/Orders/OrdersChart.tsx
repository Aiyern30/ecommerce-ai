"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts";

const data = [
  { day: 10, orders: 1000 },
  { day: 12, orders: 1200 },
  { day: 14, orders: 1800 },
  { day: 16, orders: 1600 },
  { day: 18, orders: 1200 },
  { day: 20, orders: 1400 },
  { day: 22, orders: 2200 },
  { day: 24, orders: 2500 },
  { day: 26, orders: 2000 },
  { day: 28, orders: 1800 },
  { day: 30, orders: 2000 },
  { day: 32, orders: 2200 },
  { day: 34, orders: 2100 },
  { day: 36, orders: 2300 },
  { day: 38, orders: 2500 },
  { day: 40, orders: 2700 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
}

const highestPoint = data.reduce(
  (max, point) => (point.orders > max.orders ? point : max),
  data[0]
);

export function OrdersChart() {
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-gray-800 text-white px-3 py-2 rounded-md text-xs">
          <p>${payload[0].value.toFixed(0)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
            domain={[0, "dataMax + 500"]}
          />
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#colorOrders)"
            strokeWidth={2}
          />
          {/* Use highestPoint dynamically */}
          <ReferenceDot
            x={highestPoint.day}
            y={highestPoint.orders}
            r={6}
            fill="#f97316"
            stroke="#fff"
            strokeWidth={2}
          />
          <text
            x={highestPoint.day}
            y={highestPoint.orders - 20}
            textAnchor="middle"
            fill="#f97316"
            fontSize={12}
            fontWeight="bold"
          >
            {`${highestPoint.orders / 1000}k`}
          </text>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
