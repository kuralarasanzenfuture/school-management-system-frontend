import { useState, useMemo } from "react";

/**
 * usePagination
 *
 * A single hook that owns all pagination state and slices your data.
 *
 * @param {object} options
 * @param {any[]}   options.data          – full array to paginate
 * @param {number}  [options.initialPage] – starting page (default 1)
 * @param {number}  [options.initialSize] – rows per page  (default 10)
 *
 * @returns {{
 *   pagedData      : any[],    sliced rows for the current page
 *   currentPage    : number,
 *   pageSize       : number,
 *   totalItems     : number,
 *   totalPages     : number,
 *   setPage        : fn,       go to a specific page
 *   setPageSize    : fn,       change page size (resets to page 1)
 *   reset          : fn,       reset to page 1 (e.g. after a search)
 * }}
 *
 * Usage:
 *   const { pagedData, currentPage, pageSize, totalItems,
 *           setPage, setPageSize } = usePagination({ data: filteredRows });
 */
export default function usePagination({
  data = [],
  initialPage = 1,
  initialSize = 10,
} = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // If current page exceeds total (e.g. after filtering), clamp it
  const safePage = Math.min(currentPage, totalPages);

  const pagedData = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, safePage, pageSize]);

  const setPage = (targetPage) => {
    const clamped = Math.max(1, Math.min(targetPage, totalPages));
    setCurrentPage(clamped);
  };

  const setPageSize = (newSize) => {
    setPageSizeState(newSize);
    setCurrentPage(1);
  };

  const reset = () => setCurrentPage(1);

  return {
    pagedData,
    currentPage: safePage,
    pageSize,
    totalItems,
    totalPages,
    setPage,
    setPageSize,
    reset,
  };
}
