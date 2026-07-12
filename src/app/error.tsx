"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-8 bg-red-50 text-red-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Root Crash Details</h2>
      <p className="mb-2"><strong>Message:</strong> {error.message}</p>
      {error.digest && <p className="mb-2"><strong>Digest:</strong> {error.digest}</p>}
      <pre className="bg-red-100 p-4 rounded text-sm overflow-auto max-w-full">
        {error.stack}
      </pre>
      <button
        onClick={() => reset()}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded font-bold"
      >
        Try again
      </button>
    </div>
  );
}
