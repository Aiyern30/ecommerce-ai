/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Package,
  Target,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Sparkles,
  ArrowRight,
  Clock,
  Calculator,
  DollarSign,
  Truck,
  Building,
  Waves,
  BarChart3,
  Zap,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import Image from "next/image";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
  TypographyH5,
  TypographySmall,
} from "@/components/ui/Typography";
import { Button } from "@/components/ui/";
import { Card, CardContent } from "@/components/ui/";
import { Badge } from "@/components/ui/";

const concreteProducts = [
  {
    grade: "N10",
    name: "Concrete N10",
    description: "Non-structural applications",
    use_case: "Blinding, filling, leveling",
    strength: "10 MPa",
    color:
      "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700",
    textColor: "text-slate-700 dark:text-slate-300",
    badgeColor:
      "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600",
  },
  {
    grade: "N15",
    name: "Concrete N15",
    description: "Light-duty residential",
    use_case: "Footpaths, kerbs, small projects",
    strength: "15 MPa",
    color:
      "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
    textColor: "text-emerald-800 dark:text-emerald-300",
    badgeColor:
      "bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-600",
  },
  {
    grade: "N20",
    name: "Concrete N20",
    description: "Versatile construction",
    use_case: "Driveways, foundations, floors",
    strength: "20 MPa",
    color:
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-300",
    badgeColor:
      "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-600",
  },
  {
    grade: "N25",
    name: "Concrete N25",
    description: "Structural elements",
    use_case: "Columns, beams, commercial",
    strength: "25 MPa",
    color:
      "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/30",
    textColor: "text-violet-800 dark:text-violet-300",
    badgeColor:
      "bg-violet-100 dark:bg-violet-800 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-600",
  },
  {
    grade: "S30",
    name: "Concrete S30",
    description: "High-strength structural",
    use_case: "Suspended slabs, precast",
    strength: "30 MPa",
    color:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30",
    textColor: "text-amber-800 dark:text-amber-300",
    badgeColor:
      "bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-600",
  },
  {
    grade: "S35",
    name: "Concrete S35",
    description: "High-rise buildings",
    use_case: "Infrastructure, durability",
    strength: "35 MPa",
    color:
      "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30",
    textColor: "text-rose-800 dark:text-rose-300",
    badgeColor:
      "bg-rose-100 dark:bg-rose-800 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-600",
  },
];

interface EnhancedQuantityEstimation {
  estimatedVolume: number;
  safetyVolume: number;
  confidenceLevel: "low" | "medium" | "high";
  reasoning: string;
  projectType: string;
  additionalRecommendations: string[];
  range: {
    min: number;
    max: number;
    recommended: number;
  };
  breakdown: {
    baseEstimate: number;
    safetyMargin: number;
    wastageAllowance: number;
  };
}

interface ComprehensiveCosts {
  [key: string]: {
    label: string;
    icon: string;
    description: string;
    pricePerUnit: number;
    costs: {
      estimated: number;
      withSafety: number;
      recommended: number;
      range: { min: number; max: number };
    };
  };
}

interface ProjectInsights {
  complexity: "low" | "medium" | "high";
  recommendedGrades: string[];
  timeline: {
    concrete: string;
    curing: string;
    total: string;
  };
  specialConsiderations: string[];
}

interface EnhancedDetectionResult {
  success: boolean;
  detectedLabels: string[];
  matchedProduct: any;
  confidence: number;
  message: string;
  quantityEstimation?: EnhancedQuantityEstimation;
  comprehensiveCosts?: ComprehensiveCosts;
  projectInsights?: ProjectInsights;
  analysisMetadata?: {
    elementsDetected: number;
    labelsFound: number;
    processingTime: string;
    aiConfidence: number;
    labelDetails?: {
      description: string;
      score: number;
      confidence: number;
    }[];
  };
}

export default function ConcreteDetectorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnhancedDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "estimation" | "pricing" | "insights" | "detection"
  >("estimation");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Upload failed";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError(null);
  };

  const getProductStyle = (grade: string) => {
    const product = concreteProducts.find((p) => p.grade === grade);
    return product || concreteProducts[2];
  };

  // Fixed click handler for upload area
  const handleUploadClick = () => {
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const getComplexityBadge = (complexity: string) => {
    const badges = {
      low: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      medium:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      high: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    return badges[complexity as keyof typeof badges] || badges.low;
  };

  const getProjectTypeIcon = (projectType: string) => {
    const icons: { [key: string]: any } = {
      foundation: Building,
      slab: CheckSquare,
      driveway: Truck,
      wall: BarChart3,
      column: TrendingUpIcon,
      beam: TrendingDown,
      stairs: TrendingUpIcon,
      pool: Waves,
      general: Package,
    };
    return icons[projectType] || Package;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950">
      {/* Enhanced Hero Header - Mobile Responsive */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.05),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-lg">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <TypographyH1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4 sm:mb-6">
            AI Concrete Detector
          </TypographyH1>
          <TypographyP className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            Revolutionary AI-powered concrete analysis. Upload construction
            photos for instant grade identification, pricing, and professional
            recommendations.
          </TypographyP>

          {/* Feature highlights - Mobile Responsive */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Instant Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Real-time Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Professional Grade</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        {!result ? (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-0">
            <CardContent className="p-0">
              {!file ? (
                <div className="p-4 sm:p-8 text-center">
                  <div className="text-center mb-6 sm:mb-8">
                    <TypographyH3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Upload Your Construction Photo
                    </TypographyH3>
                    <TypographyP className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Get instant AI-powered concrete recommendations with
                      professional accuracy
                    </TypographyP>
                  </div>

                  {/* Mobile Responsive Upload Area */}
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="sr-only"
                      id="file-upload"
                    />

                    <div
                      onClick={handleUploadClick}
                      className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl p-8 sm:p-16 
                      hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 
                      dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50
                      transition-all duration-500 cursor-pointer group-hover:shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10 space-y-4 sm:space-y-8">
                        {/* Mobile Responsive Upload Icon */}
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 rounded-full group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-700 dark:group-hover:to-indigo-700 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                          <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                        </div>

                        <div className="space-y-2 sm:space-y-4">
                          <TypographyH5 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            Drop your image here or click to browse
                          </TypographyH5>
                          <TypographyP className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                            Supports JPG, PNG, GIF up to 10MB
                          </TypographyP>
                        </div>

                        {/* Mobile Responsive Feature Icons */}
                        <div className="flex items-center justify-center space-x-6 sm:space-x-12 pt-2 sm:pt-4">
                          <div className="flex flex-col items-center space-y-1 sm:space-y-2 group/item">
                            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-800 rounded-lg sm:rounded-xl group-hover/item:bg-blue-200 dark:group-hover:item:bg-blue-700 transition-colors">
                              <Target className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <TypographySmall className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
                              Construction sites
                            </TypographySmall>
                          </div>
                          <div className="flex flex-col items-center space-y-1 sm:space-y-2 group/item">
                            <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-800 rounded-lg sm:rounded-xl group-hover/item:bg-emerald-200 dark:group-hover:item:bg-emerald-700 transition-colors">
                              <Package className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <TypographySmall className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
                              Building structures
                            </TypographySmall>
                          </div>
                          <div className="flex flex-col items-center space-y-1 sm:space-y-2 group/item">
                            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-800 rounded-lg sm:rounded-xl group-hover:item:bg-purple-200 dark:group-hover:item:bg-purple-700 transition-colors">
                              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <TypographySmall className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
                              Concrete elements
                            </TypographySmall>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mobile Responsive File Selected State */
                <div className="p-4 sm:p-8 space-y-4 sm:space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <TypographyH5 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          Ready for Analysis
                        </TypographyH5>
                        <TypographySmall className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          AI will analyze your construction photo
                        </TypographySmall>
                      </div>
                    </div>
                    <Button
                      onClick={resetForm}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                    </Button>
                  </div>

                  {/* Mobile Responsive Image Preview */}
                  {preview && (
                    <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-800 shadow-lg">
                      <CardContent className="p-0">
                        <div className="relative w-full h-48 sm:h-80 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center">
                          <Image
                            src={preview}
                            alt="Construction photo preview"
                            fill
                            style={{ objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, 600px"
                            className="rounded-lg"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Mobile Responsive File Info */}
                  <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-700">
                          <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <TypographyH5 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 truncate">
                            {file.name}
                          </TypographyH5>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 w-fit"
                            >
                              Ready to process
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mobile Responsive AI Analysis Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="relative w-full h-12 sm:h-16 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg 
    bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
    dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 
    text-white overflow-hidden group
    transition-all duration-300 
    hover:scale-[1.02] hover:shadow-2xl 
    focus:ring-4 focus:ring-indigo-400/50 
    disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

                    {loading ? (
                      <div className="flex items-center justify-center w-full">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent mr-2 sm:mr-3"></div>
                        <div className="flex flex-col items-center">
                          <span>AI Analysis in Progress...</span>
                          <span className="text-xs sm:text-sm font-normal opacity-90 hidden sm:block">
                            Processing your image with advanced algorithms
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <div className="flex flex-col items-center">
                          <span className="tracking-wide">
                            Start AI Analysis
                          </span>
                          <span className="text-xs sm:text-sm font-normal opacity-90 hidden sm:block">
                            Get instant concrete recommendations
                          </span>
                        </div>
                      </div>
                    )}
                  </Button>
                </div>
              )}

              {error && (
                <div className="mx-4 sm:mx-8 mb-4 sm:mb-8">
                  <Card className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <TypographyH5 className="text-sm sm:text-base text-red-800 dark:text-red-300 font-semibold mb-1">
                            Upload Error
                          </TypographyH5>
                          <TypographyP className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                            {error}
                          </TypographyP>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Mobile Responsive Results */
          <div className="space-y-4 sm:space-y-8 mt-6">
            <Card className="overflow-hidden border-0 shadow-2xl py-0">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 p-4 sm:p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_50%)]"></div>
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                      <div className="flex items-center">
                        <div className="p-3 sm:p-4 bg-white/20 rounded-xl sm:rounded-2xl mr-3 sm:mr-4 backdrop-blur-sm">
                          <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12" />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                            {result.message}
                          </h2>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-green-100">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span className="text-sm sm:text-lg font-semibold">
                                {result.confidence}% AI Confidence
                              </span>
                            </div>
                            {result.analysisMetadata && (
                              <>
                                <div className="flex items-center space-x-2">
                                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span className="text-sm sm:text-base">
                                    {result.analysisMetadata.elementsDetected}{" "}
                                    Elements Detected
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span className="text-sm sm:text-base">
                                    Instant Analysis
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {result.projectInsights && (
                        <div className="text-left sm:text-right">
                          <Badge
                            className={`text-sm sm:text-lg font-bold px-3 sm:px-4 py-1 sm:py-2 ${getComplexityBadge(
                              result.projectInsights.complexity
                            )}`}
                          >
                            {result.projectInsights.complexity.toUpperCase()}{" "}
                            COMPLEXITY
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Mobile Responsive Project Type Indicator */}
                    {result.quantityEstimation && (
                      <div className="flex items-center space-x-3 sm:space-x-4 bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm mb-3 sm:mb-0">
                        <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
                          {(() => {
                            const IconComponent = getProjectTypeIcon(
                              result.quantityEstimation.projectType
                            );
                            return (
                              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                            );
                          })()}
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-semibold capitalize">
                            {result.quantityEstimation.projectType} Project
                            Detected
                          </div>
                          <div className="text-green-100 text-xs sm:text-sm">
                            {result.quantityEstimation.reasoning}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Responsive Detected Labels */}
                    {result.detectedLabels &&
                      result.detectedLabels.length > 0 && (
                        <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-lg font-semibold">
                              AI Detection Results
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {result.detectedLabels.map((label, index) => (
                              <Badge
                                key={index}
                                className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors text-xs sm:text-sm"
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-green-100 text-xs mt-1 sm:mt-2">
                            {result.detectedLabels.length} elements identified
                            by AI vision
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Responsive Tabbed Content */}
            <Card className="border-0 shadow-xl py-0">
              <CardContent className="p-0">
                {/* Mobile Responsive Tab Navigation - Horizontal Scroll */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-4 sm:space-x-8 px-4 sm:px-8 pt-4 sm:pt-6 min-w-max">
                      {[
                        {
                          id: "estimation",
                          label: "Quantity Analysis",
                          icon: Calculator,
                        },
                        {
                          id: "pricing",
                          label: "Cost Breakdown",
                          icon: DollarSign,
                        },
                        {
                          id: "insights",
                          label: "Project Insights",
                          icon: Lightbulb,
                        },
                        {
                          id: "detection",
                          label: "AI Detection",
                          icon: Target,
                        },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center space-x-1 sm:space-x-2 pb-3 sm:pb-4 border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-600 dark:text-blue-400"
                              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="font-semibold text-xs sm:text-sm">
                            {tab.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-8">
                  {/* Mobile Responsive Tab Content */}
                  {activeTab === "estimation" && result.quantityEstimation && (
                    <div className="space-y-4 sm:space-y-8">
                      {/* Main Quantity Display */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-700">
                          <CardContent className="p-6 text-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl w-fit mx-auto mb-4">
                              <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                              BASE ESTIMATE
                            </div>
                            <div className="text-4xl font-bold text-blue-800 dark:text-blue-300 mb-1">
                              {result.quantityEstimation.estimatedVolume}
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 font-medium">
                              m³
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 border-2 border-green-200 dark:border-green-700">
                          <CardContent className="p-6 text-center">
                            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-xl w-fit mx-auto mb-4">
                              <CheckSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                              RECOMMENDED
                            </div>
                            <div className="text-4xl font-bold text-green-800 dark:text-green-300 mb-1">
                              {result.quantityEstimation.range.recommended}
                            </div>
                            <div className="text-green-600 dark:text-green-400 font-medium">
                              m³ (with buffer)
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-950/50 border-2 border-purple-200 dark:border-purple-700">
                          <CardContent className="p-6 text-center">
                            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-xl w-fit mx-auto mb-4">
                              <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                              WITH SAFETY MARGIN
                            </div>
                            <div className="text-4xl font-bold text-purple-800 dark:text-purple-300 mb-1">
                              {result.quantityEstimation.safetyVolume}
                            </div>
                            <div className="text-purple-600 dark:text-purple-400 font-medium">
                              m³ (safety + wastage)
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Volume Range Visualization */}
                      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Volume Range Analysis
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Minimum Estimate
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {result.quantityEstimation.range.min} m³
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full relative"
                                style={{ width: "100%" }}
                              >
                                <div className="absolute left-1/4 top-0 h-3 w-1 bg-white rounded"></div>
                                <div className="absolute left-1/2 top-0 h-3 w-1 bg-white rounded"></div>
                                <div className="absolute left-3/4 top-0 h-3 w-1 bg-white rounded"></div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Maximum Estimate
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {result.quantityEstimation.range.max} m³
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Breakdown Details */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Estimation Breakdown
                          </h3>
                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {
                                  result.quantityEstimation.breakdown
                                    .baseEstimate
                                }{" "}
                                m³
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Base Construction Need
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                                +
                                {
                                  result.quantityEstimation.breakdown
                                    .safetyMargin
                                }{" "}
                                m³
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Safety Buffer (15%)
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                                +
                                {
                                  result.quantityEstimation.breakdown
                                    .wastageAllowance
                                }{" "}
                                m³
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Wastage Allowance (5%)
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Comprehensive Pricing Tab */}
                  {activeTab === "pricing" && result.comprehensiveCosts && (
                    <div className="space-y-8">
                      {Object.entries(result.comprehensiveCosts).map(
                        ([key, option]) => (
                          <Card
                            key={key}
                            className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                  <div className="text-4xl">{option.icon}</div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {option.label}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      {option.description}
                                    </p>
                                    <div className="mt-2">
                                      <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                                        RM{option.pricePerUnit}/m³
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center">
                                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                                    BASE ESTIMATE
                                  </div>
                                  <div className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-1">
                                    RM{option.costs.estimated.toLocaleString()}
                                  </div>
                                  <div className="text-blue-600 dark:text-blue-400 text-sm">
                                    {result.quantityEstimation?.estimatedVolume}{" "}
                                    m³
                                  </div>
                                </div>

                                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 text-center">
                                  <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                                    RECOMMENDED
                                  </div>
                                  <div className="text-3xl font-bold text-green-800 dark:text-green-300 mb-1">
                                    RM
                                    {option.costs.recommended.toLocaleString()}
                                  </div>
                                  <div className="text-green-600 dark:text-green-400 text-sm">
                                    {
                                      result.quantityEstimation?.range
                                        .recommended
                                    }{" "}
                                    m³
                                  </div>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 text-center">
                                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                                    WITH SAFETY
                                  </div>
                                  <div className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-1">
                                    RM{option.costs.withSafety.toLocaleString()}
                                  </div>
                                  <div className="text-purple-600 dark:text-purple-400 text-sm">
                                    {result.quantityEstimation?.safetyVolume} m³
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Price Range:
                                  </span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    RM{option.costs.range.min.toLocaleString()}{" "}
                                    - RM
                                    {option.costs.range.max.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}

                      {/* Cost Comparison Chart */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Cost Comparison Overview
                          </h3>
                          <div className="text-center py-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Most Economical Option
                            </div>
                            {result.comprehensiveCosts &&
                              Object.entries(result.comprehensiveCosts).length >
                                0 && (
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                  RM
                                  {Math.min(
                                    ...Object.values(
                                      result.comprehensiveCosts
                                    ).map((c) => c.costs.recommended)
                                  ).toLocaleString()}
                                </div>
                              )}
                            <div className="text-gray-500 text-sm mt-1">
                              Recommended quantity with standard delivery
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Project Insights Tab */}
                  {activeTab === "insights" && result.projectInsights && (
                    <div className="space-y-8">
                      {/* Timeline */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Project Timeline
                            </h3>
                          </div>
                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {result.projectInsights.timeline.concrete}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Concrete Placement
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                                {result.projectInsights.timeline.curing}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Full Strength Curing
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                                {result.projectInsights.timeline.total}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Total Project Time
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recommended Grades */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Recommended Concrete Grades
                          </h3>
                          <div className="grid md:grid-cols-3 gap-4">
                            {result.projectInsights.recommendedGrades.map(
                              (grade) => {
                                const productStyle = getProductStyle(grade);
                                return (
                                  <div
                                    key={grade}
                                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${productStyle.color}`}
                                  >
                                    <div className="text-center">
                                      <Badge
                                        className={`mb-3 text-lg font-bold px-4 py-2 ${productStyle.badgeColor}`}
                                      >
                                        {grade}
                                      </Badge>
                                      <div
                                        className={`text-sm ${productStyle.textColor}`}
                                      >
                                        {concreteProducts.find(
                                          (p) => p.grade === grade
                                        )?.description || "Professional grade"}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Special Considerations */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Special Considerations
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {result.projectInsights.specialConsiderations &&
                            result.projectInsights.specialConsiderations
                              .length > 0 ? (
                              result.projectInsights.specialConsiderations.map(
                                (consideration, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg"
                                  >
                                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <span className="text-amber-800 dark:text-amber-300">
                                      {consideration}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-950/30 rounded-lg">
                                <Lightbulb className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                                <span className="text-gray-800 dark:text-gray-300">
                                  No special considerations detected for this
                                  project type.
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Recommendations */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            AI Professional Recommendations
                          </h3>
                          <div className="space-y-3">
                            {result.quantityEstimation
                              ?.additionalRecommendations &&
                            result.quantityEstimation.additionalRecommendations
                              .length > 0 ? (
                              result.quantityEstimation.additionalRecommendations.map(
                                (rec, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg"
                                  >
                                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <span className="text-blue-800 dark:text-blue-300">
                                      {rec}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-950/30 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                                <span className="text-gray-800 dark:text-gray-300">
                                  Standard concrete practices apply for this
                                  project.
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* AI Detection Tab */}
                  {activeTab === "detection" && (
                    <div className="space-y-8">
                      {/* Detection Summary */}
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
                              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                AI Vision Analysis
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">
                                Elements detected in your construction image
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {result.detectedLabels?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Labels Detected
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {result.analysisMetadata?.elementsDetected || 0}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Objects Found
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {result.confidence}%{result.confidence}%
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                AI Confidence
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Detected Labels with Confidence Scores */}
                      {result.analysisMetadata?.labelDetails &&
                      result.analysisMetadata.labelDetails.length > 0 ? (
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                              Detected Elements with Confidence Scores
                            </h3>
                            <div className="grid gap-3">
                              {result.analysisMetadata.labelDetails.map(
                                (label, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      <span className="font-medium text-gray-900 dark:text-white capitalize text-lg">
                                        {label.description}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className="text-right">
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {label.score}% confident
                                        </div>
                                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full ${
                                              label.score >= 80
                                                ? "bg-green-500"
                                                : label.score >= 60
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                            }`}
                                            style={{ width: `${label.score}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className={`${
                                          label.score >= 80
                                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                            : label.score >= 60
                                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                        }`}
                                      >
                                        {label.score >= 80
                                          ? "High"
                                          : label.score >= 60
                                          ? "Medium"
                                          : "Low"}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ) : result.detectedLabels &&
                        result.detectedLabels.length > 0 ? (
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                              Detected Elements & Features
                            </h3>
                            <div className="grid gap-3">
                              {result.detectedLabels.map((label, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                                      {label}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                  >
                                    Detected
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                              No Elements Detected
                            </h3>
                            <div className="text-center py-8">
                              <div className="text-gray-500 dark:text-gray-400 mb-4">
                                The AI couldn't detect specific construction
                                elements in this image.
                              </div>
                              <div className="text-sm text-gray-400 dark:text-gray-500">
                                Try uploading a clearer image with visible
                                construction elements.
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Overall Detection Confidence */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Overall Detection Confidence
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                AI Confidence Level
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {result.confidence}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                              <div
                                className={`h-4 rounded-full transition-all duration-1000 ${
                                  result.confidence >= 80
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : result.confidence >= 60
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                    : "bg-gradient-to-r from-red-500 to-pink-500"
                                }`}
                                style={{ width: `${result.confidence}%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {result.confidence >= 80
                                ? "🎯 High confidence - AI is very certain about the detection"
                                : result.confidence >= 60
                                ? "⚠️ Medium confidence - Good detection with some uncertainty"
                                : "❌ Lower confidence - Consider uploading a clearer image"}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Processing Information */}
                      {result.analysisMetadata && (
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                              Analysis Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  Processing Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      Processed:
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {new Date(
                                        result.analysisMetadata.processingTime
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      AI Engine:
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                      Google Vision API
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  Detection Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      Labels Found:
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {result.detectedLabels?.length || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      Objects Detected:
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {result.analysisMetadata.elementsDetected}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 p-8">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="flex-1 h-12 font-semibold"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Analyze Another Photo
                    </Button>
                    <Button className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Get Professional Quote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Reference Guide */}
        {!loading && (
          <Card className="mt-12 border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-0 ">
            <CardContent className="p-0">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full p-8 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group hover:rounded-xl"
              >
                <div className="flex items-center space-x-4 ">
                  <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <TypographyH3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Concrete Grade Reference Guide
                    </TypographyH3>
                    <TypographyP className="text-gray-600 dark:text-gray-300">
                      Complete overview of all concrete grades and their
                      applications
                    </TypographyP>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  {showGuide ? (
                    <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
              </button>

              {showGuide && (
                <div className="border-t border-gray-100 dark:border-gray-800 p-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {concreteProducts.map((product) => (
                      <Card
                        key={product.grade}
                        className={`relative overflow-hidden border-2 transition-all duration-300 cursor-pointer group hover:shadow-lg ${product.color}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Badge
                              className={`text-lg font-bold px-3 py-1 ${product.badgeColor}`}
                            >
                              {product.grade}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs font-medium border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            >
                              {product.strength}
                            </Badge>
                          </div>
                          <TypographyH5
                            className={`font-bold mb-2 ${product.textColor}`}
                          >
                            {product.description}
                          </TypographyH5>
                          <TypographyP
                            className={`text-sm ${product.textColor} opacity-80 leading-relaxed`}
                          >
                            {product.use_case}
                          </TypographyP>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
