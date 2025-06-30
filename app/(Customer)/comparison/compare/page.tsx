"use client";
import { Suspense } from "react";
import CompareProductsContent from "./CompareContent";

export default function CompareProductsPage() {
  return (
    <Suspense fallback={null}>
      <CompareProductsContent />
    </Suspense>
  );
}
