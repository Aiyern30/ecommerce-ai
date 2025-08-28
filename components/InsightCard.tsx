/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Clock,
  Target,
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "sales" | "prediction" | "alert" | "recommendation" | "analysis";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  timestamp: string;
  data?: any;
}

interface InsightCardProps {
  insight: AIInsight;
  className?: string;
}

const typeIcons = {
  sales: TrendingUp,
  prediction: Target,
  alert: AlertTriangle,
  recommendation: Lightbulb,
  analysis: Brain,
};

const typeColors = {
  sales: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  prediction:
    "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  alert: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  recommendation:
    "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  analysis:
    "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
};

const impactColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export default function InsightCard({
  insight,
  className = "",
}: InsightCardProps) {
  const Icon = typeIcons[insight.type] || Brain;
  const typeColor = typeColors[insight.type] || typeColors.analysis;
  const impactColor = impactColors[insight.impact];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${className}`}
    >
      <CardHeader className="pb-3">
        {/* Mobile-first header layout */}
        <div className="space-y-3">
          {/* Type indicator and timestamp */}
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}
            >
              <Icon className="w-3 h-3" />
              <span className="capitalize">{insight.type}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(insight.timestamp)}
            </div>
          </div>

          {/* Title */}
          <CardTitle className="text-base sm:text-lg leading-tight">
            {insight.title}
          </CardTitle>

          {/* Badges - stacked on mobile, inline on larger screens */}
          <div className="flex flex-wrap gap-2">
            <Badge className={`text-xs ${impactColor}`}>
              {insight.impact} impact
            </Badge>
            <Badge variant="outline" className="text-xs">
              {insight.confidence}% confidence
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Description with better line height for mobile */}
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {insight.description}
          </p>

          {/* Timestamp display for mobile */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 sm:hidden">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Generated: {new Date(insight.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Timestamp display for desktop */}
          <div className="hidden sm:block pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Generated: {new Date(insight.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
