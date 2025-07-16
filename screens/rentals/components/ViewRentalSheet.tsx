"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useGetRental } from "@/features/rentals/api/use-get-rental";
import { useViewRental } from "@/hooks/rental/use-view-rental";

const ViewRentalSheet = () => {
  const { isOpen, onClose, id } = useViewRental();
  const { data: rental, isLoading, error } = useGetRental(id);

  if (error) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px]">
          <SheetHeader>
            <SheetTitle>Error</SheetTitle>
            <SheetDescription>
              Failed to load rental details. Please try again.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let className = "";

    switch (status) {
      case "pending":
        variant = "outline";
        className = "text-yellow-600 border-yellow-600";
        break;
      case "active":
        variant = "default";
        className = "text-blue-600 bg-blue-50";
        break;
      case "completed":
        variant = "secondary";
        className = "text-green-600 bg-green-50";
        break;
      case "cancelled":
        variant = "destructive";
        className = "text-red-600";
        break;
      default:
        variant = "outline";
    }

    return (
      <Badge variant={variant} className={className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px]">
        <SheetHeader>
          <SheetTitle>Rental Details</SheetTitle>
          <SheetDescription>
            View detailed information about this rental booking
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : rental ? (
            <>
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rental Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Rental ID
                    </label>
                    <p className="text-sm font-mono break-all">{rental.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(rental.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Start Date
                    </label>
                    <p className="text-sm">
                      {format(new Date(rental.startDate), "PPP")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      End Date
                    </label>
                    <p className="text-sm">
                      {format(new Date(rental.endDate), "PPP")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Cost
                    </label>
                    <p className="text-sm font-medium">
                      Kes {parseFloat(rental.totalCost).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created At
                    </label>
                    <p className="text-sm">
                      {format(new Date(rental.createdAt), "PPp")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Pickup Location
                    </label>
                    <p className="text-sm break-all">{rental.pickupLocation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Dropoff Location
                    </label>
                    <p className="text-sm break-all">{rental.dropoffLocation}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              {rental.user && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Customer Name
                        </label>
                        <p className="text-sm">
                          {[rental.user.firstName, rental.user.lastName]
                            .filter(Boolean)
                            .join(" ") || "No name provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <p className="text-sm break-all">{rental.user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Car Information */}
              {rental.car && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Car Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Car Name
                        </label>
                        <p className="text-sm font-medium">{rental.car.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Make & Model
                        </label>
                        <p className="text-sm">
                          {rental.car.make} {rental.car.model}
                        </p>
                      </div>
                      {rental.car.pricePerDay && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Price Per Day
                          </label>
                          <p className="text-sm">
                            Kes {rental.car.pricePerDay.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {rental.car.pricePerKm && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Price Per Km
                          </label>
                          <p className="text-sm">
                            Kes {rental.car.pricePerKm.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Driver Information */}
              {rental.driver && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Driver Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Driver Name
                      </label>
                      <p className="text-sm">{rental.driver.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Driver Email
                      </label>
                      <p className="text-sm break-all">{rental.driver.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">
                No rental data found
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewRentalSheet;