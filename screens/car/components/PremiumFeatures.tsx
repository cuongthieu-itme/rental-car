import React from "react";
import { FiCheckCircle } from "react-icons/fi";

interface PremiumFeaturesProps {
  carData?: {
    features?: any;
    [key: string]: any;
  };
}

const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ carData }) => {
  // Parse features from carData
  const getFeatures = () => {
    if (!carData?.features) {
      return ["Air Conditioning", "Bluetooth", "USB Ports", "Safety Features", "Premium Sound", "GPS Navigation"];
    }

    if (typeof carData.features === "string") {
      try {
        const parsed = JSON.parse(carData.features);
        return Array.isArray(parsed) ? parsed : ["Air Conditioning", "Bluetooth"];
      } catch {
        return ["Air Conditioning", "Bluetooth"];
      }
    }

    return Array.isArray(carData.features) ? carData.features : ["Air Conditioning", "Bluetooth"];
  };

  const features = getFeatures();

  return (
    <div className="mt-6">
      <h2 className="font-semibold font-foreground text-3xl md:text-4xl">
        Premium Features
      </h2>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-x-2">
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

export default PremiumFeatures;
