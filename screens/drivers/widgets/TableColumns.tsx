"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit, Check, X } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateDriverStatus } from "@/features/drivers/api/use-update-driver-status";
import { useDeleteDriver } from "@/features/drivers/api/use-delete-driver";

// Driver type based on the database schema
type DriverType = {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  car?: {
    id: string;
    name: string;
    make: string;
    model: string;
  } | null;
};

export const columns: ColumnDef<DriverType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "licenseNumber",
    header: "License Number",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.original.licenseNumber}</div>
    ),
  },
  {
    accessorKey: "car",
    header: "Assigned Car",
    cell: ({ row }) => {
      const car = row.original.car;
      return car ? (
        <div className="text-sm">
          <div className="font-medium">{car.name}</div>
          <div className="text-muted-foreground">{car.make} {car.model}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">No car assigned</span>
      );
    },
  },
  {
    accessorKey: "isApproved",
    header: "Status",
    cell: ({ row }) => {
      const isApproved = row.original.isApproved;
      const isActive = row.original.isActive;

      if (!isApproved) {
        return (
          <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      }

      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const driver = row.original;

      return <ActionsCell driver={driver} />;
    },
  },
];

function ActionsCell({ driver }: { driver: DriverType }) {
  const updateStatus = useUpdateDriverStatus();
  const deleteDriver = useDeleteDriver();

  const handleApprove = () => {
    updateStatus.mutate({ id: driver.id, isApproved: true });
  };

  const handleReject = () => {
    updateStatus.mutate({ id: driver.id, isApproved: false });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      deleteDriver.mutate(driver.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!driver.isApproved && (
          <>
            <DropdownMenuItem onClick={handleApprove} className="text-green-600">
              <Check className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReject} className="text-red-600">
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}