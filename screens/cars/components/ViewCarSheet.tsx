"use client"
import { Car } from "lucide-react";
import React from "react";
import { IoCarSportOutline } from "react-icons/io5";
import { PiPackage } from "react-icons/pi";
import { toast } from "sonner";

import LoaderWrapper from "@/components/common/loaders/LoaderWrapper";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetCar } from "@/features/cars/api/use-get-car";
import { useViewCar } from "@/hooks/car/use-view-car";

const ViewCarSheet: React.FC = () => {
  const { isOpen, onClose, id } = useViewCar();
  const { data, isLoading, isError } = useGetCar(id);

  // Handle error state
  React.useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch car details");
    }
  }, [isError]);

  // Get car purpose for display
  const getCarPurpose = () => {
    if (!data) return "Not specified";
    if (data.isForHire) return "Hire";
    if (data.isForDelivery) return "Delivery";
    if (data.isForRent) return "Rent";
    return "Not specified";
  };

  const getCarPurposeIcon = () => {
    if (!data) return null;
    if (data.isForHire) return <IoCarSportOutline size={24} />;
    if (data.isForDelivery) return <PiPackage size={24} />;
    if (data.isForRent) return <Car size={24} />;
    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>Car Details</SheetTitle>
          <SheetDescription>
            View detailed information about this car.
          </SheetDescription>
        </SheetHeader>
        <LoaderWrapper isLoading={isLoading}>
          <ScrollArea className="h-screen pb-28 pr-4">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-base">{data?.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Make</label>
                    <p className="text-base">{data?.make || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model</label>
                    <p className="text-base">{data?.model || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Color</label>
                    <p className="text-base">{data?.color || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Condition</label>
                    <p className="text-base">{data?.condition || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Purpose</label>
                    <div className="flex items-center gap-2">
                      {getCarPurposeIcon()}
                      <p className="text-base">{getCarPurpose()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-base bg-gray-50 p-3 rounded-md">{data?.description || "No description available"}</p>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Body Type</label>
                    <p className="text-base">{data?.bodyType || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fuel Type</label>
                    <p className="text-base">{data?.fuelType || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transmission</label>
                    <p className="text-base">{data?.transmission || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Drive Type</label>
                    <p className="text-base">{data?.driveType || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Engine Size</label>
                    <p className="text-base">{data?.engineSize ? `${data.engineSize}L` : "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cylinders</label>
                    <p className="text-base">{data?.cylinders || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Doors/Seats</label>
                    <p className="text-base">{data?.doors ? `${data.doors} seats` : "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mileage</label>
                    <p className="text-base">{data?.mileage ? `${data.mileage.toLocaleString()} km` : "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price per Day</label>
                    <p className="text-base">{data?.pricePerDay ? `$${data.pricePerDay.toLocaleString()}` : "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price per Km</label>
                    <p className="text-base">{data?.pricePerKm ? `$${data.pricePerKm.toLocaleString()}` : "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Availability</label>
                    <p className={`text-base ${data?.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {data?.isAvailable ? "Available" : "Unavailable"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Manufactured</label>
                    <p className="text-base">
                      {data?.dateManufactured
                        ? new Date(data.dateManufactured).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Images */}
              {data?.images && data.images.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.images.map((image, index) => (
                      <div key={index} className="aspect-square">
                        <img
                          src={image}
                          alt={`Car image ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-4">
                <Button onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </ScrollArea>
        </LoaderWrapper>
      </SheetContent>
    </Sheet>
  );
};

export default ViewCarSheet;