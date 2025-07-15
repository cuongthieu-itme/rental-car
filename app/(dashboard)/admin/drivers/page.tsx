import React from "react";

import MainLayout from "@/components/common/layouts/MainLayout";
import DashboardHeader from "@/components/common/shared/DashboardHeader";
import DriversManagement from "@/screens/drivers/widgets/DriversManagement";

const DriversPage = () => {
  return (
    <MainLayout>
      <DashboardHeader
        title="Drivers Management"
        description="Manage drivers, approvals, and assignments."
      />
      <DriversManagement />
    </MainLayout>
  );
};

export default DriversPage;