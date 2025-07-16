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
import { useApproveRide } from "@/hooks/ride/use-approve-ride";

const ApproveRideDialog = () => {
  const { isOpen, onClose, id } = useApproveRide();
  const updateRideStatus = useUpdateRideStatus();

  const handleApproveRide = async () => {
    try {
      await updateRideStatus.mutateAsync({ id, status: "active" });
      toast.success("Ride approved successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to approve ride");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Ride</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve this ride? The ride status will be changed to "Active" and the customer will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleApproveRide}>
            {updateRideStatus.isPending ? (
              <div className="flex items-center space-x-2">
                <Icons.spinner className="animate-spin size-4" />
                <span>Approving...</span>
              </div>
            ) : (
              "Approve Ride"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApproveRideDialog;