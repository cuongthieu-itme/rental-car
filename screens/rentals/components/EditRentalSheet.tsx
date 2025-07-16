"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEditRental } from "@/hooks/rental/use-edit-rental";
import { useGetRental } from "@/features/rentals/api/use-get-rental";
import { useUpdateRental } from "@/features/rentals/api/use-update-rental";

const formSchema = z.object({
  status: z.enum(["pending", "active", "completed", "cancelled"]),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  totalCost: z.number().positive("Total cost must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

const EditRentalSheet = () => {
  const { isOpen, onClose, id } = useEditRental();
  const { data: rental, isLoading: loadingRental } = useGetRental(id);
  const updateRental = useUpdateRental();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
      pickupLocation: "",
      dropoffLocation: "",
      totalCost: 0,
    },
  });

  useEffect(() => {
    if (rental) {
      reset({
        status: rental.status,
        pickupLocation: rental.pickupLocation,
        dropoffLocation: rental.dropoffLocation,
        totalCost: parseFloat(rental.totalCost),
      });
    }
  }, [rental, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!rental) return;

    try {
      await updateRental.mutateAsync({
        id: rental.id,
        ...values,
      });
      toast.success("Rental updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update rental");
    }
  };

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
      <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px] flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Edit Rental</SheetTitle>
          <SheetDescription>
            Update rental information and status.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto mt-6 space-y-4 pr-2">
          {loadingRental ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : rental ? (
            <>
              {/* Rental Overview */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Rental Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Rental ID</label>
                      <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                        {rental.id}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                      <div className="mt-1">
                        {getStatusBadge(rental.status)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      <div className="text-sm bg-muted p-2 rounded">
                        {format(new Date(rental.startDate), "PPP")}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">End Date</label>
                      <div className="text-sm bg-muted p-2 rounded">
                        {format(new Date(rental.endDate), "PPP")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer & Car Info */}
              {(rental.user || rental.car) && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Customer & Car Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rental.user && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Customer</label>
                          <div className="text-sm bg-muted p-2 rounded">
                            <div className="font-medium">
                              {[rental.user.firstName, rental.user.lastName]
                                .filter(Boolean)
                                .join(" ") || "No name"}
                            </div>
                            <div className="text-xs text-muted-foreground break-all">
                              {rental.user.email}
                            </div>
                          </div>
                        </div>
                      )}
                      {rental.car && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Car</label>
                          <div className="text-sm bg-muted p-2 rounded">
                            <div className="font-medium">{rental.car.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {rental.car.make} {rental.car.model}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Edit Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="text-lg font-semibold">Edit Details</h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <select
                        {...register("status")}
                        className="w-full border rounded px-3 py-2 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {errors.status && (
                        <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Total Cost (Kes)</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("totalCost", { valueAsNumber: true })}
                      />
                      {errors.totalCost && (
                        <p className="text-xs text-red-500 mt-1">{errors.totalCost.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Pickup Location</label>
                    <Input {...register("pickupLocation")} />
                    {errors.pickupLocation && (
                      <p className="text-xs text-red-500 mt-1">{errors.pickupLocation.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Dropoff Location</label>
                    <Input {...register("dropoffLocation")} />
                    {errors.dropoffLocation && (
                      <p className="text-xs text-red-500 mt-1">{errors.dropoffLocation.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting || updateRental.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || updateRental.isPending}
                  >
                    {isSubmitting || updateRental.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>

                {updateRental.isError && (
                  <div className="text-sm text-red-500 mt-2">
                    {updateRental.error?.message || "Failed to update rental."}
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No rental data found</div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditRentalSheet;