/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Concrete Detector</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full"
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Upload & Detect"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 p-4 border rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Result</h2>
          <p>{result.message}</p>
          <p className="text-sm text-gray-600">
            Confidence: {result.confidence}%
          </p>

          {result.matchedProduct && (
            <div className="mt-3">
              <h3 className="font-bold">{result.matchedProduct.name}</h3>
              <p>{result.matchedProduct.description}</p>
            </div>
          )}

          <div className="mt-3">
            <h3 className="font-semibold">Detected Labels:</h3>
            <ul className="list-disc ml-6 text-sm text-gray-700">
              {result.detectedLabels.map((l: string, i: number) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
