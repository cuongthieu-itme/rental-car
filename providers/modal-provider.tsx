"use client";

import DeleteCarDialog from "@/screens/cars/components/DeleteCarDialog";
import { AddDriverModal } from "@/screens/drivers/components/AddDriverModal";
import { EditDriverModal } from "@/screens/drivers/components/EditDriverModal";
import DeleteDriverDialog from "@/screens/drivers/components/DeleteDriverDialog";
import ViewDriverSheet from "@/screens/drivers/components/ViewDriverSheet";
import ViewUserSheet from "@/screens/users/components/ViewUserSheet";
import { RideBookingModal } from "@/components/modals/RideBookingModal";
import ApproveRideDialog from "@/screens/rides/components/ApproveRideDialog";
import RejectRideDialog from "@/screens/rides/components/RejectRideDialog";
import ViewRideSheet from "@/screens/rides/components/ViewRideSheet";
import EditRideSheet from "@/screens/rides/components/EditRideSheet";
import DeleteRideDialog from "@/screens/rides/components/DeleteRideDialog";

export const ModalProvider = () => {
  return (
    <>
      <DeleteCarDialog />
      <AddDriverModal />
      <EditDriverModal />
      <DeleteDriverDialog />
      <ViewDriverSheet />
      <ViewUserSheet />
      <RideBookingModal />
      <ApproveRideDialog />
      <RejectRideDialog />
      <ViewRideSheet />
      <EditRideSheet />
      <DeleteRideDialog />
    </>
  );
};
