"use client";

import React, { useState } from "react";
import {
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Package,
  Info,
  Target,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import Image from "next/image";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
  TypographyH5,
  TypographySmall,
  TypographyMuted,
} from "@/components/ui/Typography";
import { Button } from "@/components/ui/";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Badge } from "@/components/ui/";

interface DetectionResult {
  success: boolean;
  detectedLabels: string[];
  matchedProduct: {
    id: string;
    name: string;
    description: string;
    grade: string;
    normal_price: string;
    pump_price?: string;
    tremie_1_price?: string;
    tremie_2_price?: string;
    tremie_3_price?: string;
    unit: string;
    stock_quantity: number;
    keywords: string[];
  } | null;
  confidence: number;
  message: string;
  totalProducts?: number;
}

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

export default function ConcreteDetectorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.05),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-3xl mb-8 shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <TypographyH1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
            AI Concrete Detector
          </TypographyH1>
          <TypographyP className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Revolutionary AI-powered concrete analysis. Upload construction
            photos for instant grade identification, pricing, and professional
            recommendations.
          </TypographyP>

          {/* Feature highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
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

      <div className="max-w-5xl mx-auto px-6 pb-12">
        {!result ? (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="p-0">
              {!file ? (
                /* Enhanced Upload State with Fixed Click Area */
                <div className="p-8">
                  <div className="text-center mb-8">
                    <TypographyH3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Upload Your Construction Photo
                    </TypographyH3>
                    <TypographyP className="text-gray-600 dark:text-gray-300">
                      Get instant AI-powered concrete recommendations with
                      professional accuracy
                    </TypographyP>
                  </div>

                  {/* Fixed Upload Area - Hidden input positioned absolutely */}
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
                      className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-16 
                      hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 
                      dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50
                      transition-all duration-500 cursor-pointer group-hover:shadow-lg"
                    >
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10 space-y-8">
                        {/* Enhanced upload icon */}
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 rounded-full group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-700 dark:group-hover:to-indigo-700 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                          <Upload className="h-12 w-12 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                        </div>

                        <div className="space-y-4">
                          <TypographyH5 className="text-xl font-bold text-gray-900 dark:text-white">
                            Drop your image here or click to browse
                          </TypographyH5>
                          <TypographyP className="text-gray-600 dark:text-gray-300">
                            Supports JPG, PNG, GIF up to 10MB
                          </TypographyP>
                        </div>

                        {/* Enhanced feature icons */}
                        <div className="flex items-center justify-center space-x-12 pt-4">
                          <div className="flex flex-col items-center space-y-2 group/item">
                            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl group-hover/item:bg-blue-200 dark:group-hover/item:bg-blue-700 transition-colors">
                              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <TypographySmall className="text-gray-600 dark:text-gray-400 font-medium">
                              Construction sites
                            </TypographySmall>
                          </div>
                          <div className="flex flex-col items-center space-y-2 group/item">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-xl group-hover/item:bg-emerald-200 dark:group-hover/item:bg-emerald-700 transition-colors">
                              <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <TypographySmall className="text-gray-600 dark:text-gray-400 font-medium">
                              Building structures
                            </TypographySmall>
                          </div>
                          <div className="flex flex-col items-center space-y-2 group/item">
                            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-xl group-hover/item:bg-purple-200 dark:group-hover/item:bg-purple-700 transition-colors">
                              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <TypographySmall className="text-gray-600 dark:text-gray-400 font-medium">
                              Concrete elements
                            </TypographySmall>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Enhanced File Selected State */
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <TypographyH5 className="font-bold text-gray-900 dark:text-white">
                          Ready for Analysis
                        </TypographyH5>
                        <TypographySmall className="text-gray-600 dark:text-gray-400">
                          AI will analyze your construction photo
                        </TypographySmall>
                      </div>
                    </div>
                    <Button
                      onClick={resetForm}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Button>
                  </div>

                  {/* Enhanced image preview */}
                  {preview && (
                    <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-800 shadow-lg">
                      <CardContent className="p-0">
                        <div className="relative w-full h-80 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center">
                          <Image
                            src={preview}
                            alt="Construction photo preview"
                            fill
                            style={{ objectFit: "contain" }}
                            sizes="600px"
                            className="rounded-lg"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Enhanced file info card */}
                  <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-700">
                          <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <TypographyH5 className="font-bold text-gray-900 dark:text-white mb-1">
                            {file.name}
                          </TypographyH5>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700"
                            >
                              Ready to process
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced AI Analysis Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="relative w-full h-16 rounded-2xl font-bold text-lg 
    bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
    dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 
    text-white overflow-hidden group
    transition-all duration-300 
    hover:scale-[1.02] hover:shadow-2xl 
    focus:ring-4 focus:ring-indigo-400/50 
    disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                  >
                    {/* Animated glow layer */}
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

                    {loading ? (
                      <div className="flex items-center justify-center w-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                        <div className="flex flex-col items-start">
                          <span>AI Analysis in Progress...</span>
                          <span className="text-sm font-normal opacity-90">
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
                          <span className="text-sm font-normal opacity-90">
                            Get instant concrete recommendations
                          </span>
                        </div>
                      </div>
                    )}
                  </Button>
                </div>
              )}

              {/* Enhanced Error Display */}
              {error && (
                <div className="mx-8 mb-8">
                  <Card className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <TypographyH5 className="text-red-800 dark:text-red-300 font-semibold mb-1">
                            Upload Error
                          </TypographyH5>
                          <TypographyP className="text-red-700 dark:text-red-400">
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
          /* Enhanced Results State */
          <div className="space-y-6">
            {/* Success Header */}
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                  <div className="relative flex items-center">
                    <div className="p-3 bg-white/20 rounded-2xl mr-4 backdrop-blur-sm">
                      <CheckCircle className="h-10 w-10" />
                    </div>
                    <div className="flex-1">
                      <TypographyH3 className="text-3xl font-bold mb-2">
                        {result.message}
                      </TypographyH3>
                      <div className="flex items-center space-x-6 text-green-100 dark:text-green-200">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4" />
                          <span>{result.confidence}% confidence</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Analyzed in seconds</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Recommendation */}
            {result.matchedProduct && (
              <Card className="border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-blue-100 dark:border-blue-800 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {result.matchedProduct.name}
                      </CardTitle>
                      <TypographyP className="text-gray-600 dark:text-gray-300 text-lg">
                        {result.matchedProduct.description}
                      </TypographyP>
                    </div>
                    <Badge
                      className={`text-lg font-bold px-4 py-2 ${
                        getProductStyle(result.matchedProduct.grade).badgeColor
                      } border`}
                    >
                      {result.matchedProduct.grade}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  {/* Enhanced Pricing Cards */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="relative overflow-hidden border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 transition-colors group">
                      <CardContent className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 group-hover:from-green-100 group-hover:to-emerald-100 dark:group-hover:from-green-950/70 dark:group-hover:to-emerald-950/70 transition-colors">
                        <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border-green-200 dark:border-green-600 mb-3">
                          Normal Price
                        </Badge>
                        <TypographyH3 className="text-4xl font-bold text-green-800 dark:text-green-300 mb-2">
                          ${result.matchedProduct.normal_price}
                        </TypographyH3>
                        <TypographyMuted className="text-green-600 dark:text-green-400 font-medium">
                          per {result.matchedProduct.unit}
                        </TypographyMuted>
                      </CardContent>
                    </Card>

                    {result.matchedProduct.pump_price && (
                      <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group">
                        <CardContent className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-950/70 dark:group-hover:to-indigo-950/70 transition-colors">
                          <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-600 mb-3">
                            Pump Price
                          </Badge>
                          <TypographyH3 className="text-4xl font-bold text-blue-800 dark:text-blue-300 mb-2">
                            ${result.matchedProduct.pump_price}
                          </TypographyH3>
                          <TypographyMuted className="text-blue-600 dark:text-blue-400 font-medium">
                            per {result.matchedProduct.unit}
                          </TypographyMuted>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors group">
                      <CardContent className="p-6 text-center bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50 group-hover:from-gray-100 group-hover:to-slate-100 dark:group-hover:from-gray-950/70 dark:group-hover:to-slate-950/70 transition-colors">
                        <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 mb-3">
                          Available Stock
                        </Badge>
                        <TypographyH3 className="text-4xl font-bold text-gray-800 dark:text-gray-300 mb-2">
                          {result.matchedProduct.stock_quantity}
                        </TypographyH3>
                        <TypographyMuted className="text-gray-600 dark:text-gray-400 font-medium">
                          m³ in stock
                        </TypographyMuted>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detected Elements */}
                  {result.detectedLabels &&
                    result.detectedLabels.length > 0 && (
                      <Card className="mb-6 border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <TypographyH5 className="font-bold text-gray-900 dark:text-white">
                              AI Detected Elements
                            </TypographyH5>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {result.detectedLabels.map((label, index) => (
                              <Badge
                                key={index}
                                className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Enhanced Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="flex-1 h-12 font-semibold border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Analyze Another Photo
                    </Button>
                    <Button className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-400 dark:hover:to-indigo-400 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Get Professional Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
