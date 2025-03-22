"use client";

import { Card, CardContent } from "@/components/ui/";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/";

interface SalesData {
  day: string;
  sales: number;
}

const data: SalesData[] = [
  { day: "12", sales: 1200 },
  { day: "13", sales: 1800 },
  { day: "14", sales: 900 },
  { day: "15", sales: 1500 },
  { day: "16", sales: 1200 },
  { day: "17", sales: 2100 },
  { day: "18", sales: 2400 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
}

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

export function LastSevenDaysSales() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Last 7 Days Sales</h3>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <h4 className="text-2xl font-bold">1,259</h4>
              <p className="text-sm text-gray-500">Items Sold</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold">$12,546</h4>
              <p className="text-sm text-gray-500">Revenue</p>
            </div>
          </div>

          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide={true} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="sales"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
