"use client";

import React from "react";

import RentalsTable from "../components/RentalsTable";
import EditRentalSheet from "../components/EditRentalSheet";
import ViewRentalSheet from "../components/ViewRentalSheet";
import DeleteRentalDialog from "../components/DeleteRentalDialog";

const RentalsManagement = () => {
  return (
    <div>
      <RentalsTable />
      <EditRentalSheet />
      <ViewRentalSheet />
      <DeleteRentalDialog />
    </div>
  );
};

export default RentalsManagement;