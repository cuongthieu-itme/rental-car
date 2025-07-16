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
import { useDeleteUserMutation } from "@/features/users/api/use-delete-user";
import { useDeleteUser } from "@/hooks/user/use-delete-user";

const DeleteUserDialog = () => {
  const { isOpen, onClose, id } = useDeleteUser();
  const deleteUser = useDeleteUserMutation();

  const handleDeleteUser = async () => {
    try {
      await deleteUser.mutateAsync(id!);
      toast.success("User has been deleted successfully");
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
            This action cannot be undone. This will permanently delete this user
            and remove all data associated with it from the servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteUser} disabled={deleteUser.isPending}>
            {deleteUser.isPending ? (
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

export default DeleteUserDialog;