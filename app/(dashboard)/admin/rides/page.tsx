"use client";

import React from "react";

import MainLayout from "@/components/common/layouts/MainLayout";
import DashboardHeader from "@/components/common/shared/DashboardHeader";
import RidesTable from "@/screens/rides/components/RidesTable";
import EditRideSheet from "@/screens/rides/components/EditRideSheet";
import ViewRideSheet from "@/screens/rides/components/ViewRideSheet";
import DeleteRideDialog from "@/screens/rides/components/DeleteRideDialog";

const RidesPage = () => {
  return (
    <MainLayout>
      <DashboardHeader
        title="Rides Management"
        description="Manage ride bookings, trip details, and passenger information."
      />
      <div>
        <RidesTable />
        <EditRideSheet />
        <ViewRideSheet />
        <DeleteRideDialog />
      </div>
    </MainLayout>
  );
};

export default RidesPage;