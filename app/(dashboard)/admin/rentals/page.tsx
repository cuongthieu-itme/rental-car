"use client";

import React from "react";

import MainLayout from "@/components/common/layouts/MainLayout";
import DashboardHeader from "@/components/common/shared/DashboardHeader";
import RentalsTable from "@/screens/rentals/components/RentalsTable";
import EditRentalSheet from "@/screens/rentals/components/EditRentalSheet";
import ViewRentalSheet from "@/screens/rentals/components/ViewRentalSheet";
import DeleteRentalDialog from "@/screens/rentals/components/DeleteRentalDialog";

const RentalsPage = () => {
  return (
    <MainLayout>
      <DashboardHeader
        title="Rentals Management"
        description="Manage car rentals, bookings, and reservation status."
      />
      <div>
        <RentalsTable />
        <EditRentalSheet />
        <ViewRentalSheet />
        <DeleteRentalDialog />
      </div>
    </MainLayout>
  );
};

export default RentalsPage;