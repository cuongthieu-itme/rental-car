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
import { useUpdateRideStatus } from "@/features/rides/api/use-update-ride-status";
import { useRejectRide } from "@/hooks/ride/use-reject-ride";

const RejectRideDialog = () => {
  const { isOpen, onClose, id } = useRejectRide();
  const updateRideStatus = useUpdateRideStatus();

  const handleRejectRide = async () => {
    try {
      await updateRideStatus.mutateAsync({ id, status: "cancelled" });
      toast.success("Ride rejected successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to reject ride");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Ride</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject this ride? The ride status will be changed to "Cancelled" and the customer will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRejectRide}
            className="bg-red-600 hover:bg-red-700"
          >
            {updateRideStatus.isPending ? (
              <div className="flex items-center space-x-2">
                <Icons.spinner className="animate-spin size-4" />
                <span>Rejecting...</span>
              </div>
            ) : (
              "Reject Ride"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectRideDialog;