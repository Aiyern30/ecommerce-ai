"use client";

import { Button } from "@/components/ui/";
import { FiSettings } from "react-icons/fi";

import { KpiCards } from "@/components/Dashboard/KPICard";
import { LastSevenDaysSales } from "@/components/Dashboard/LastSeenSevenDays";
import { OrdersOverTimeChart } from "@/components/Dashboard/OrdersOverTime";
import { RecentTransactions } from "@/components/Dashboard/RecentTransaction";
import { RevenueByDevice } from "@/components/Dashboard/RevenueByDevices";
import { TopProducts } from "@/components/Dashboard/TopProduct";
import { TrafficAnalytics } from "@/components/Dashboard/TrafficAnalytics";

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          variant="outline"
          className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <FiSettings size={18} />
          Manage
        </Button>
      </div>

      <KpiCards />

      <div className="grid gap-4 lg:grid-cols-2 w-full">
        <OrdersOverTimeChart />
        <LastSevenDaysSales />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 w-full">
        <RevenueByDevice />
        <TrafficAnalytics />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 w-full">
        <RecentTransactions />
        <TopProducts />
      </div>
    </>
  );
}
