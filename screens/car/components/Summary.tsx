import React, { useState } from "react";
import { BsFuelPump, BsWhatsapp } from "react-icons/bs";
import { GiGearStickPattern, GiCarDoor, GiGearStick } from "react-icons/gi";
import { IoCarSportOutline } from "react-icons/io5";
import { PiFanLight } from "react-icons/pi";
import {Cog } from "lucide-react"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingModal } from "@/components/modals/BookingModal";
const iconsMap = [
  {
    label:"bodyType",
    displayName: "Body Type",
    icon: IoCarSportOutline,
  },
  {
    label:"transmission",
    displayName: "Transmission",
    icon: GiGearStickPattern,
  },
  {
    label:"fuelType",
    displayName: "Fuel Type",
    icon: BsFuelPump,
  },
  {
    label:"driveType",
    displayName: "Drive Type",
    icon: GiGearStick,
  },
  {
    label:"doors",
    displayName: "Doors",
    icon: GiCarDoor,
  },
  {
    label:"engineSize",
    displayName: "Engine Size",
    icon:Cog
  }
]
interface FeatureItem {
  label:string;
  value:string;

}
interface CarSummaryProps {
  carFeatures:FeatureItem[];
  price:string;
  isForRent:boolean;
  carData?: {
    pricePerDay?: number | null;
    pricePerKm?: number | null;
    isForDelivery?: boolean;
    isForHire?: boolean;
    [key: string]: any;
  };
}

const Summary:React.FC<CarSummaryProps>= ({carFeatures, price, isForRent, carData}) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Determine the pricing unit and additional info
  const getPricingInfo = () => {
    if (isForRent && carData?.pricePerDay) {
      return {
        unit: "day",
        subText: "daily rental"
      };
    } else if (carData?.pricePerKm) {
      return {
        unit: "Km",
        subText: "per kilometer"
      };
    } else {
      return {
        unit: isForRent ? "day" : "Km",
        subText: isForRent ? "daily rate" : "per kilometer"
      };
    }
  };

  const pricingInfo = getPricingInfo();

  const handleBookNow = () => {
    if (!carData) {
      alert("Car information not available");
      return;
    }
    setIsBookingModalOpen(true);
  };

  return (
    <>
      <Card className="max-h-fit">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-x-2">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Kes {price}/{pricingInfo.unit}
              </h1>
              <span className="text-sm text-muted-foreground">/{pricingInfo.subText}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-3">
              {carFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="flex-shrink-0 flex items-center justify-between gap-x-1 space-y-4 text-base font-medium text-muted-foreground"
                >
                  <label className="flex items-center gap-x-2">

                    {React.createElement(
                      iconsMap.find((iconItem) => iconItem.label === feature.label)?.icon || "div",
                      { size: 28, className: "text-foreground" }
                    )}

                    <span>{iconsMap.find((iconItem) => iconItem.label === feature.label)?.displayName || feature.label}</span>
                  </label>
                  <div>{feature.value}</div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="py-4 justify-between gap-x-2 max-w-80">
          <Button onClick={handleBookNow}>Book Now</Button>
          <Button variant="outline">Car Demo</Button>
          <Button variant="outline" size="icon">
            <BsWhatsapp />
          </Button>
        </CardFooter>
      </Card>

      {/* Booking Modal */}
      {carData && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          car={{
            id: carData.id,
            name: carData.name,
            make: carData.make,
            model: carData.model,
            pricePerDay: carData.pricePerDay,
            pricePerKm: carData.pricePerKm,
            isForRent: carData.isForRent,
            images: carData.images,
          }}
        />
      )}
    </>
  );
};

export default Summary;
