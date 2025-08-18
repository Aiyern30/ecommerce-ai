"use client";

import React, { useState } from "react";
import {
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Package,
  Info,
} from "lucide-react";
import Image from "next/image";

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
    color: "bg-gray-100 border-gray-300",
    textColor: "text-gray-700",
  },
  {
    grade: "N15",
    name: "Concrete N15",
    description: "Light-duty residential",
    use_case: "Footpaths, kerbs, small projects",
    color: "bg-green-100 border-green-300",
    textColor: "text-green-700",
  },
  {
    grade: "N20",
    name: "Concrete N20",
    description: "Versatile construction",
    use_case: "Driveways, foundations, floors",
    color: "bg-blue-100 border-blue-300",
    textColor: "text-blue-700",
  },
  {
    grade: "N25",
    name: "Concrete N25",
    description: "Structural elements",
    use_case: "Columns, beams, commercial",
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-700",
  },
  {
    grade: "S30",
    name: "Concrete S30",
    description: "High-strength structural",
    use_case: "Suspended slabs, precast",
    color: "bg-orange-100 border-orange-300",
    textColor: "text-orange-700",
  },
  {
    grade: "S35",
    name: "Concrete S35",
    description: "High-rise buildings",
    use_case: "Infrastructure, durability",
    color: "bg-red-100 border-red-300",
    textColor: "text-red-700",
  },
  {
    grade: "S40",
    name: "Concrete S40",
    description: "Heavy-duty structural",
    use_case: "Bridges, multi-story parks",
    color: "bg-indigo-100 border-indigo-300",
    textColor: "text-indigo-700",
  },
  {
    grade: "S45",
    name: "Concrete S45",
    description: "Ultra-high-strength",
    use_case: "Critical structures, mega projects",
    color: "bg-pink-100 border-pink-300",
    textColor: "text-pink-700",
  },
];

export default function ConcreteDetectorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);

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
    return product || concreteProducts[2]; // Default to N20 style
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold">AI Concrete Detector</h1>
            </div>
            <p className="text-lg max-w-2xl mx-auto">
              Upload construction photos and get instant AI-powered concrete
              grade recommendations with pricing and availability
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Vertical layout: input/upload at top, product guide below */}
        <div className="flex flex-col gap-8">
          {/* Main Upload Section (top) */}
          <div>
            <div className="rounded-xl shadow-lg p-8">
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="rounded-full p-4 bg-blue-100 dark:bg-blue-900">
                          <Upload className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-600 font-semibold text-lg">
                          Click to upload
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-lg">
                          {" "}
                          or drag and drop
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
                        <span>✓ Construction sites</span>
                        <span>✓ Building structures</span>
                        <span>✓ Concrete elements</span>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Preview */}
                {preview && (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Camera className="h-5 w-5 mr-2" />
                        Image Preview
                      </h3>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain rounded-lg"
                        sizes="100vw"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                {file && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Analyze & Get Recommendations
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 border rounded-lg p-4 bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Results Display */}
              {result && result.success && (
                <div className="mt-8 space-y-6">
                  {/* Success Message */}
                  <div className="border rounded-lg p-6 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-green-800 dark:text-green-200">
                          {result.message}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                          Confidence Score: {result.confidence}% •{" "}
                          {result.totalProducts || 0} products analyzed
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product Recommendation */}
                  {result.matchedProduct && (
                    <div className="border-2 rounded-xl p-6 shadow-lg bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {result.matchedProduct.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {result.matchedProduct.description}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold ${
                            getProductStyle(result.matchedProduct.grade).color
                          } ${
                            getProductStyle(result.matchedProduct.grade)
                              .textColor
                          } border-2`}
                        >
                          {result.matchedProduct.grade}
                        </span>
                      </div>

                      {/* Pricing Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="rounded-lg p-4 border bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Normal Price
                          </span>
                          <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                            ${result.matchedProduct.normal_price}
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-300">
                            {result.matchedProduct.unit}
                          </span>
                        </div>

                        {result.matchedProduct.pump_price && (
                          <div className="rounded-lg p-4 border bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Pump Price
                            </span>
                            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                              ${result.matchedProduct.pump_price}
                            </div>
                            <span className="text-xs text-blue-600 dark:text-blue-300">
                              {result.matchedProduct.unit}
                            </span>
                          </div>
                        )}

                        <div className="rounded-lg p-4 border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Stock Available
                          </span>
                          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {result.matchedProduct.stock_quantity}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            m³ in stock
                          </span>
                        </div>
                      </div>

                      {/* Additional Pricing Options */}
                      {(result.matchedProduct.tremie_1_price ||
                        result.matchedProduct.tremie_2_price ||
                        result.matchedProduct.tremie_3_price) && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Tremie Delivery Options
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {result.matchedProduct.tremie_1_price && (
                              <div className="text-center p-3 rounded border bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800">
                                <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                                  ${result.matchedProduct.tremie_1_price}
                                </div>
                                <span className="text-xs text-yellow-600 dark:text-yellow-300">
                                  Tremie Level 1
                                </span>
                              </div>
                            )}
                            {result.matchedProduct.tremie_2_price && (
                              <div className="text-center p-3 rounded border bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-800">
                                <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
                                  ${result.matchedProduct.tremie_2_price}
                                </div>
                                <span className="text-xs text-orange-600 dark:text-orange-300">
                                  Tremie Level 2
                                </span>
                              </div>
                            )}
                            {result.matchedProduct.tremie_3_price && (
                              <div className="text-center p-3 rounded border bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800">
                                <div className="text-lg font-bold text-red-800 dark:text-red-200">
                                  ${result.matchedProduct.tremie_3_price}
                                </div>
                                <span className="text-xs text-red-600 dark:text-red-300">
                                  Tremie Level 3
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detected Elements */}
                  {result.detectedLabels &&
                    result.detectedLabels.length > 0 && (
                      <div className="rounded-lg p-4 border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <h4 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
                          <Info className="h-4 w-4 mr-2" />
                          AI Detected Elements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.detectedLabels.map((label, index) => (
                            <span
                              key={index}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-200 shadow-sm"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
          {/* Product Guide (bottom) */}
          <div>
            <div className="rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Product Guide</h2>
                <button
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAllProducts ? "Show Less" : "View All"}
                </button>
              </div>
              <div className="space-y-3">
                {concreteProducts
                  .slice(0, showAllProducts ? 8 : 4)
                  .map((product) => (
                    <div
                      key={product.grade}
                      className={`rounded-lg p-4 border-2 ${product.color} ${product.textColor} hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">{product.grade}</h3>
                        <Package className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {product.description}
                      </p>
                      <p className="text-xs opacity-80">{product.use_case}</p>
                    </div>
                  ))}
              </div>
              {!showAllProducts && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    +{concreteProducts.length - 4} more grades available
                  </p>
                </div>
              )}
              <div className="mt-6 p-4 rounded-lg border bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  How it works
                </h3>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex items-start">
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      1
                    </span>
                    Upload construction photo
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      2
                    </span>
                    AI analyzes structure & context
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      3
                    </span>
                    Get personalized recommendations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
