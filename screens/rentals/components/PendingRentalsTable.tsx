"use client";

import React from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import TableLoader from "@/components/common/loaders/TableLoader";
import { TablePagination } from "@/components/pagination/TablePagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useGetAllRentals } from "@/features/rentals/api/use-get-all-rentals";
import { useUpdateRental } from "@/features/rentals/api/use-update-rental";
import { useViewRental } from "@/hooks/rental/use-view-rental";

const PendingRentalsTable = () => {
  const { data: allRentals, isLoading } = useGetAllRentals();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const { onOpen: onView } = useViewRental();
  const updateRental = useUpdateRental();

  // Filter only pending rentals
  const pendingRentals = React.useMemo(() => {
    return allRentals?.filter((rental: any) => rental.status === "pending") ?? [];
  }, [allRentals]);

  // Filter data based on customer email and name
  const filteredData = React.useMemo(() => {
    if (!pendingRentals || !globalFilter) return pendingRentals;

    return pendingRentals.filter((rental: any) => {
      const email = rental.user?.email?.toLowerCase() || "";
      const customerName = [rental.user?.firstName, rental.user?.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase() || "";
      const searchTerm = globalFilter.toLowerCase();

      return email.includes(searchTerm) || customerName.includes(searchTerm);
    });
  }, [pendingRentals, globalFilter]);

  const handleApprove = async (rentalId: string) => {
    try {
      await updateRental.mutateAsync({
        id: rentalId,
        status: "active",
      });
      toast.success("Rental approved successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve rental");
    }
  };

  const handleReject = async (rentalId: string) => {
    try {
      await updateRental.mutateAsync({
        id: rentalId,
        status: "cancelled",
      });
      toast.success("Rental rejected successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject rental");
    }
  };

  const columns = [
    {
      accessorKey: "id",
      header: "Rental ID",
      cell: ({ row }: any) => (
        <div className="font-mono text-xs">
          {row.original.id.slice(-8)}
        </div>
      ),
    },
    {
      accessorKey: "user",
      header: "Customer",
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => (
        <div className="text-sm">
          {format(new Date(row.original.startDate), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {format(new Date(row.original.endDate), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "totalCost",
      header: "Total Cost",
      cell: ({ row }: any) => (
        <div className="font-medium">
          Kes {parseFloat(row.original.totalCost).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Requested",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          Pending
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const rental = row.original;
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
                <DropdownMenuItem onClick={() => onView(rental.id)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleApprove(rental.id)}
                  disabled={updateRental.isPending}
                  className="text-green-600"
                >
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleReject(rental.id)}
                  disabled={updateRental.isPending}
                  className="text-red-600"
                >
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      globalFilter,
    },
  });

  if (isLoading) return <TableLoader />;

  return (
    <Card className="mt-6 shadow-none border-none">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Pending Rental Approvals</CardTitle>
          <div className="flex items-center py-4 gap-2">
            <Input
              placeholder="Filter by customer email or name..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="h-14 bg-gray-50" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="text-gray-900 font-semibold"
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="py-2 whitespace-nowrap shrink-0"
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No pending rentals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <TablePagination table={table} />
      </CardFooter>
    </Card>
  );
};

export default PendingRentalsTable;