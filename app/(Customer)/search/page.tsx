// app/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface DetectionResult {
  success: boolean;
  detectedLabels: string[];
  matchedProduct: {
    name: string;
    description: string;
    grade: string;
    normal_price: string;
    pump_price?: string;
    unit: string;
    stock_quantity: number;
  } | null;
  confidence: number;
  message: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Check if response is ok
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

      // Parse JSON response
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Concrete Product Detector
          </h1>
          <p className="text-gray-600">
            Upload a construction photo to get AI-powered concrete
            recommendations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl">📷</div>
                  <div>
                    <span className="text-blue-600 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-500"> an image</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div className="relative">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Preview:
                </h3>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Submit Button */}
            {file && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  "Upload & Detect"
                )}
              </button>
            )}
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-red-400 mr-2">⚠️</div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && result.success && (
            <div className="mt-6 space-y-4">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-400 mr-2">✅</div>
                  <div>
                    <p className="text-green-800 font-medium">
                      {result.message}
                    </p>
                    <p className="text-sm text-green-600">
                      Confidence: {result.confidence}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              {result.matchedProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-blue-900">
                      {result.matchedProduct.name}
                    </h3>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {result.matchedProduct.grade}
                    </span>
                  </div>

                  <p className="text-blue-800 mb-4">
                    {result.matchedProduct.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white rounded p-3">
                      <span className="font-medium text-gray-700">
                        Normal Price:
                      </span>
                      <br />
                      <span className="text-lg font-bold text-green-600">
                        ${result.matchedProduct.normal_price}
                      </span>{" "}
                      {result.matchedProduct.unit}
                    </div>

                    {result.matchedProduct.pump_price && (
                      <div className="bg-white rounded p-3">
                        <span className="font-medium text-gray-700">
                          Pump Price:
                        </span>
                        <br />
                        <span className="text-lg font-bold text-blue-600">
                          ${result.matchedProduct.pump_price}
                        </span>{" "}
                        {result.matchedProduct.unit}
                      </div>
                    )}

                    <div className="bg-white rounded p-3 sm:col-span-2">
                      <span className="font-medium text-gray-700">Stock:</span>
                      <br />
                      <span className="text-lg font-bold text-gray-800">
                        {result.matchedProduct.stock_quantity}
                      </span>{" "}
                      m³ available
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Labels */}
              {result.detectedLabels && result.detectedLabels.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Detected Elements:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.detectedLabels.map((label, index) => (
                      <span
                        key={index}
                        className="bg-white border border-gray-200 px-2 py-1 rounded-full text-xs text-gray-700"
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

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <h3 className="font-semibold text-gray-900 mb-1">N15</h3>
            <p className="text-xs text-gray-600">Light-duty projects</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <h3 className="font-semibold text-gray-900 mb-1">N20</h3>
            <p className="text-xs text-gray-600">Versatile construction</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <h3 className="font-semibold text-gray-900 mb-1">N25</h3>
            <p className="text-xs text-gray-600">Structural elements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
