"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";

export default function TestingPage() {
  const [error, setError] = useState(false);

  if (error) {
    throw new Error("Manually triggered error!");
  }

  const triggerApiError = async () => {
    try {
      const res = await fetch("/api/non-existent-endpoint");
      if (!res.ok) {
        throw new Error("API request failed!");
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    console.log("Testing page loaded");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Error Testing Page</h1>
      <p className="text-gray-600 mb-6">Click a button to trigger an error.</p>

      <div className="flex gap-4">
        <Button
          onClick={() => setError(true)}
          className="bg-red-500 hover:bg-red-700"
        >
          Trigger Component Error
        </Button>
        <Button
          onClick={triggerApiError}
          className="bg-yellow-500 hover:bg-yellow-700"
        >
          Trigger API Error
        </Button>
      </div>
    </div>
  );
}
