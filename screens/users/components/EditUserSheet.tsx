"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEditUser } from "@/hooks/user/use-edit-user";
import { useGetUser } from "@/features/users/api/use-get-user";
import { useUpdateUser } from "@/features/users/api/use-update-user";

const formSchema = z.object({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(["user", "admin", "super_admin"]),
});

type FormValues = z.infer<typeof formSchema>;

const EditUserSheet = () => {
  const { isOpen, onClose, id } = useEditUser();
  const { data: user, isLoading: loadingUser } = useGetUser(id);
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      location: "",
      address: "",
      phone: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        location: user.location ?? "",
        address: user.address ?? "",
        phone: user.phone ?? "",
        role: user.role ?? "user",
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    await updateUser.mutateAsync({
      ...user,
      ...values,
    });
    toast.success("User updated successfully!");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px]">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Update user information below and save changes.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {loadingUser ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : user ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <Input value={user.email} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <Input {...register("firstName")} />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <Input {...register("lastName")} />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <Input {...register("location")} />
                  {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <Input {...register("address")} />
                  {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <Input {...register("phone")} />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <select {...register("role")} className="w-full border rounded px-2 py-1">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant="secondary" className="text-green-600">Active</Badge>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || updateUser.isPending}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || updateUser.isPending}>
                  {isSubmitting || updateUser.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
              {updateUser.isError && (
                <div className="text-sm text-red-500 mt-2">{updateUser.error?.message || "Failed to update user."}</div>
              )}
            </form>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No user data found</div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditUserSheet;