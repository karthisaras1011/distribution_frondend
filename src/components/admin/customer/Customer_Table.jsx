import React, { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Switch, CircularProgress, Box, Typography } from "@mui/material";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../pagination/pagenation";

const CustomerTable = ({
  data,
  loading,
  onToggleStatus,
  onToggleAppDelivery,
  onEdit,
  onDelete,
  pageCount,
  pageIndex,
  pageSize,
  totalCount,
  onPaginationChange,
  onSortChange,
  isToggling,
}) => {
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    if (sorting.length > 0) {
      onSortChange({ id: sorting[0].id, desc: sorting[0].desc });
    }
  }, [sorting, onSortChange]);

  // Custom sort icon component
  const SortIcon = ({ column }) => {
    const isSorted = column.getIsSorted();
    if (!isSorted) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    }
    return isSorted === 'asc' 
      ? <ArrowUp size={14} className="ml-1 text-[#884d51]" />
      : <ArrowDown size={14} className="ml-1 text-[#884d51]" />;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "row_num",
        header: "S.No",
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-center text-gray-600 font-medium">
            {pageIndex * pageSize + info.row.index + 1}
          </div>
        ),
        size: 50,
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-1 justify-center items-center text-[16px]">
            <button
              onClick={() => onEdit(info.row.original)}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded "
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(info.row.original.customer_id)}
              className="p-1 text-[#6a1a12] hover:text-red-700 hover:bg-red-50 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
        size: 80,
        enableSorting: false,
      },
      {
        accessorKey: "customer_id",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Customer ID
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate font-mono">
            {info.getValue() || "-"}
          </div>
        ),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "customer_name",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Customer Name
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 150,
        enableSorting: true,
      },
      {
        accessorKey: "purchase_product_type",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Type
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 80,
        enableSorting: true,
      },
      {
        accessorKey: "customer_email",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Email
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 180,
        enableSorting: true,
      },
      {
        accessorKey: "address_line1",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            House No
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "address_line2",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Street
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "address_line3",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Area
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "customer_city",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            City
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "customer_pincode",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Pincode
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 font-mono truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 80,
        enableSorting: true,
      },
      {
        accessorKey: "route_name",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            Route
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate">
            {info.getValue() || "-"}
          </div>
        ),
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "GSTIN",
        header: ({ column }) => (
          <div 
            className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            GST IN
            <SortIcon column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="px-3 py-2 text-[16px] text-gray-700 truncate font-mono">
            {info.getValue() || "-"}
          </div>
        ),
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "customer_status",
        header: "Status",
        cell: (info) => (
          <div className="flex justify-center items-center px-3 py-2 relative text-[16px]">
            <Switch
              checked={info.getValue() === 1}
              onChange={() => {
                const newStatus = info.getValue() === 1 ? 0 : 1;
                onToggleStatus(newStatus, info.row.original.customer_id);
              }}
              color="primary"
              size="small"
              disabled={isToggling[info.row.original.customer_id]}
            />
            {isToggling[info.row.original.customer_id] && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 text-[16px]">
                <CircularProgress size={14} />
              </div>
            )}
          </div>
        ),
        size: 80,
        enableSorting: false,
      },
      {
        accessorKey: "app_status", // This now contains the value from delivery_app_status
        header: "App Delivery",
        cell: (info) => (
          <div className="flex justify-center items-center px-3 py-2 relative">
            <Switch
              checked={info.getValue() === 1}
              onChange={() => {
                const newStatus = info.getValue() === 1 ? 0 : 1;
                onToggleAppDelivery(newStatus, info.row.original.customer_id);
              }}
              color="secondary"
              size="small"
              disabled={isToggling[`app_${info.row.original.customer_id}`]}
            />
            {isToggling[`app_${info.row.original.customer_id}`] && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                <CircularProgress size={14} />
              </div>
            )}
          </div>
        ),
        size: 100,
        enableSorting: false,
      },
    ],
    [onToggleStatus, onToggleAppDelivery, onDelete, pageIndex, pageSize, isToggling, onEdit]
  );

  const table = useReactTable({
    data: data.map((item, index) => ({
      ...item,
      row_num: pageIndex * pageSize + index + 1,
    })),
    columns,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      onPaginationChange(newState.pageIndex);
    },
    // FIX: Prevent automatic page index reset
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full">

      {/* TABLE SCROLL ONLY */}
      <div className="flex-1 relative min-h-[700px] ">
        <div className="overflow-auto max-h-[700px] ">

          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <CircularProgress size={32} />
              <Typography variant="body2" className="text-gray-500 text-sm">
                Loading customers...
              </Typography>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse min-w-[1100px]">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            width: header.getSize(),
                            minWidth: header.getSize(),
                          }}
                          className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200"
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.original.customer_id} // Use actual customer ID for key
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="border-r border-gray-100 last:border-r-0"
                          style={{
                            width: cell.column.getSize(),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Typography
                    variant="body1"
                    className="text-gray-600 mb-1 text-sm"
                  >
                    No customers found
                  </Typography>
                  <Typography variant="body2" className="text-gray-400 text-xs">
                    Try adjusting your search or filters
                  </Typography>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!loading && data.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <Pagination
            currentPage={pageIndex + 1}
            totalPages={pageCount}
            onPageChange={(page) => onPaginationChange(page - 1)}
            showInfo={true}
            totalRecords={totalCount}
            recordsPerPage={pageSize}
            showFirstLast={true}
            showPrevNext={true}
            showPageNumbers={true}
            className="flex justify-between items-center flex-wrap gap-3 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default CustomerTable;