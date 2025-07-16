"use client";
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
import React from "react";

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
import { useGetPendingRides } from "@/features/rides/api/use-get-pending-rides";

import { pendingColumns } from "../widgets/PendingRideTableColumns";

const PendingRidesTable = () => {
  const { data, isLoading } = useGetPendingRides();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [rowSelection, setRowSelection] = React.useState({});

  // Filter data based on customer email and name
  const filteredData = React.useMemo(() => {
    if (!data || !globalFilter) return data ?? [];

    return data.filter((ride: any) => {
      const email = ride.user?.email?.toLowerCase() || "";
      const customerName = [ride.user?.firstName, ride.user?.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase() || "";
      const searchTerm = globalFilter.toLowerCase();

      return email.includes(searchTerm) || customerName.includes(searchTerm);
    });
  }, [data, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: pendingColumns as any,
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
    },
  });

  if (isLoading) return <TableLoader />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Ride Approvals</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter by customer email or name..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto">
          <div className="rounded-md border min-w-[1400px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="whitespace-nowrap"
                        style={{
                          width: header.getSize(),
                          minWidth: header.getSize()
                        }}
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
                          key={cell.id}
                          className="whitespace-nowrap p-2"
                          style={{
                            width: cell.column.getSize(),
                            minWidth: cell.column.getSize()
                          }}
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
                      colSpan={pendingColumns.length}
                      className="h-24 text-center"
                    >
                      No pending rides.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <TablePagination table={table} />
      </CardFooter>
    </Card>
  );
};

export default PendingRidesTable;