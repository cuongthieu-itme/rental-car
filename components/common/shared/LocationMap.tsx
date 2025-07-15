"use client";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";
import MainLayout from "@/components/common/layouts/MainLayout";

// Error fallback component
const MapErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="mb-24 h-[600px] w-full bg-red-50 border border-red-200 rounded-md flex flex-col items-center justify-center">
    <h2 className="text-red-600 text-lg font-semibold mb-2">Map Error</h2>
    <p className="text-red-500 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

// Dynamically import the actual map component with no SSR
const DynamicMapComponent = dynamic(
  () => import("@/components/common/shared/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="mb-24 h-[600px] w-full bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
);

const LocationMap = () => {
  return (
    <div className="relative z-0 rounded-md overflow-hidden">
      <MainLayout>
        <ErrorBoundary
          FallbackComponent={MapErrorFallback}
          onReset={() => window.location.reload()}
        >
          <DynamicMapComponent />
        </ErrorBoundary>
      </MainLayout>
    </div>
  );
};

export default LocationMap;
