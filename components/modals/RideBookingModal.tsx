"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRide } from "@/features/rides/api/use-create-ride";
import { useGetCars } from "@/features/cars/api/use-get-cars";
import { useGetDrivers } from "@/features/drivers/api/use-get-drivers";
import { useRideBooking } from "@/hooks/ride/use-ride-booking";

// Ride booking form schema
const rideBookingSchema = z.object({
  carId: z.string().min(1, "Car selection is required"),
  driverId: z.string().optional(),
  estimatedDistance: z.number().min(1, "Distance must be at least 1 km"),
  estimatedDuration: z.number().min(5, "Duration must be at least 5 minutes"),
  passengerCount: z.number().int().min(1).max(8),
  notes: z.string().optional(),
});

type RideBookingFormData = z.infer<typeof rideBookingSchema>;

export const RideBookingModal: React.FC = () => {
  const { isOpen, onClose, rideData } = useRideBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createRide = useCreateRide();
  const { data: cars } = useGetCars();
  const { data: drivers } = useGetDrivers();

  const form = useForm<RideBookingFormData>({
    resolver: zodResolver(rideBookingSchema),
    defaultValues: {
      estimatedDistance: 10, // Default 10km
      estimatedDuration: 30, // Default 30 minutes
      passengerCount: 1,
      notes: "",
    },
  });

  // Filter cars available for hire
  const availableCars = cars?.filter(car => car.isAvailable && car.isForHire) || [];

  // Filter active drivers
  const activeDrivers = drivers?.filter(driver => driver.isActive && driver.isApproved) || [];

  const calculateTotalCost = (carId: string, distance: number): number => {
    const selectedCar = availableCars.find(car => car.id === carId);
    if (!selectedCar) return 0;

    // Base cost calculation
    const baseFare = 200; // KES 200 base fare
    const perKmRate = selectedCar.pricePerKm || 50; // Default KES 50 per km

    return baseFare + (distance * perKmRate);
  };

  const onSubmit = async (values: RideBookingFormData) => {
    if (!rideData) return;

    try {
      setIsSubmitting(true);

      const totalCost = calculateTotalCost(values.carId, values.estimatedDistance);

      await createRide.mutateAsync({
        carId: values.carId,
        driverId: values.driverId === "self-drive" ? null : values.driverId || null,
        pickupTime: rideData.pickupTime.toISOString(),
        pickupLocation: rideData.pickupLocation,
        dropoffLocation: rideData.dropoffLocation,
        estimatedDistance: values.estimatedDistance,
        estimatedDuration: values.estimatedDuration,
        totalCost,
        passengerCount: values.passengerCount,
        notes: values.notes,
      });

      toast.success("Ride booked successfully!");
      form.reset();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to book ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedValues = form.watch(["carId", "estimatedDistance"]);
  const totalCost = watchedValues[0] && watchedValues[1]
    ? calculateTotalCost(watchedValues[0], watchedValues[1])
    : 0;

  // Don't render if no ride data
  if (!rideData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Your Ride</DialogTitle>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-2">Trip Details</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">From:</span> {rideData.pickupLocation}</p>
            <p><span className="font-medium">To:</span> {rideData.dropoffLocation}</p>
            <p><span className="font-medium">Pickup:</span> {rideData.pickupTime.toLocaleString()}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Vehicle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a car" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCars.length > 0 ? (
                        availableCars.map((car) => (
                          <SelectItem key={car.id} value={car.id}>
                            {car.name} - {car.make} {car.model}
                            {car.pricePerKm && ` (KES ${car.pricePerKm}/km)`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          No cars available for hire. Please ensure cars have isAvailable=true and isForHire=true.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Self-drive or select driver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="self-drive">Self-drive</SelectItem>
                      {activeDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="passengerCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Passengers</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select passengers" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} passenger{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special instructions..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {totalCost > 0 && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Total:</span>
                  <span className="text-lg font-bold">KES {totalCost.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Base fare + distance charge
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !totalCost}>
                {isSubmitting ? "Booking..." : `Book Ride - KES ${totalCost.toLocaleString()}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};