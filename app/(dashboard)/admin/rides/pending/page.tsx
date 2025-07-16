import React from "react";

import MainLayout from "@/components/common/layouts/MainLayout";
import DashboardHeader from "@/components/common/shared/DashboardHeader";
import PendingRidesTable from "@/screens/rides/components/PendingRidesTable";

const PendingRidesPage = () => {
  return (
    <MainLayout>
      <DashboardHeader
        title="Ride Approvals"
        description="Review and approve or reject ride requests."
      />
      <PendingRidesTable />
    </MainLayout>
  );
};

export default PendingRidesPage;
