/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { TypographyH6, TypographyP } from "./ui/Typography";

interface StatsCardsProps {
  title: string;
  value: string;
  description?: string;
  growth?: number;
  icon: any;
  gradient?: string;
  bgGradient?: string;
  hideGrowth?: boolean;
}

export function StatsCards({
  title,
  value,
  description,
  growth = 0,
  icon: IconComponent,
  gradient = "from-blue-500 to-indigo-600",
  bgGradient = "from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10",
  hideGrowth = false,
}: StatsCardsProps) {
  const renderGrowthIndicator = (growth: number) => {
    const isPositive = growth > 0;
    const isNeutral = growth === 0;

    if (isNeutral) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
          <Activity className="h-3 w-3 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">0.0%</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${
          isPositive
            ? "bg-emerald-100 dark:bg-emerald-900/30"
            : "bg-red-100 dark:bg-red-900/30"
        }`}
      >
        {isPositive ? (
          <ArrowUpRight className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
        )}
        <span
          className={`text-xs font-medium ${
            isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {Math.abs(growth).toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <Card
      className={`bg-gradient-to-br ${bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <TypographyH6>{title}</TypographyH6>
              <TypographyP
                className="text-2xl font-bold text-gray-900 dark:text-white leading-tight
                  max-w-[8rem] sm:max-w-[10rem] md:max-w-none "
              >
                {value}
              </TypographyP>
              {description && (
                <TypographyP className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {description}
                </TypographyP>
              )}
            </div>
            <div
              className={`p-3 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg flex items-center justify-center`}
            >
              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
            </div>
          </div>

          {!hideGrowth && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              {renderGrowthIndicator(growth)}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                vs last period
              </span>
            </div>
          )}

          {hideGrowth && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Real-time data
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
