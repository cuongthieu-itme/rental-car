import { format } from "date-fns";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useGetUser } from "@/features/users/api/use-get-user";
import { useViewUser } from "@/hooks/user/use-view-user";

const ViewUserSheet = () => {
  const { isOpen, onClose, id } = useViewUser();
  const { data: user, isLoading, error } = useGetUser(id);

  if (error) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px]">
          <SheetHeader>
            <SheetTitle>Error</SheetTitle>
            <SheetDescription>
              Failed to load user details. Please try again.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px]">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>
            View detailed information about this user
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : user ? (
            <>
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm break-all">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <p className="text-sm break-all">{user.firstName ?? "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <p className="text-sm break-all">{user.lastName ?? "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-sm break-all">{user.location ?? "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-sm break-all">{user.address ?? "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm break-all">{user.phone ?? "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <Badge variant="outline" className="text-blue-600">
                      {user.role === "super_admin"
                        ? "Super Admin"
                        : user.role === "admin"
                        ? "Admin"
                        : "User"}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant="secondary" className="text-green-600">Active</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              {/* Không có trường createdAt/updatedAt, nên không hiển thị Timestamps */}
            </>
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

export default ViewUserSheet;