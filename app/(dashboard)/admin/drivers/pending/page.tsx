import React from "react";

import MainLayout from "@/components/common/layouts/MainLayout";
import DashboardHeader from "@/components/common/shared/DashboardHeader";
import PendingDriversTable from "@/screens/drivers/components/PendingDriversTable";

const PendingDriversPage = () => {
  return (
    <MainLayout>
      <DashboardHeader
        title="Driver Approvals"
        description="Review and approve or reject driver applications."
      />
      <PendingDriversTable />
    </MainLayout>
  );
};

export default PendingDriversPage;