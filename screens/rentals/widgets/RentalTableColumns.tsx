import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

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
import { useDeleteRental } from "@/hooks/rental/use-delete-rental";
import { useEditRental } from "@/hooks/rental/use-edit-rental";
import { useViewRental } from "@/hooks/rental/use-view-rental";

// Rental type based on API response
type RentalType = {
  id: string;
  startDate: string;
  endDate: string;
  totalCost: string;
  status: "pending" | "active" | "completed" | "cancelled";
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  car: {
    id: string;
    name: string;
    make: string;
    model: string;
    images: string[];
    pricePerDay: number | null;
    pricePerKm: number | null;
  } | null;
  driver: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const RentalActions = ({ row }: { row: Row<RentalType> }) => {
  const rental = row.original;
  const { onOpen } = useEditRental();
  const { onOpen: onDelete } = useDeleteRental();
  const { onOpen: onView } = useViewRental();

  return (
    <div className="sticky right-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(rental.id)}
          >
            Copy rental ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onView(rental.id)}>
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpen(rental.id)}>
            Edit rental
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(rental.id)}>
            Delete rental
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const columns: ColumnDef<RentalType>[] = [
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
    accessorKey: "id",
    header: "Rental ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">
        {row.original.id.slice(-8)}
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return <span className="text-muted-foreground">No user</span>;

      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
      return (
        <div>
          <div className="font-medium">{fullName || "No name"}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "car",
    header: "Car",
    cell: ({ row }) => {
      const car = row.original.car;
      if (!car) return <span className="text-muted-foreground">No car</span>;

      return (
        <div>
          <div className="font-medium">{car.name}</div>
          <div className="text-xs text-muted-foreground">
            {car.make} {car.model}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {format(new Date(row.original.startDate), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {format(new Date(row.original.endDate), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => (
      <div className="font-medium">
        Kes {parseFloat(row.original.totalCost).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      let className = "";

      switch (status) {
        case "pending":
          variant = "outline";
          className = "text-yellow-600 border-yellow-600";
          break;
        case "active":
          variant = "default";
          className = "text-blue-600 bg-blue-50";
          break;
        case "completed":
          variant = "secondary";
          className = "text-green-600 bg-green-50";
          break;
        case "cancelled":
          variant = "destructive";
          className = "text-red-600";
          break;
        default:
          variant = "outline";
      }

      return (
        <Badge variant={variant} className={className}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "pickupLocation",
    header: "Pickup",
    cell: ({ row }) => (
      <div className="text-sm max-w-32 truncate">
        {row.original.pickupLocation}
      </div>
    ),
  },
  {
    accessorKey: "dropoffLocation",
    header: "Dropoff",
    cell: ({ row }) => (
      <div className="text-sm max-w-32 truncate">
        {row.original.dropoffLocation}
      </div>
    ),
  },
  {
    id: "actions",
    cell: RentalActions,
  },
];