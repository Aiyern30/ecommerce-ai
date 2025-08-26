"use client";

import { KpiCards } from "@/components/Dashboard/KPICard";
import { RevenueOverTime } from "@/components/Dashboard/RevenueOverTime";

import { OrdersOverTime } from "@/components/Dashboard/OrdersOverTime";
import { CartAnalytics } from "@/components/Dashboard/CartAnalytics";
import { CustomerInsights } from "@/components/Dashboard/CustomerInsight";
import { ProductPerformance } from "@/components/Dashboard/ProductPerformance";
import { TypographyH1 } from "@/components/ui/Typography";

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <TypographyH1>Dashboard</TypographyH1>
      </div>

      <KpiCards />

      <div className="space-y-4 my-4">
        <OrdersOverTime />
        <RevenueOverTime />
      </div>
      <div className="space-y-4 my-4">
        <CartAnalytics />
      </div>
      <div className="space-y-4 my-4">
        <CustomerInsights />
      </div>
      <div className="space-y-4 my-4">
        <ProductPerformance />
      </div>
    </>
  );
}
