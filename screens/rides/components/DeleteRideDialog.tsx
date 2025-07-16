"use client";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import { Icons } from "@/components/ui/icons";
import { useDeleteRide as useDeleteRideModal } from "@/hooks/ride/use-delete-ride";
import { useDeleteRide } from "@/features/rides/api/use-delete-ride";
import { cn } from "@/lib/utils";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";

const DeleteRideDialog = () => {
  const { isOpen, onClose, id } = useDeleteRideModal();
  const deleteRide = useDeleteRide();

  const handleDeleteRide = async () => {
    if (!id) return;
    try {
      const response = await deleteRide.mutateAsync(id);
      if (response.success) {
        toast.success(response.message || "Ride has been deleted successfully");
        setTimeout(onClose, 100); // Delay nhỏ để UI framework cập nhật state
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred, Kindly try again!");
    }
  };

  // Custom overlay with lighter background
  const CustomAlertDialogOverlay = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
  >(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
      ref={ref}
    />
  ));

  const CustomAlertDialogContent = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
  >(({ className, ...props }, ref) => (
    <AlertDialogPortal>
      <CustomAlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  ));

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <CustomAlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this ride
            booking and remove all data associated with it from the servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteRide}>
            {deleteRide.isPending ? (
              <div className="flex items-center space-x-2">
                <Icons.spinner className="animate-spin size-6" />
                <span>Deleting...</span>
              </div>
            ) : (
              "Continue"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </CustomAlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRideDialog;