import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import "./Pagination.css";

/**
 * buildPageNumbers
 * Always shows page 1 and last page.
 * Shows siblings around the active page with "..." gaps.
 *
 * Example — 20 pages, current = 7, siblings = 1:
 *   1  …  6  [7]  8  …  20
 *
 * Example — current = 2:
 *   [1]  [2]  3  …  20
 *
 * Example — current = 19:
 *   1  …  18  [19]  20
 */
function buildPageNumbers(currentPage, totalPages, siblings = 1) {
  // If everything fits without gaps, just show all
  const totalSlots = siblings * 2 + 5; // first + "..." + siblings + current + siblings + "..." + last
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSiblingStart = Math.max(currentPage - siblings, 2);
  const rightSiblingEnd = Math.min(currentPage + siblings, totalPages - 1);

  const showLeftDots = leftSiblingStart > 2;
  const showRightDots = rightSiblingEnd < totalPages - 1;

  const pageList = [];

  // Always: first page
  pageList.push(1);

  if (showLeftDots) {
    pageList.push("left-dots");
  } else {
    // Fill the gap between 1 and the left sibling without dots
    for (let pageNum = 2; pageNum < leftSiblingStart; pageNum++) {
      pageList.push(pageNum);
    }
  }

  // Sibling range + current
  for (let pageNum = leftSiblingStart; pageNum <= rightSiblingEnd; pageNum++) {
    pageList.push(pageNum);
  }

  if (showRightDots) {
    pageList.push("right-dots");
  } else {
    // Fill the gap between right sibling and last without dots
    for (let pageNum = rightSiblingEnd + 1; pageNum < totalPages; pageNum++) {
      pageList.push(pageNum);
    }
  }

  // Always: last page
  pageList.push(totalPages);

  return pageList;
}

/**
 * Pagination
 *
 * Props
 *   currentPage          number   1-based active page
 *   totalItems           number   total record count
 *   pageSize             number   rows per page          (default 10)
 *   pageSizeOptions      number[] rows-per-page choices  (default [5,10,20,50])
 *   siblings             number   pages on each side of current (default 1)
 *   onPageChange         fn(page: number)
 *   onPageSizeChange     fn(size: number)
 *   showPageSizeSelector bool     show the rows-per-page dropdown (default true)
 *   showFirstLast        bool     show ⏮ ⏭ jump buttons           (default true)
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  siblings = 1,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showFirstLast = true,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = buildPageNumbers(currentPage, totalPages, siblings);

  const goToPage = (targetPage) => {
    if (
      !onPageChange ||
      targetPage < 1 ||
      targetPage > totalPages ||
      targetPage === currentPage
    )
      return;
    onPageChange(targetPage);
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    onPageSizeChange?.(newSize);
    onPageChange?.(1); // reset to first page
  };

  if (totalItems === 0) return null;

  return (
    <div className="pg-wrapper flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
      {/* ── Left: summary + rows-per-page ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="pg-info text-[12.5px]">
          Showing{" "}
          <span className="pg-info-bold">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of <span className="pg-info-bold">{totalItems}</span> results
        </p>

        {showPageSizeSelector && (
          <div className="flex items-center gap-1.5">
            <span className="pg-info text-[12.5px]">Rows:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="pg-size-select text-[12.5px] rounded-lg px-2.5 py-1.5"
            >
              {pageSizeOptions.map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Right: navigation ── */}
      <div className="flex items-center gap-1">
        {/* Jump to first */}
        {showFirstLast && (
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="pg-btn w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        {/* Previous */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pg-btn w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page number buttons */}
        {pageNumbers.map((pageItem, index) => {
          if (pageItem === "left-dots" || pageItem === "right-dots") {
            return (
              <span
                key={pageItem}
                className="pg-ellipsis w-8 h-8 flex items-center justify-center text-[13px]"
              >
                …
              </span>
            );
          }

          const isActive = pageItem === currentPage;
          return (
            <button
              key={pageItem}
              onClick={() => goToPage(pageItem)}
              className={`w-8 h-8 rounded-lg text-[13px] transition-colors ${
                isActive ? "pg-btn-active" : "pg-btn"
              }`}
            >
              {pageItem}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pg-btn w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight size={14} />
        </button>

        {/* Jump to last */}
        {showFirstLast && (
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="pg-btn w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
