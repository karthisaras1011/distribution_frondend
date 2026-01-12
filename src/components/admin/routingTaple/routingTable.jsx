import React, { useRef, useMemo, useEffect, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Switch } from "@mui/material";
import { Pencil, Trash2, MapPin } from "lucide-react";

const RoutingTable = ({
    data = [],
    loading,
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
    const tableContainerRef = useRef(null);
    const [columnSizes, setColumnSizes] = useState({});

    useEffect(() => {
        if (data.length > 0) {
            const newSizes = {};

            const calcWidth = (header, accessor) => {
                const headerLength = header.length;
                const maxContentLength = Math.max(
                    ...data.map(item => {
                        const value = item[accessor];
                        return value ? value.toString().length : 0;
                    }),
                    5
                );
                const baseWidth = Math.max(headerLength, maxContentLength) * 8 + 20;
                return Math.min(Math.max(baseWidth, 80), 400);
            };

            newSizes.sno = 60;
            newSizes.route_name = calcWidth("Route Name", "route_name");
            newSizes.routing_days = calcWidth("Active Days", "routing_days");
            newSizes.actions = 60;

            setColumnSizes(newSizes);
        }
    }, [data]);

    const formatDays = (daysArray) => {
        const JsonData = JSON.parse(daysArray)
        if (!JsonData || !Array.isArray(JsonData)) return "-";


        // If it's an array of day names, return shortened version
        if (JsonData.length > 0 && typeof JsonData[0] === 'string') {
            return JsonData.map(day => day.substring()).join(", ");
        }

        return "-";
    };

    const columns = useMemo(() => [
        {
            accessorKey: "row_num",
            header: "S.No",
            cell: (info) => (pageIndex * pageSize) + info.row.index + 1,
            size: columnSizes.sno || 60,
        },


        {
            accessorKey: "route_name",
            header: "Route Name",
            cell: (info) => (
                <div
                    className="truncate font-semibold "
                    style={{
                        width: columnSizes.route_name || 200,
                        maxWidth: columnSizes.route_name || 200
                    }}
                >
                    {info.getValue() || "-"}
                </div>
            ),
            size: columnSizes.route_name || 120,
        },
        {
            accessorKey: "routing_days",
            header: "Active Days",
            cell: (info) => (
                <div
                    className="truncate ttext-[16px]"
                    style={{
                        width: columnSizes.routing_days || 180,
                        maxWidth: columnSizes.routing_days || 180
                    }}
                    title={info.getValue() && Array.isArray(info.getValue()) ? info.getValue().join(", ") : "-"}
                >
                    {formatDays(info.getValue())}
                </div>
            ),
            size: columnSizes.routing_days || 180,
        }, {
            id: "actions",
            header: "Actions",
            cell: (info) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => onEdit(info.row.original)}
                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                        title="Edit Route"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(info.row.original)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                        title="Delete Route"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            size: columnSizes.actions || 60,
        },

    ], [ onDelete, onEdit, pageIndex, pageSize, columnSizes, isToggling]);

    const table = useReactTable({
        data: data.map((item, index) => ({
            ...item,
            row_num: (pageIndex * pageSize) + index + 1
        })),
        columns,
        manualPagination: true,
        manualSorting: true,
        pageCount,
        getRowId: (row) => `${row.route_id}_${row.row_num}`,
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: (updater) => {
            const newState = typeof updater === "function"
                ? updater({ pageIndex, pageSize })
                : updater;
            onPaginationChange(newState.pageIndex);
            if (newState.pageSize !== pageSize) {
                onPaginationChange(0);
            }
        },
        onSortingChange: (updater) => {
            const newSort = typeof updater === "function"
                ? updater([{ id: "route_id", desc: false }])
                : updater;
            if (newSort[0]) {
                onSortChange({ id: newSort[0].id, desc: newSort[0].desc });
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const { rows } = table.getRowModel();

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 48,
        overscan: 10,
        keyExtractor: (index) => rows[index].id,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
    const paddingBottom = virtualRows.length > 0
        ? rowVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end || 0)
        : 0;

    return (
        <div className="bg-white rounded-xl shadow-md p-4">
            <div
                ref={tableContainerRef}
                className="overflow-auto relative h-[600px]"
                key={`table-${pageIndex}`}
            >
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{
                                                width: header.getSize(),
                                                minWidth: header.getSize(),
                                                maxWidth: header.getSize()
                                            }}
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider truncate border-r last:border-r-0 border-b border-gray-200"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={header.column.getCanSort()
                                                        ? "cursor-pointer select-none flex items-center truncate"
                                                        : "truncate"}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: " 🔼",
                                                        desc: " 🔽",
                                                    }[header.column.getIsSorted()] ?? null}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paddingTop > 0 && (
                                <tr>
                                    <td style={{ height: `${paddingTop}px` }} />
                                </tr>
                            )}
                            {virtualRows.map(virtualRow => {                                
                                const row = rows[virtualRow.index];
                                return (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-100">
                                        {row.getVisibleCells().map(cell => (
                                            <td
                                                key={cell.id}
                                                className="px-4 py-3 text-[16px] border-r border-gray-200 last:border-r-0"
                                                style={{
                                                    width: cell.column.getSize(),
                                                    maxWidth: cell.column.getSize()
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                            {paddingBottom > 0 && (
                                <tr>
                                    <td style={{ height: `${paddingBottom}px` }} />
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-sm text-gray-600">
                    Showing {pageIndex * pageSize + 1} to{" "}
                    {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount}{" "}
                    entries
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onPaginationChange(0)}
                        disabled={pageIndex === 0}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 transition-colors duration-200 hover:bg-gray-50"
                    >
                        « First
                    </button>
                    <button
                        onClick={() => onPaginationChange(Math.max(0, pageIndex - 1))}
                        disabled={pageIndex === 0}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 transition-colors duration-200 hover:bg-gray-50"
                    >
                        ‹ Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                        Page {pageIndex + 1} of {pageCount}
                    </span>
                    <button
                        onClick={() => onPaginationChange(Math.min(pageCount - 1, pageIndex + 1))}
                        disabled={pageIndex >= pageCount - 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 transition-colors duration-200 hover:bg-gray-50"
                    >
                        Next ›
                    </button>
                    <button
                        onClick={() => onPaginationChange(pageCount - 1)}
                        disabled={pageIndex >= pageCount - 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 transition-colors duration-200 hover:bg-gray-50"
                    >
                        Last »
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoutingTable;