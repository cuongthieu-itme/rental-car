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
import { Icons } from "@/components/ui/icons";
import { useDeleteRental as useDeleteRentalMutation } from "@/features/rentals/api/use-delete-rental";
import { useDeleteRental } from "@/hooks/rental/use-delete-rental";

const DeleteRentalDialog = () => {
  const { isOpen, onClose, id } = useDeleteRental();
  const deleteRental = useDeleteRentalMutation();

  const handleDeleteRental = async () => {
    if (!id) return;

    try {
      await deleteRental.mutateAsync(id);
      toast.success("Rental has been deleted successfully");
      setTimeout(onClose, 100);
    } catch (error: any) {
      toast.error(error?.message || "An error occurred, please try again!");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this rental
            booking and remove all data associated with it from the servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteRental} disabled={deleteRental.isPending}>
            {deleteRental.isPending ? (
              <div className="flex items-center space-x-2">
                <Icons.spinner className="animate-spin size-6" />
                <span>Deleting...</span>
              </div>
            ) : (
              "Continue"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRentalDialog;