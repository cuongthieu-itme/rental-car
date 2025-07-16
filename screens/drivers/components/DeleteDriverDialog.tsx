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
import { useDeleteDriverMutation } from "@/features/drivers/api/use-delete-driver";
import { useDeleteDriver } from "@/hooks/use-delete-driver";

const DeleteDriverDialog = () => {
  const { isOpen, onClose, id } = useDeleteDriver();
  const deleteDriver = useDeleteDriverMutation();

  const handleDeleteDriver = async () => {
    if (!id) return;

    try {
      const response = await deleteDriver.mutateAsync(id);
      if (response.id) {
        toast.success(`Driver ${response.id} has been deleted successfully`);
        onClose();
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred, Kindly try again!");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this driver
            and remove all data associated with it from the servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteDriver}>
            {deleteDriver.isPending ? (
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

export default DeleteDriverDialog;