import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, FileText } from "lucide-react";
import Pagination from "./Pagination";
import usePagination from "./usePagination";
import "./DataTable.css";

/**
 * DataTable — global reusable table with built-in sort, pagination,
 * row selection, bulk-action bar, loading and empty states.
 *
 * ─── Column definition ────────────────────────────────────────────
 * {
 *   key        : string          field name in the data row
 *   label      : string          column header text
 *   sortable?  : boolean         enable click-to-sort (default false)
 *   width?     : string          e.g. "w-10", "w-32"
 *   align?     : "left"|"center"|"right"   (default "left")
 *   render?    : (value, row) => ReactNode  custom cell renderer
 * }
 *
 * ─── Props ────────────────────────────────────────────────────────
 * data           any[]         full dataset (unsliced)
 * columns        Column[]      column definitions
 * title?         string        card header title
 * loading?       boolean       show loading overlay
 * emptyMessage?  string        message when data is empty
 * rowKey?        string|fn     unique key per row (default "id")
 * selectable?    boolean       show checkboxes (default false)
 * onSelectionChange? fn(selectedRows[])
 * bulkActions?   {label, onClick, danger?}[]
 * onExport?      fn            called when Export CSV is clicked
 * initialPageSize? number      (default 10)
 * pageSizeOptions? number[]
 * extraHeader?   ReactNode     slot rendered right of the title
 */
export default function DataTable({
  data = [],
  columns = [],
  title = "",
  loading = false,
  emptyMessage = "No records found.",
  rowKey = "id",
  selectable = false,
  onSelectionChange,
  bulkActions = [],
  onExport,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  extraHeader,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" | "desc"
  const [selectedIds, setSelectedIds] = useState([]);

  /* ── Sort ── */
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((rowA, rowB) => {
      const valueA = rowA[sortKey] ?? "";
      const valueB = rowB[sortKey] ?? "";
      const comparison =
        typeof valueA === "number" && typeof valueB === "number"
          ? valueA - valueB
          : String(valueA).localeCompare(String(valueB));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  /* ── Pagination (operates on sorted data) ── */
  const { pagedData, currentPage, pageSize, totalItems, setPage, setPageSize } =
    usePagination({ data: sortedData, initialSize: initialPageSize });

  /* ── Sort handler ── */
  const handleSort = (columnKey) => {
    if (sortKey === columnKey) {
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortKey(columnKey);
      setSortDirection("asc");
    }
    setPage(1);
  };

  /* ── Selection helpers ── */
  const getRowKey = (row) =>
    typeof rowKey === "function" ? rowKey(row) : row[rowKey];

  const toggleSelectAll = (event) => {
    const updatedIds = event.target.checked
      ? pagedData.map((row) => getRowKey(row))
      : [];
    setSelectedIds(updatedIds);
    onSelectionChange?.(event.target.checked ? pagedData : []);
  };

  const toggleSelectOne = (row) => {
    const rowId = getRowKey(row);
    const isCurrentlySelected = selectedIds.includes(rowId);
    const updatedIds = isCurrentlySelected
      ? selectedIds.filter((existingId) => existingId !== rowId)
      : [...selectedIds, rowId];
    setSelectedIds(updatedIds);
    onSelectionChange?.(
      sortedData.filter((dataRow) => updatedIds.includes(getRowKey(dataRow))),
    );
  };

  const isAllPageSelected =
    pagedData.length > 0 &&
    pagedData.every((row) => selectedIds.includes(getRowKey(row)));

  const isSomePageSelected =
    pagedData.some((row) => selectedIds.includes(getRowKey(row))) &&
    !isAllPageSelected;

  /* ── Align helper ── */
  const alignClass = (align) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  /* ── Sort icon ── */
  const SortIndicator = ({ columnKey }) => {
    if (sortKey !== columnKey)
      return <ArrowUpDown size={11} className="dt-sort-icon inline ml-1" />;
    return sortDirection === "asc" ? (
      <ArrowUp size={11} className="dt-sort-icon-active inline ml-1" />
    ) : (
      <ArrowDown size={11} className="dt-sort-icon-active inline ml-1" />
    );
  };

  return (
    <div className="dt-card rounded-2xl overflow-hidden">
      {/* ── Card header ── */}
      {(title || onExport || extraHeader) && (
        <div className="dt-card-header flex items-center justify-between px-5 py-4">
          {title && (
            <h2 className="dt-card-title text-[15px] font-bold">{title}</h2>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {extraHeader}
            {onExport && (
              <button
                onClick={onExport}
                className="dt-export-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors"
              >
                <FileText size={14} /> Export CSV
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Bulk action bar ── */}
      {selectable && selectedIds.length > 0 && bulkActions.length > 0 && (
        <div className="dt-bulk-bar flex items-center gap-3 px-5 py-2.5">
          <span className="dt-bulk-text text-[13px] font-semibold">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2 ml-2">
            {bulkActions.map((bulkAction, actionIndex) => (
              <button
                key={actionIndex}
                onClick={() => {
                  const selectedRows = sortedData.filter((row) =>
                    selectedIds.includes(getRowKey(row)),
                  );
                  bulkAction.onClick(selectedRows);
                }}
                className={`dt-bulk-btn px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${
                  bulkAction.danger ? "dt-bulk-btn-danger" : ""
                }`}
              >
                {bulkAction.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setSelectedIds([]);
              onSelectionChange?.([]);
            }}
            className="dt-bulk-text text-[12px] font-medium ml-auto hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="relative overflow-x-auto">
        {/* Loading overlay */}
        {loading && (
          <div className="dt-loading-overlay absolute inset-0 z-10 flex items-center justify-center">
            <p className="dt-loading-text text-[13.5px] font-medium">
              Loading…
            </p>
          </div>
        )}

        <table className="w-full text-left">
          <thead>
            <tr className="dt-thead text-[11.5px] uppercase tracking-wide">
              {selectable && (
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    className="dt-checkbox w-4 h-4 rounded"
                    checked={isAllPageSelected}
                    ref={(checkboxEl) => {
                      if (checkboxEl)
                        checkboxEl.indeterminate = isSomePageSelected;
                    }}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-3 font-semibold ${column.width ?? ""} ${alignClass(column.align)} ${
                    column.sortable ? "dt-th-sort" : ""
                  }`}
                  onClick={
                    column.sortable ? () => handleSort(column.key) : undefined
                  }
                >
                  {column.label}
                  {column.sortable && <SortIndicator columnKey={column.key} />}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="dt-empty px-5 py-14 text-center text-[13.5px]"
                >
                  {loading ? "" : emptyMessage}
                </td>
              </tr>
            ) : (
              pagedData.map((row) => {
                const rowId = getRowKey(row);
                const isRowSelected = selectedIds.includes(rowId);

                return (
                  <tr key={rowId} className="dt-row">
                    {selectable && (
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          className="dt-checkbox w-4 h-4 rounded"
                          checked={isRowSelected}
                          onChange={() => toggleSelectOne(row)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-3 py-3.5 ${alignClass(column.align)}`}
                      >
                        {column.render ? (
                          column.render(row[column.key], row)
                        ) : (
                          <span className="dt-cell-secondary text-[13.5px]">
                            {row[column.key] ?? "—"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
