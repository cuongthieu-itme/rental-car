import { format } from "date-fns";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useGetDriver } from "@/features/drivers/api/use-get-driver";
import { useViewDriver } from "@/hooks/driver/use-view-driver";

const ViewDriverSheet = () => {
  const { isOpen, onClose, id } = useViewDriver();
  const { data: driver, isLoading, error } = useGetDriver(id);

  if (error) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px]">
          <SheetHeader>
            <SheetTitle>Error</SheetTitle>
            <SheetDescription>
              Failed to load driver details. Please try again.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px]">
        <SheetHeader>
          <SheetTitle>Driver Details</SheetTitle>
          <SheetDescription>
            View detailed information about this driver
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : driver ? (
            <>
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-sm">{driver.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-sm">{driver.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      License Number
                    </label>
                    <p className="text-sm font-mono">{driver.licenseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      {!driver.isApproved ? (
                        <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant={driver.isActive ? "default" : "secondary"}>
                          {driver.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* User Information */}
              {driver.user && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Account</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          First Name
                        </label>
                        <p className="text-sm">{driver.user.firstName || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Last Name
                        </label>
                        <p className="text-sm">{driver.user.lastName || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          User Email
                        </label>
                        <p className="text-sm">{driver.user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          User ID
                        </label>
                        <p className="text-sm font-mono break-all">{driver.user.id}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Assigned Car */}
              {driver.car && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Assigned Car</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Car Name
                        </label>
                        <p className="text-sm">{driver.car.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Make
                        </label>
                        <p className="text-sm">{driver.car.make}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Model
                        </label>
                        <p className="text-sm">{driver.car.model}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Car ID
                        </label>
                        <p className="text-sm font-mono break-all">{driver.car.id}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Timestamps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Timestamps</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created At
                    </label>
                    <p className="text-sm">
                      {format(new Date(driver.createdAt), "PPP 'at' p")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Updated At
                    </label>
                    <p className="text-sm">
                      {format(new Date(driver.updatedAt), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No driver data found</div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewDriverSheet;