"use client";

import ErrorPage from "@/components/error";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  return <ErrorPage error={error} reset={reset} />;
}
