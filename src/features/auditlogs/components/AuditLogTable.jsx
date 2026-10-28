import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ChevronRight,
  Clock,
  Laptop,
  Smartphone,
  CheckCircle,
  XCircle,
  Inbox,
  ArrowUpDown,
} from "lucide-react";
import { getActionBadgeClass } from "../constants/auditConstants.js";
import Pagination from "../../../common/components/table/Pagination.jsx";

dayjs.extend(relativeTime);

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function AuditLogTable({
  logs = [],
  loading = false,
  total = 0,
  page = 1,
  limit = 20,
  onPageChange,
  onLimitChange,
  onViewDetails,
  onResetFilters,
}) {
  return (
    <div className="al-table-card rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="al-thead text-[11.5px] uppercase tracking-wide">
              <th className="px-5 py-3.5 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Timestamp <ArrowUpDown size={11} />
                </span>
              </th>
              <th className="px-4 py-3.5 font-semibold">User</th>
              <th className="px-4 py-3.5 font-semibold">Action</th>
              <th className="px-4 py-3.5 font-semibold">Target Entity</th>
              <th className="px-4 py-3.5 font-semibold">Activity</th>
              <th className="px-4 py-3.5 font-semibold">Client / Route</th>
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 font-semibold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {/* Loading skeletons */}
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`sk-${i}`} className="al-row animate-pulse">
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-28 mb-1" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-16" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-44" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto" />
                  </td>
                </tr>
              ))}

            {/* Empty state */}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                      <Inbox size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      No logs found
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Try adjusting or clearing your filters to see more results.
                    </p>
                    {onResetFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium al-btn-primary transition-all shadow-xs"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Actual Log Rows */}
            {!loading &&
              logs.map((log) => {
                const badgeClass = getActionBadgeClass(log.action);
                const isSuccess = String(log.status).toLowerCase() === "success";
                const dateObj = log.created_at ? dayjs(log.created_at) : null;
                const userDisplay =
                  log.user_username || log.user_email || (log.user_id ? `User #${log.user_id}` : "System");
                const initials = getInitials(userDisplay);

                return (
                  <tr
                    key={log.id}
                    onClick={() => onViewDetails && onViewDetails(log)}
                    className="al-row cursor-pointer"
                  >
                    {/* Timestamp */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {dateObj ? dateObj.format("DD MMM YYYY, hh:mm A") : "—"}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        <span>{dateObj ? dateObj.fromNow() : ""}</span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                            {userDisplay}
                          </div>
                          {log.user_email && log.user_email !== userDisplay && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                              {log.user_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase ${badgeClass}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Target Entity */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {log.entity_name || log.entity_type || log.module}
                        </span>
                        {log.entity_id && (
                          <span className="text-[10.5px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            #{log.entity_id}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {log.module}
                      </div>
                    </td>

                    {/* Activity Description */}
                    <td className="px-4 py-3.5">
                      <p className="line-clamp-1 max-w-[280px] text-slate-700 dark:text-slate-300" title={log.description}>
                        {log.description || "Activity recorded"}
                      </p>
                    </td>

                    {/* Client & Route */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-400">
                        {log.request_method && (
                          <span className="text-[10px] font-bold px-1 rounded bg-slate-100 dark:bg-slate-800 uppercase text-slate-500">
                            {log.request_method}
                          </span>
                        )}
                        <span>{log.ip_address || "—"}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                        {log.browser || "Web"} • {log.operating_system || "OS"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Success</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium"
                          title={log.error_message || "Operation failed"}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    {/* Details Arrow */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails && onViewDetails(log);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View details"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ── Standard Pagination Footer ── */}
      {total > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 px-4 py-3 bg-white dark:bg-slate-900">
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageChange={onPageChange}
            onPageSizeChange={onLimitChange}
          />
        </div>
      )}
    </div>
  );
}
