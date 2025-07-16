"use client";

import React from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteRide } from "@/hooks/ride/use-delete-ride";
import { useEditRide } from "@/hooks/ride/use-edit-ride";
import { useViewRide } from "@/hooks/ride/use-view-ride";

// Define the ride type based on API response
export type RideTableTypes = {
  id: string;
  userId: string | null;
  carId: string | null;
  driverId: string | null;
  pickupTime: string;
  dropoffTime: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedDistance: string;
  estimatedDuration: number;
  totalCost: string;
  status: "pending" | "active" | "completed" | "cancelled";
  passengerCount: number;
  notes: string | null;
  createdAt: string;
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
    images: string[] | null;
    pricePerKm: string | null;
  } | null;
  driver?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const RideActions = ({ row }: { row: Row<RideTableTypes> }) => {
  const ride = row.original;
  const { onOpen: onEdit } = useEditRide();
  const { onOpen: onDelete } = useDeleteRide();
  const { onOpen: onView } = useViewRide();

  return (
    <div className="sticky right-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onView(ride.id)}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onEdit(ride.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onDelete(ride.id)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: "Pending", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-600" },
    active: { label: "Active", variant: "default" as const },
    completed: { label: "Completed", variant: "outline" as const, className: "text-green-600 border-green-600" },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  return (
    <Badge
      variant={config.variant}
      className={(config as any).className}
    >
      {config.label}
    </Badge>
  );
};

export const columns: ColumnDef<RideTableTypes>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    size: 50,
  },
  {
    accessorKey: "user",
    header: "Customer",
    enableSorting: false,
    size: 200,
    cell: ({ row }) => {
      const { user } = row.original;
      if (!user) return "Unknown Customer";

      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ");

      return (
        <div className="flex flex-col max-w-[180px]">
          <span className="font-medium truncate">
            {fullName || "No Name"}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {user.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "car",
    header: "Vehicle",
    enableSorting: false,
    size: 180,
    cell: ({ row }) => {
      const { car } = row.original;
      if (!car) return "No Vehicle";

      return (
        <div className="flex flex-col max-w-[160px]">
          <span className="font-medium truncate">{car.name}</span>
          <span className="text-sm text-muted-foreground truncate">
            {car.make} {car.model}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "driver",
    header: "Driver",
    enableSorting: false,
    size: 150,
    cell: ({ row }) => {
      const { driver } = row.original;
      if (!driver) {
        return (
          <Badge variant="outline" className="text-blue-600">
            Self-Drive
          </Badge>
        );
      }

      return (
        <div className="flex flex-col max-w-[130px]">
          <span className="font-medium truncate">{driver.name}</span>
          <span className="text-sm text-muted-foreground truncate">
            {driver.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "pickupLocation",
    header: "Route",
    enableSorting: false,
    size: 250,
    cell: ({ row }) => {
      const { pickupLocation, dropoffLocation } = row.original;
      return (
        <div className="flex flex-col max-w-[230px] space-y-1">
          <div className="text-sm flex">
            <span className="text-muted-foreground shrink-0">From:</span>
            <span className="ml-1 truncate">{pickupLocation}</span>
          </div>
          <div className="text-sm flex">
            <span className="text-muted-foreground shrink-0">To:</span>
            <span className="ml-1 truncate">{dropoffLocation}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "pickupTime",
    header: "Pickup Time",
    enableSorting: true,
    size: 150,
    cell: ({ row }) => {
      const pickupTime = row.original.pickupTime;
      return (
        <div className="max-w-[130px]">
          <div className="text-sm font-medium">
            {format(new Date(pickupTime), "MMM dd, yyyy")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(pickupTime), "HH:mm")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "estimatedDistance",
    header: "Distance",
    enableSorting: true,
    size: 100,
    cell: ({ row }) => {
      const distance = parseFloat(row.original.estimatedDistance);
      return (
        <div className="max-w-[80px] text-center">
          {distance.toFixed(1)} km
        </div>
      );
    },
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    enableSorting: true,
    size: 120,
    cell: ({ row }) => {
      const cost = parseFloat(row.original.totalCost);
      return (
        <div className="font-medium max-w-[100px]">
          KES {cost.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    size: 120,
    cell: ({ row }) => {
      return (
        <div className="max-w-[100px]">
          {getStatusBadge(row.original.status)}
        </div>
      );
    },
  },
  {
    accessorKey: "passengerCount",
    header: "Passengers",
    enableSorting: true,
    size: 100,
    cell: ({ row }) => {
      const count = row.original.passengerCount;
      return (
        <div className="max-w-[80px] text-center">
          {count} passenger{count > 1 ? 's' : ''}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: RideActions,
    size: 80,
  },
];