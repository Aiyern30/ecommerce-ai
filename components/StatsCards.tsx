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
      className={`bg-gradient-to-br ${bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] min-h-[160px] sm:min-h-[180px]`}
    >
      <CardContent className="p-4 sm:p-6 h-full">
        <div className="flex flex-col h-full">
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute top-0 right-0">
              <div
                className={`p-1.5 sm:p-2 bg-gradient-to-br ${gradient} rounded-lg shadow-lg flex items-center justify-center`}
              >
                <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>

            <TypographyH6 className="pr-12 leading-snug">{title}</TypographyH6>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <TypographyP className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-1 sm:mb-2 word-wrap break-words">
              {value}
            </TypographyP>

            {description && (
              <TypographyP className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
              </TypographyP>
            )}
          </div>

          <div className="mt-auto pt-3 sm:pt-4">
            {!hideGrowth && (
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2 sm:pt-3">
                <div className="flex-shrink-0">
                  {renderGrowthIndicator(growth)}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  vs last period
                </span>
              </div>
            )}

            {hideGrowth && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 sm:pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Real-time data
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
