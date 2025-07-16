"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateDriver } from "@/features/drivers/api/use-update-driver";
import { useGetDriver } from "@/features/drivers/api/use-get-driver";
import { useGetCars } from "@/features/cars/api/use-get-cars";
import { useEditDriver } from "@/hooks/use-edit-driver";

const editDriverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  carId: z.string().optional(),
  isActive: z.boolean().optional(),
  isApproved: z.boolean().optional(),
});

type EditDriverFormData = z.infer<typeof editDriverSchema>;

export const EditDriverModal: React.FC = () => {
  const { isOpen, onClose, id } = useEditDriver();
  const { data: driver, isLoading } = useGetDriver(id);
  const updateDriver = useUpdateDriver();
  const { data: cars } = useGetCars();

  const form = useForm<EditDriverFormData>({
    resolver: zodResolver(editDriverSchema),
    defaultValues: {
      name: "",
      email: "",
      licenseNumber: "",
      carId: "none",
      isActive: true,
      isApproved: false,
    },
  });

  // Populate form with existing driver data when data is loaded
  useEffect(() => {
    if (driver && !isLoading) {
      form.reset({
        name: driver.name || "",
        email: driver.email || "",
        licenseNumber: driver.licenseNumber || "",
        carId: driver.car?.id || "none",
        isActive: driver.isActive ?? true,
        isApproved: driver.isApproved ?? false,
      });
    }
  }, [driver, isLoading, form]);

  const onSubmit = async (data: EditDriverFormData) => {
    if (!id) return;

    try {
      await updateDriver.mutateAsync({
        id,
        name: data.name,
        email: data.email,
        licenseNumber: data.licenseNumber,
        carId: data.carId === "none" ? undefined : data.carId,
        isActive: data.isActive,
        isApproved: data.isApproved,
      });
      form.reset();
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription>
            Update the driver details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter driver's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter driver's email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter driver's license number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Car (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a car to assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No car assigned</SelectItem>
                      {cars?.map((car) => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.name} - {car.make} {car.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateDriver.isPending}>
                {updateDriver.isPending ? "Updating..." : "Update Driver"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};