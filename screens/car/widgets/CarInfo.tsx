import React from "react";

import { Separator } from "@/components/ui/separator";

import CarImageCarousel from "../components/CarImageCarousel";
import GeneralInformation from "../components/GeneralInformation";
import PremiumFeatures from "../components/PremiumFeatures";
import SpeedBanner from "../components/SpeedBanner";

interface CarInfoProps {
  carData: {
    id: string;
    name: string;
    description: string;
    make: string;
    model: string;
    images: string | string[];
    bodyType: string;
    transmission: string;
    fuelType: string;
    driveType: string;
    doors: number;
    engineSize: number;
    mileage: number;
    color: string;
    condition: string;
    features?: any;
    pricePerDay?: number | null;
    pricePerKm?: number | null;
    isForRent: boolean;
    isForHire: boolean;
    isForDelivery: boolean;
    isAvailable: boolean;
    dateManufactured: Date | string;
    cylinders: number;
    [key: string]: any;
  };
}

const CarInfo: React.FC<CarInfoProps> = ({ carData }) => {
  return (
    <>
      <CarImageCarousel carData={carData} />
      <SpeedBanner carData={carData} />
      <GeneralInformation carData={carData} />
      <Separator className="my-6 w-full" />
      <PremiumFeatures carData={carData} />
    </>
  );
};

export default CarInfo;
