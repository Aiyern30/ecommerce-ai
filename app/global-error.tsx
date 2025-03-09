"use client";

import ErrorPage from "@/components/Error";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <html>
      <body>
        <ErrorPage error={error} reset={reset} />
      </body>
    </html>
  );
}
