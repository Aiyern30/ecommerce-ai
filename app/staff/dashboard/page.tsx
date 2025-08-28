"use client";

import { KpiCards } from "@/components/Dashboard/KPICard";
import { RevenueOverTime } from "@/components/Dashboard/RevenueOverTime";
import { OrdersOverTime } from "@/components/Dashboard/OrdersOverTime";
import { CartAnalytics } from "@/components/Dashboard/CartAnalytics";
import { CustomerInsights } from "@/components/Dashboard/CustomerInsight";
import { ProductPerformance } from "@/components/Dashboard/ProductPerformance";
import { TypographyH1 } from "@/components/ui/Typography";
import { Button } from "@/components/ui";
import { Brain, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <TypographyH1>Dashboard</TypographyH1>

        {/* AI Insights Button */}
        <Link href="/staff/dashboard/ai-insights">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="w-5 h-5" />
              </div>
              <span>AI Insights</span>
              <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </Button>
        </Link>
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
