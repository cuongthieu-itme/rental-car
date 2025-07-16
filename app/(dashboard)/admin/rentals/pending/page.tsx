"use client";

import React from "react";

import MainLayout from "@/components/common/layouts/MainLayout";
import DashboardHeader from "@/components/common/shared/DashboardHeader";
import PendingRentalsTable from "@/screens/rentals/components/PendingRentalsTable";
import ViewRentalSheet from "@/screens/rentals/components/ViewRentalSheet";

const PendingRentalsPage = () => {
  return (
    <MainLayout>
      <DashboardHeader
        title="Rental Approvals"
        description="Review and approve or reject rental requests."
      />
      <PendingRentalsTable />
      <ViewRentalSheet />
    </MainLayout>
  );
};

export default PendingRentalsPage;