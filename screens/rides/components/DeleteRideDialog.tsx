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
} from "@/components/ui/alert-dialog";
import { useDeleteRide as useDeleteRideModal } from "@/hooks/ride/use-delete-ride";
import { useDeleteRide } from "@/features/rides/api/use-delete-ride";

const DeleteRideDialog = () => {
  const { isOpen, onClose, id } = useDeleteRideModal();
  const deleteRide = useDeleteRide();

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteRide.mutateAsync(id);
      toast.success("Ride deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete ride");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the ride
            booking and remove all associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteRide.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteRide.isPending ? "Deleting..." : "Delete Ride"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRideDialog;