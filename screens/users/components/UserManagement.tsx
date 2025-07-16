"use client";

import React from "react";

import UsersTable from "../components/UsersTable";
import EditUserSheet from "./EditUserSheet";
import ViewUserSheet from "./ViewUserSheet";
import DeleteUserDialog from "./DeleteUserDialog";

const UserManagement = () => {
  return (
    <div>
      <UsersTable />
      <EditUserSheet />
      <ViewUserSheet />
      <DeleteUserDialog />
    </div>
  );
};

export default UserManagement;
