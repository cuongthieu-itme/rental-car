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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEditRide } from "@/hooks/ride/use-edit-ride";
import { useGetRide } from "@/features/rides/api/use-get-ride";
import { useUpdateRide } from "@/features/rides/api/use-update-ride";

const formSchema = z.object({
  status: z.enum(["pending", "active", "completed", "cancelled"]),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  totalCost: z.number().positive("Total cost must be positive"),
  passengerCount: z.number().int().min(1).max(8),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditRideSheet = () => {
  const { isOpen, onClose, id } = useEditRide();
  const { data: ride, isLoading } = useGetRide(id);
  const updateRide = useUpdateRide();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
      pickupLocation: "",
      dropoffLocation: "",
      totalCost: 0,
      passengerCount: 1,
      notes: "",
    },
  });

  useEffect(() => {
    if (ride) {
      form.reset({
        status: ride.status,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        totalCost: Number(ride.totalCost),
        passengerCount: ride.passengerCount,
        notes: ride.notes || "",
      });
    }
  }, [ride, form]);

  const onSubmit = async (values: FormValues) => {
    if (!id) return;

    try {
      await updateRide.mutateAsync({
        id,
        ...values,
      });
      toast.success("Ride updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update ride");
    }
  };

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
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Edit Ride</SheetTitle>
          <SheetDescription>
            Update ride details and status information.
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
              {/* Ride Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Current Status</h3>
                  {getStatusBadge(ride.status)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Ride ID:</span>
                    <p className="font-medium break-words">{ride.id}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Customer:</span>
                    <p className="font-medium break-words">
                      {ride.user?.firstName && ride.user?.lastName
                        ? `${ride.user.firstName} ${ride.user.lastName}`
                        : ride.user?.email || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Edit Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter pickup location"
                            {...field}
                            className="break-words"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dropoffLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dropoff Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter dropoff location"
                            {...field}
                            className="break-words"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="totalCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cost (KES)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passengerCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passengers</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="8"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes..."
                            className="resize-none break-words"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateRide.isPending}
                      className="flex-1"
                    >
                      {updateRide.isPending ? "Updating..." : "Update Ride"}
                    </Button>
                  </div>
                </form>
              </Form>
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

export default EditRideSheet;