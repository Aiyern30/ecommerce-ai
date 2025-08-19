"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui/";
import type { Product } from "@/type/product";
import {
  Brain,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AIComparisonProps {
  comparedProducts: Product[];
  aiResult: AIComparisonResult | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onClear: () => void;
}

interface AIInsight {
  type: "recommendation" | "analysis" | "warning" | "tip";
  title: string;
  content: string;
  icon: "brain" | "lightbulb" | "trending" | "alert";
}

interface AIComparisonResult {
  summary: string;
  keyDifferences: string[];
  recommendations: string[];
  useCases: { product: string; useCase: string; reason: string }[];
  costAnalysis: string;
  insights: AIInsight[];
}

export function AISmartComparison({
  comparedProducts,
  aiResult,
  loading,
  error,
  onGenerate,
  onClear,
}: AIComparisonProps) {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "brain":
        return <Brain className="w-4 h-4" />;
      case "lightbulb":
        return <Lightbulb className="w-4 h-4" />;
      case "trending":
        return <TrendingUp className="w-4 h-4" />;
      case "alert":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "recommendation":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200";
      case "analysis":
        return "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200";
      case "tip":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (comparedProducts.length < 2) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            AI Smart Comparison
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select at least 2 products to get AI-powered insights and
            recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI Smart Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!aiResult && !loading ? (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get AI-powered insights and recommendations for your selected
                products.
              </p>
              <Button
                onClick={onGenerate}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                Generate AI Analysis
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600 dark:text-gray-400">
                AI is analyzing your products...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={onGenerate} variant="outline">
                Try Again
              </Button>
            </div>
          ) : aiResult ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  AI Summary
                </h3>
                <p className="text-purple-800 dark:text-purple-200 text-sm leading-relaxed">
                  {aiResult.summary}
                </p>
              </div>

              {/* Key Differences */}
              {aiResult.keyDifferences.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Key Differences
                  </h3>
                  <ul className="space-y-2">
                    {aiResult.keyDifferences.map((diff, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {diff}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Use Cases */}
              {aiResult.useCases.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Recommended Use Cases
                  </h3>
                  <div className="grid gap-3">
                    {aiResult.useCases.map((useCase, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {useCase.product}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <strong>Best for:</strong> {useCase.useCase}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {useCase.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost Analysis */}
              {aiResult.costAnalysis && (
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Cost Analysis
                  </h3>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    {aiResult.costAnalysis}
                  </p>
                </div>
              )}

              {/* AI Insights */}
              {aiResult.insights.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Insights
                  </h3>
                  <div className="grid gap-3">
                    {aiResult.insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`rounded-lg p-3 border ${getInsightColor(
                          insight.type
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getIcon(insight.icon)}
                          <span className="font-medium text-sm">
                            {insight.title}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {insight.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {aiResult.recommendations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {aiResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-blue-800 dark:text-blue-200 text-sm">
                          {rec}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-center pt-4 gap-2">
                <Button onClick={onGenerate} variant="outline" size="sm">
                  <Brain className="w-4 h-4 mr-2" />
                  Regenerate Analysis
                </Button>
                <Button onClick={onClear} variant="destructive" size="sm">
                  Clear Analysis
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
