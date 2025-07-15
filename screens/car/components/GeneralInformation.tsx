import React from "react";
import { FiCheckCircle } from "react-icons/fi";

interface GeneralInformationProps {
  carData?: {
    name: string;
    description: string;
    features?: any;
    make: string;
    model: string;
    [key: string]: any;
  };
}

const GeneralInformation: React.FC<GeneralInformationProps> = ({ carData }) => {
  // Parse features from carData
  const getFeatures = () => {
    if (!carData?.features) {
      return ["Reliable and safe transport", "Professional service", "Comfortable interior"];
    }

    if (typeof carData.features === "string") {
      try {
        const parsed = JSON.parse(carData.features);
        return Array.isArray(parsed) ? parsed : ["Reliable and safe transport"];
      } catch {
        return ["Reliable and safe transport"];
      }
    }

    return Array.isArray(carData.features) ? carData.features : ["Reliable and safe transport"];
  };

  const features = getFeatures();

  return (
    <div className="mt-6">
      <h2 className="font-semibold font-foreground text-3xl md:text-4xl">
        Know about our {carData?.name || "car service"}
      </h2>
      <p className="mt-3">
        {carData?.description ||
        "Experience premium car rental service with our well-maintained vehicles. We ensure quality, safety, and comfort for all your transportation needs."}
      </p>
      <ul className="mt-6">
        {features.slice(0, 6).map((feature, index) => (
          <li key={index} className="flex items-center gap-x-2 mt-2">
            <FiCheckCircle size={16} className="text-foreground" />
            <span className="font-medium text-muted-foreground">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GeneralInformation;
