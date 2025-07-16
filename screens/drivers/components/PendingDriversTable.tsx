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
import { useGetPendingDrivers } from "@/features/drivers/api/use-get-pending-drivers";

import { columns, DriverType } from "../widgets/TableColumns";

const PendingDriversTable = () => {
  const { data, isLoading } = useGetPendingDrivers();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Filter data based on name and email
  const filteredData = React.useMemo(() => {
    if (!data || !globalFilter) return data ?? [];

    return data.filter((driver: any) => {
      const name = driver.name?.toLowerCase() || "";
      const email = driver.email?.toLowerCase() || "";
      const searchTerm = globalFilter.toLowerCase();

      return name.includes(searchTerm) || email.includes(searchTerm);
    });
  }, [data, globalFilter]);

  const table = useReactTable<DriverType>({
    data: filteredData,
    columns,
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
        <CardTitle className="text-xl">Pending Driver Approvals</CardTitle>
        <div className="flex items-center justify-between">
          <Input
            placeholder="Filter by name or email..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {data?.length || 0} pending approval(s)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
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
                      <TableCell key={cell.id}>
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
                    No pending drivers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <TablePagination table={table} />
      </CardFooter>
    </Card>
  );
};

export default PendingDriversTable;