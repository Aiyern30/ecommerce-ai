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
  Sparkles,
  Zap,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import ProductRecommendations from "./ProductRecommendations";

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

// Enhanced Loading Component
function LoadingAnalysis() {
  const [loadingText, setLoadingText] = useState("Initializing AI analysis...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = [
      "Initializing AI analysis...",
      "Processing product specifications...",
      "Analyzing technical differences...",
      "Calculating cost comparisons...",
      "Generating recommendations...",
      "Finalizing insights...",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingText(steps[currentStep]);
        setProgress((currentStep / (steps.length - 1)) * 100);
      }
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-12 px-6">
      <div className="relative mb-8">
        {/* Animated Brain Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 animate-ping">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 opacity-20"></div>
          </div>
          <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm mx-auto mb-6">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>Processing</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Loading Text with Typing Effect */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Analysis in Progress
        </h3>
        <p className="text-purple-600 dark:text-purple-400 font-medium min-h-[1.5rem]">
          {loadingText}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Our AI is analyzing product specifications, comparing technical
          details, and generating personalized recommendations for your
          construction project.
        </p>
      </div>

      {/* Animated Dots */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// Enhanced Generate Button Component
function GenerateAnalysisButton({
  onGenerate,
  productCount,
}: {
  onGenerate: () => void;
  productCount: number;
}) {
  return (
    <div className="text-center py-8 px-6">
      <div className="max-w-md mx-auto">
        {/* Icon with Gradient Background */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-200">
            <Brain className="w-10 h-10 text-white" />
            <Zap className="absolute -top-1 -right-1 w-6 h-6 text-yellow-300 animate-bounce" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Ready for AI Analysis
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Get powerful AI insights comparing your {productCount} selected
          products. Our analysis includes technical specifications, cost
          comparisons, and personalized recommendations.
        </p>

        {/* Feature List */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
          <div className="flex items-center gap-2 text-left">
            <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              Cost Analysis
            </span>
          </div>
          <div className="flex items-center gap-2 text-left">
            <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              Smart Insights
            </span>
          </div>
          <div className="flex items-center gap-2 text-left">
            <Brain className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              AI Recommendations
            </span>
          </div>
          <div className="flex items-center gap-2 text-left">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">Use Cases</span>
          </div>
        </div>

        <Button
          onClick={onGenerate}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Brain className="w-5 h-5 mr-2" />
          Generate AI Analysis
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Analysis typically takes 10-15 seconds
        </p>
      </div>
    </div>
  );
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
        return "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200";
      case "analysis":
        return "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200";
      case "tip":
        return "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  // Convert AI result to ProductRecommendations format
  const getProductRecommendationsFromAI = () => {
    if (!aiResult || comparedProducts.length === 0) return null;

    // Pick the first product as the "current product" for the recommendation engine
    // The ProductRecommendations component needs a current product to base recommendations on
    const currentProduct = comparedProducts[0];

    return currentProduct;
  };

  if (comparedProducts.length < 2) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
            <Brain className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            AI Smart Comparison
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Select at least 2 products to unlock AI-powered insights and
            personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden p-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 py-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Smart Comparison
            </span>
            <div className="ml-auto">
              <div className="px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full text-xs font-medium text-purple-700 dark:text-purple-300">
                {comparedProducts.length} products
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <LoadingAnalysis />
          ) : error ? (
            <div className="text-center py-8 px-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Analysis Failed
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-6 max-w-md mx-auto">
                {error}
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={onGenerate}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : !aiResult ? (
            <GenerateAnalysisButton
              onGenerate={onGenerate}
              productCount={comparedProducts.length}
            />
          ) : (
            <div className="p-6 space-y-8">
              {/* AI Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    AI Analysis Summary
                  </h3>
                </div>
                <div className="text-purple-800 dark:text-purple-200 leading-relaxed">
                  <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                    {aiResult.summary}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Key Insights Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Key Differences */}
                {aiResult.keyDifferences.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800/50">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Key Differences
                    </h3>
                    <ul className="space-y-2">
                      {aiResult.keyDifferences
                        .slice(0, 3)
                        .map((diff, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-blue-800 dark:text-blue-200">
                              {diff}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Cost Analysis */}
                {aiResult.costAnalysis && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800/50">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Cost Analysis
                    </h3>
                    <div className="text-sm text-green-800 dark:text-green-200">
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                        {aiResult.costAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Insights */}
              {aiResult.insights.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    AI Insights
                  </h3>
                  <div className="grid gap-4">
                    {aiResult.insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`rounded-xl p-4 border transition-all hover:shadow-md ${getInsightColor(
                          insight.type
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getIcon(insight.icon)}
                          <span className="font-medium text-sm">
                            {insight.title}
                          </span>
                        </div>
                        <div className="text-sm leading-relaxed">
                          {insight.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center pt-6 gap-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={onGenerate}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Analysis
                </Button>
                <Button onClick={onClear} variant="destructive" size="sm">
                  Clear Analysis
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Recommendations Section */}
      {aiResult && comparedProducts.length > 0 && (
        <div className="mt-8">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Related Product Recommendations
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Based on your comparison, discover more products that might suit
              your needs
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-3xl p-6 border border-blue-100 dark:border-blue-800">
            <ProductRecommendations
              currentProduct={getProductRecommendationsFromAI()!}
              className="ai-comparison-recommendations"
            />
          </div>
        </div>
      )}
    </div>
  );
}
