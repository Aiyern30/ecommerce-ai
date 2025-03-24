"use client"

import { Card, CardContent } from "@/components/ui/"
import { ChevronRight } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "@/components/ui/"

interface CustomTooltipProps {
    active?: boolean;
    payload?: {
      name: string;
      value: number;
      payload: {
        amount: number;
      };
    }[];
  }
  const data = [
  { name: "Desktop", value: 64.2, amount: 830.03, color: "#3b82f6" },
  { name: "Mobile", value: 48.6, amount: 755.75, color: "#06b6d4" },
  { name: "Tablet", value: 15.3, amount: 550.81, color: "#f97316" },
  { name: "Unknown", value: 8.6, amount: 150.94, color: "#ef4444" },
]

export function RevenueByDevice() {
    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 rounded-md shadow-md">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
          <p className="text-gray-600">{`$${payload[0].payload.amount}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Revenue by device</h3>
            <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
              More
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  label={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold">
                  64%
                </text>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-xs text-gray-500">${item.amount}</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

