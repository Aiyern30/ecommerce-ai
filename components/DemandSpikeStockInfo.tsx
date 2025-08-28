"use client";

import { useState, useEffect } from "react";
import { Package, TrendingUp, AlertTriangle } from "lucide-react";

interface DemandSpikeStockInfoProps {
  productId: string;
  growthRate: number;
}

interface ProductStock {
  id: string;
  name: string;
  stock_quantity: number;
  grade: string;
  product_type: string;
}

export default function DemandSpikeStockInfo({
  productId,
  growthRate,
}: DemandSpikeStockInfoProps) {
  const [productStock, setProductStock] = useState<ProductStock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductStock = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/stock`);
        if (response.ok) {
          const data = await response.json();
          setProductStock(data);
        }
      } catch (error) {
        console.error("Failed to fetch product stock:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductStock();
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-2 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-400">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!productStock) {
    return (
      <div className="mt-2 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-400">
        <div className="text-xs">
          <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
            <span className="font-medium">📈 Trend Analysis:</span> This product
            shows significant demand growth. Consider increasing inventory to
            meet projected demand.
          </p>
        </div>
      </div>
    );
  }

  // Calculate suggested stock increase based on demand growth
  const currentStock = productStock.stock_quantity;
  const suggestedIncrease = Math.min(
    Math.round((growthRate / 100) * currentStock),
    2000
  ); // Cap at 2000
  const targetStock = currentStock + suggestedIncrease;

  // Determine stock status
  const getStockStatus = (stock: number) => {
    if (stock < 100)
      return {
        status: "critical",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      };
    if (stock < 300)
      return {
        status: "low",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      };
    if (stock < 1000)
      return {
        status: "moderate",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
      };
    return {
      status: "good",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    };
  };

  const stockStatus = getStockStatus(currentStock);

  return (
    <div className="mt-2 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-400">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
            Current Stock & Demand Analysis
          </span>
        </div>

        {/* Stock Information - Mobile Stacked, Desktop Grid */}
        <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3 text-xs">
          {/* Left Column */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Current Stock:
              </span>
              <span className={`font-bold ${stockStatus.color}`}>
                {currentStock} m³
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Growth Rate:
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                +{growthRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Suggested Increase:
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                +{suggestedIncrease} m³
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Target Stock:
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {targetStock} m³
              </span>
            </div>
          </div>
        </div>

        {/* Stock Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Stock Status:
            </span>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
          >
            {stockStatus.status.toUpperCase()}
          </div>
        </div>

        {/* Recommendation based on stock level */}
        <div className="text-xs bg-white/70 dark:bg-gray-800/70 rounded p-2 border border-blue-200 dark:border-blue-700">
          {currentStock < 300 ? (
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <span className="font-medium text-orange-700 dark:text-orange-300 block sm:inline">
                  Priority Action:
                </span>
                <span className="text-orange-600 dark:text-orange-400 block sm:inline sm:ml-1">
                  Low current stock combined with high demand growth requires
                  immediate restocking.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="font-medium text-blue-700 dark:text-blue-300 block sm:inline">
                Recommendation:
              </span>
              <span className="text-blue-600 dark:text-blue-400 block sm:inline sm:ml-1">
                Prepare for increased demand by adding {suggestedIncrease} m³ to
                inventory within next week.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
