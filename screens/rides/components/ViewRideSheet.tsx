"use client";

import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, Car, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useViewRide } from "@/hooks/ride/use-view-ride";
import { useGetRide } from "@/features/rides/api/use-get-ride";

const ViewRideSheet = () => {
  const { isOpen, onClose, id } = useViewRide();
  const { data: ride, isLoading } = useGetRide(id);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      active: { label: "Active", variant: "default" as const },
      completed: { label: "Completed", variant: "outline" as const, className: "text-green-600 border-green-600" },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge
        variant={config.variant}
        className={(config as any).className}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Ride Details</SheetTitle>
          <SheetDescription>
            View complete information about this ride booking.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : ride ? (
            <>
              {/* Status and Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Status</h3>
                  {getStatusBadge(ride.status)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Ride ID:</span>
                    <p className="font-medium break-words">{ride.id}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium break-words">
                      {format(new Date(ride.createdAt), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Customer Information</h3>
                </div>
                {ride.user ? (
                  <div className="space-y-2 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium break-words">
                        {ride.user.firstName && ride.user.lastName
                          ? `${ride.user.firstName} ${ride.user.lastName}`
                          : "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium break-words">{ride.user.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Customer information not available</p>
                )}
              </div>

              <Separator />

              {/* Vehicle Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Vehicle</h3>
                </div>
                {ride.car ? (
                  <div className="space-y-2 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <p className="font-medium break-words">{ride.car.name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Make & Model:</span>
                      <p className="font-medium break-words">
                        {ride.car.make} {ride.car.model}
                      </p>
                    </div>
                    {ride.car.pricePerKm && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Rate:</span>
                        <p className="font-medium break-words">
                          KES {ride.car.pricePerKm}/km
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Vehicle information not available</p>
                )}
              </div>

              <Separator />

              {/* Driver Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Driver</h3>
                {ride.driver ? (
                  <div className="space-y-2 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium break-words">{ride.driver.name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium break-words">{ride.driver.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Self-drive ride</p>
                )}
              </div>

              <Separator />

              {/* Trip Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Trip Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">From:</span>
                    <p className="font-medium break-words">{ride.pickupLocation}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">To:</span>
                    <p className="font-medium break-words">{ride.dropoffLocation}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Pickup Time:</span>
                      <p className="font-medium break-words">
                        {format(new Date(ride.pickupTime), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                    {ride.dropoffTime && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Dropoff Time:</span>
                        <p className="font-medium break-words">
                          {format(new Date(ride.dropoffTime), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Trip Metrics */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Trip Metrics</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Distance:</span>
                    <p className="font-medium">{Number(ride.estimatedDistance).toFixed(1)} km</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">
                      {Math.floor(ride.estimatedDuration / 60)}h {ride.estimatedDuration % 60}m
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Passengers:</span>
                    <p className="font-medium">{ride.passengerCount}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <p className="font-medium text-lg">KES {Number(ride.totalCost).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {ride.notes && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Notes</h3>
                    <p className="text-sm bg-muted p-3 rounded-md break-words whitespace-pre-wrap">{ride.notes}</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              Ride not found
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewRideSheet;