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
import { useGetAllRentals } from "@/features/rentals/api/use-get-all-rentals";

import { columns } from "../widgets/RentalTableColumns";

const RentalsTable = () => {
  const { data, isLoading } = useGetAllRentals();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [rowSelection, setRowSelection] = React.useState({});

  // Filter data based on customer email
  const filteredData = React.useMemo(() => {
    if (!data || !globalFilter) return data ?? [];

    return data.filter((rental: any) => {
      const email = rental.user?.email?.toLowerCase() || "";
      const customerName = [rental.user?.firstName, rental.user?.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase() || "";
      const searchTerm = globalFilter.toLowerCase();

      return email.includes(searchTerm) || customerName.includes(searchTerm);
    });
  }, [data, globalFilter]);

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
    },
  });

  if (isLoading) return <TableLoader />;

  return (
    <Card className="mt-6 shadow-none border-none">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Rentals</CardTitle>
          <div className="flex items-center py-4 gap-2">
            <Input
              placeholder="Filter by customer email or name..."
              value={globalFilter}
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
                  No results.
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

export default RentalsTable;