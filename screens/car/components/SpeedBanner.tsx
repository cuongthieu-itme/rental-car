import React from "react";
import { SlSpeedometer, SlLockOpen } from "react-icons/sl";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface SpeedBannerProps {
  carData?: {
    pricePerDay?: number | null;
    pricePerKm?: number | null;
    isForRent: boolean;
    isForHire: boolean;
    isForDelivery: boolean;
    mileage?: number;
    [key: string]: any;
  };
}

const SpeedBanner: React.FC<SpeedBannerProps> = ({ carData }) => {
  // Determine pricing information
  const getPricingInfo = () => {
    if (carData?.isForRent && carData?.pricePerDay) {
      return {
        title: "Daily Rental",
        description: `Kes ${carData.pricePerDay}/day`,
        icon: SlSpeedometer
      };
    } else if (carData?.pricePerKm) {
      return {
        title: "Per KM Rate",
        description: `Kes ${carData.pricePerKm}/km`,
        icon: SlSpeedometer
      };
    } else {
      return {
        title: "Flexible Pricing",
        description: "Contact for pricing details",
        icon: SlSpeedometer
      };
    }
  };

  // Determine availability/service info
  const getServiceInfo = () => {
    if (carData?.isForDelivery) {
      return {
        title: "Delivery Available",
        description: "We deliver to your location",
        icon: SlLockOpen
      };
    } else if (carData?.isForHire) {
      return {
        title: "Professional Driver",
        description: "Hire with experienced driver",
        icon: SlLockOpen
      };
    } else {
      return {
        title: "Self Drive",
        description: "Drive yourself with confidence",
        icon: SlLockOpen
      };
    }
  };

  const pricingInfo = getPricingInfo();
  const serviceInfo = getServiceInfo();

  return (
    <Alert className="bg-muted p-4 lg:p-6 mt-6 rounded-lg">
      <AlertDescription className="flex max-sm:flex-col max-sm:gap-y-3 justify-between items-center">
        <div className="flex items-center gap-x-3">
          <pricingInfo.icon size={32} className="text-foreground" />
          <div>
            <h3 className="text-xl lg:text-2xl font-semibold text-foreground">
              {pricingInfo.title}
            </h3>
            <p className="text-base lg:text-lg font-medium text-muted-foreground">
              {pricingInfo.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-x-3">
          <serviceInfo.icon size={32} className="text-foreground" />
          <div>
            <h3 className="text-xl lg:text-2xl font-semibold text-foreground">
              {serviceInfo.title}
            </h3>
            <p className="text-base lg:text-lg font-medium text-muted-foreground">
              {serviceInfo.description}
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SpeedBanner;
