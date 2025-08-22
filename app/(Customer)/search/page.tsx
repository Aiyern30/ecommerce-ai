"use client";

import React, { useState } from "react";
import {
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Package,
  Info,
  Zap,
  Target,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
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
    strength: "10 MPa",
    color: "bg-gray-100 border-gray-300",
    textColor: "text-gray-700",
  },
  {
    grade: "N15",
    name: "Concrete N15",
    description: "Light-duty residential",
    use_case: "Footpaths, kerbs, small projects",
    strength: "15 MPa",
    color: "bg-green-100 border-green-300",
    textColor: "text-green-700",
  },
  {
    grade: "N20",
    name: "Concrete N20",
    description: "Versatile construction",
    use_case: "Driveways, foundations, floors",
    strength: "20 MPa",
    color: "bg-blue-100 border-blue-300",
    textColor: "text-blue-700",
  },
  {
    grade: "N25",
    name: "Concrete N25",
    description: "Structural elements",
    use_case: "Columns, beams, commercial",
    strength: "25 MPa",
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-700",
  },
  {
    grade: "S30",
    name: "Concrete S30",
    description: "High-strength structural",
    use_case: "Suspended slabs, precast",
    strength: "30 MPa",
    color: "bg-orange-100 border-orange-300",
    textColor: "text-orange-700",
  },
  {
    grade: "S35",
    name: "Concrete S35",
    description: "High-rise buildings",
    use_case: "Infrastructure, durability",
    strength: "35 MPa",
    color: "bg-red-100 border-red-300",
    textColor: "text-red-700",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Concrete Detector
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload your construction photos and get instant AI-powered concrete
            recommendations with real-time pricing
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Detection Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {!result ? (
            /* Upload State */
            <div className="p-8">
              {!file ? (
                /* Initial Upload */
                <div className="text-center">
                  <div
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 
                    hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="file-upload"
                    />
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                        <Upload className="h-10 w-10 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          Upload Construction Photo
                        </h3>
                        <p className="text-gray-500 text-lg mb-4">
                          Drag & drop your image or click to browse
                        </p>
                        <p className="text-sm text-gray-400">
                          Supports PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Construction sites
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          Building structures
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Concrete elements
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* File Selected State */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-blue-600" />
                      Ready to Analyze
                    </h3>
                    <button
                      onClick={resetForm}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Show image preview if available */}
                  {preview && (
                    <div className="flex justify-center mb-4">
                      <div className="relative w-[520px] h-[520px] rounded-xl border border-gray-200 shadow overflow-hidden">
                        <Image
                          src={preview}
                          alt="Preview"
                          fill
                          style={{ objectFit: "contain" }}
                          sizes="320px"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Camera className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold 
                    hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        AI is analyzing your image...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Get AI Recommendations
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results State */
            <div>
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                <div className="flex items-center text-white">
                  <CheckCircle className="h-8 w-8 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold">{result.message}</h3>
                    <p className="text-green-100 mt-1">
                      {result.confidence}% confidence • Analyzed in seconds
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Recommendation */}
              {result.matchedProduct && (
                <div className="p-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">
                          {result.matchedProduct.name}
                        </h4>
                        <p className="text-gray-600 text-lg">
                          {result.matchedProduct.description}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-xl font-bold text-lg ${
                          getProductStyle(result.matchedProduct.grade).color
                        } ${
                          getProductStyle(result.matchedProduct.grade).textColor
                        } border-2`}
                      >
                        {result.matchedProduct.grade}
                      </span>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-sm">
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-700 mb-1">
                            Normal Price
                          </p>
                          <p className="text-3xl font-bold text-green-800">
                            ${result.matchedProduct.normal_price}
                          </p>
                          <p className="text-sm text-green-600">
                            {result.matchedProduct.unit}
                          </p>
                        </div>
                      </div>

                      {result.matchedProduct.pump_price && (
                        <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                          <div className="text-center">
                            <p className="text-sm font-medium text-blue-700 mb-1">
                              Pump Price
                            </p>
                            <p className="text-3xl font-bold text-blue-800">
                              ${result.matchedProduct.pump_price}
                            </p>
                            <p className="text-sm text-blue-600">
                              {result.matchedProduct.unit}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            In Stock
                          </p>
                          <p className="text-3xl font-bold text-gray-800">
                            {result.matchedProduct.stock_quantity}
                          </p>
                          <p className="text-sm text-gray-600">m³ available</p>
                        </div>
                      </div>
                    </div>

                    {/* Detected Elements */}
                    {result.detectedLabels &&
                      result.detectedLabels.length > 0 && (
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Info className="h-4 w-4 mr-2 text-blue-600" />
                            AI Detected Elements
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {result.detectedLabels.map((label, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={resetForm}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold 
                        hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      >
                        Analyze Another Photo
                      </button>
                      <button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold 
                      hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                      >
                        Get Quote
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Reference Guide - Only show when not analyzing */}
        {!loading && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Package className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Concrete Grade Reference
                </h3>
              </div>
              {showGuide ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {showGuide && (
              <div className="border-t border-gray-100 p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {concreteProducts.map((product) => (
                    <div
                      key={product.grade}
                      className={`rounded-xl p-4 border-2 ${product.color} hover:shadow-md transition-all duration-200 cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-bold text-xl ${product.textColor}`}
                        >
                          {product.grade}
                        </span>
                        <span
                          className={`text-xs font-medium ${product.textColor} bg-white/70 px-2 py-1 rounded`}
                        >
                          {product.strength}
                        </span>
                      </div>
                      <h4 className={`font-semibold mb-1 ${product.textColor}`}>
                        {product.description}
                      </h4>
                      <p className={`text-sm ${product.textColor} opacity-80`}>
                        {product.use_case}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
