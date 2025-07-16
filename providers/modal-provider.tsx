"use client";

import DeleteCarDialog from "@/screens/cars/components/DeleteCarDialog";
import { AddDriverModal } from "@/screens/drivers/components/AddDriverModal";
import { EditDriverModal } from "@/screens/drivers/components/EditDriverModal";
import DeleteDriverDialog from "@/screens/drivers/components/DeleteDriverDialog";
import ViewDriverSheet from "@/screens/drivers/components/ViewDriverSheet";
import ViewUserSheet from "@/screens/users/components/ViewUserSheet";

export const ModalProvider = () => {
  return (
    <>
      <DeleteCarDialog />
      <AddDriverModal />
      <EditDriverModal />
      <DeleteDriverDialog />
      <ViewDriverSheet />
      <ViewUserSheet />
    </>
  );
};
