"use client";

import React, { Suspense } from "react";
import { use } from "react";

import MainLayout from "@/components/common/layouts/MainLayout";
import HeaderBanner from "@/components/common/shared/HeaderBanner";
import Summary from "@/screens/car/components/Summary";
import CarInfo from "@/screens/car/widgets/CarInfo";
import NoCarsFound from "@/components/common/error/NoCarsFound";
import {useGetCar} from "@/features/cars/api/use-get-car";

// Loading component
const LoadingComponent = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading car details...</p>
        </div>
    </div>
);

// Main car details component
const CarDetailsContent = ({carId}: {carId: string}) => {
    const {data, isLoading, isFetching} = useGetCar(carId);

    // Handle loading and fetching states
    if (isLoading) {
        return <LoadingComponent />;
    }

    // Show error component if no data is available
    if (!data) {
        return <NoCarsFound />;
    }

    // Construct car features using correct snake_case properties
    const carFeatures = [
        {label: "bodyType", value: String(data.bodyType)},
        {label: "transmission", value: String(data.transmission)},
        {label: "fuelType", value: String(data.fuelType)},
        {label: "driveType", value: String(data.driveType)},
        {label: "doors", value: String(data.doors)},
        {label: "engineSize", value: String(data.engineSize)},
    ];

    // Determine price using correct snake_case properties with optional chaining
    const price = String(data.pricePerDay || data.pricePerKm);

    return (
        <>
            <HeaderBanner />
            <MainLayout>
                <div className="lg:flex gap-4 max-xl:px-2 py-24">
                    {/* Loading indicator during background refetches */}
                    {isFetching && (
                        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                            Refreshing data...
                        </div>
                    )}

                    <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-20 mb-10 lg:mb-0">
                        <div className="sticky top-20">
                            <Summary
                                carFeatures={carFeatures}
                                price={price}
                                isForRent={data.isForRent}
                                carData={data}
                            />
                        </div>
                    </div>

                    <div className="flex-1 lg:pl-5">
                        <CarInfo carData={data} />
                    </div>
                </div>
            </MainLayout>
        </>
    );
};

// Main page component
const Page = ({params}: {params: Promise<{carId: string}>}) => {
    // Use React's use() hook to unwrap the promise
    const {carId} = use(params);

    return (
        <Suspense fallback={<LoadingComponent />}>
            <CarDetailsContent carId={carId} />
        </Suspense>
    );
};

export default Page;
