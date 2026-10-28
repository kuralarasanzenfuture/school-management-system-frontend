import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  Download,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

import {
  fetchAuditLogs,
  fetchAuditLogDetails,
  setFilters,
  resetFilters,
  clearSelectedLog,
  setPage,
  setLimit,
} from "../../../redux/auditlogs/auditLogSlice.js";
import { fetchSchools } from "../../../redux/schoolSetup/schoolProfile/schoolProfileSlice.js";

import AuditLogFilters from "../components/AuditLogFilters.jsx";
import AuditLogTable from "../components/AuditLogTable.jsx";
import AuditLogDetailsModal from "../components/AuditLogDetailsModal.jsx";

import "../styles/AuditLogs.css";

export default function AuditLogsPage() {
  const dispatch = useDispatch();

  const {
    logs = [],
    total = 0,
    page = 1,
    limit = 20,
    selectedLog,
    loading,
    detailsLoading,
    error,
    filters,
  } = useSelector((state) => state.auditLogs);

  const { user: authUser } = useSelector((state) => state.auth);

  const isAdmin = useMemo(() => {
    if (!authUser?.roles) return false;
    if (Array.isArray(authUser.roles)) {
      return authUser.roles.some((r) =>
        (typeof r === "object" ? r.name : String(r)).toUpperCase() === "ADMIN"
      );
    }
    return String(authUser.roles).toUpperCase().includes("ADMIN");
  }, [authUser]);

  const schools = useSelector((state) => state.schoolProfile?.schools || []);

  const [modalOpen, setModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Load schools if admin
  useEffect(() => {
    if (isAdmin && schools.length === 0) {
      dispatch(fetchSchools());
    }
  }, [dispatch, isAdmin, schools.length]);

  // Load audit logs on filter changes
  const loadLogs = useCallback(() => {
    const cleanParams = { ...filters };
    Object.keys(cleanParams).forEach((k) => {
      if (cleanParams[k] === "" || cleanParams[k] === null || cleanParams[k] === undefined) {
        delete cleanParams[k];
      }
    });
    dispatch(fetchAuditLogs(cleanParams));
  }, [dispatch, filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilterChange = (updates) => {
    dispatch(setFilters(updates));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    toast.success("Filters reset to default");
  };

  const handleRefresh = () => {
    loadLogs();
    toast.success("Audit logs refreshed");
  };

  const [activeLog, setActiveLog] = useState(null);

  const handleViewDetails = (logItem) => {
    setActiveLog(logItem);
    if (logItem?.id) {
      dispatch(fetchAuditLogDetails(logItem.id));
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setActiveLog(null);
      dispatch(clearSelectedLog());
    }, 320);
  };

  // Export to Excel
  const handleExportExcel = () => {
    setExportOpen(false);
    if (!logs || logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    try {
      const dataRows = logs.map((l) => ({
        "Log ID": l.id,
        "Timestamp": l.created_at ? dayjs(l.created_at).format("YYYY-MM-DD HH:mm:ss") : "—",
        "Action": l.action,
        "Module": l.module,
        "Entity Type": l.entity_type || "",
        "Entity ID": l.entity_id || "",
        "Entity Name": l.entity_name || "",
        "Description": l.description || "",
        "User": l.user_username || l.user_email || (l.user_id ? `User #${l.user_id}` : "System"),
        "User Email": l.user_email || "",
        "Status": l.status,
        "IP Address": l.ip_address || "",
        "Method": l.request_method || "",
        "URL": l.request_url || "",
        "Error": l.error_message || "",
      }));

      const ws = XLSX.utils.json_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
      const dateStr = dayjs().format("YYYY-MM-DD");
      XLSX.writeFile(wb, `Audit_Logs_${dateStr}.xlsx`);
      toast.success("Exported to Excel");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel");
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    setExportOpen(false);
    if (!logs || logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    try {
      const headers = [
        "Log ID",
        "Timestamp",
        "Action",
        "Module",
        "Entity Type",
        "Entity ID",
        "Entity Name",
        "Description",
        "User",
        "Status",
        "IP Address",
        "Method",
        "URL",
      ];

      const rows = logs.map((l) => [
        l.id,
        l.created_at ? dayjs(l.created_at).format("YYYY-MM-DD HH:mm:ss") : "",
        l.action,
        l.module,
        l.entity_type || "",
        l.entity_id || "",
        `"${(l.entity_name || "").replace(/"/g, '""')}"`,
        `"${(l.description || "").replace(/"/g, '""')}"`,
        l.user_username || l.user_email || "",
        l.status,
        l.ip_address || "",
        l.request_method || "",
        `"${(l.request_url || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encoded = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encoded);
      link.setAttribute("download", `Audit_Logs_${dayjs().format("YYYY-MM-DD")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Exported to CSV");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="al-page min-h-screen p-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="al-title text-2xl font-bold">Audit Logs</h1>
          <p className="al-subtitle text-[13.5px] mt-1">
            Review immutable records of user actions, security activities, and system modifications.
          </p>
        </div>

        {/* Top Actions: Refresh & Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="al-btn-outline inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all shadow-xs"
            title="Refresh logs"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-indigo-600" : ""} />
            <span>Refresh</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className="al-btn-outline inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all shadow-xs"
            >
              <Download size={15} />
              <span>Export</span>
              <ChevronDown size={14} />
            </button>

            {exportOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setExportOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-[13px]">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    <span>Export to Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <FileText size={15} className="text-blue-600" />
                    <span>Export to CSV</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Filters Toolbar ── */}
      <AuditLogFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalRecords={total}
        schools={schools}
        isAdmin={isAdmin}
      />

      {/* ── Data Table with Standard Pagination ── */}
      <AuditLogTable
        logs={logs}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => dispatch(setPage(p))}
        onLimitChange={(l) => dispatch(setLimit(l))}
        onViewDetails={handleViewDetails}
        onResetFilters={handleResetFilters}
      />

      {/* ── Inspect Details Drawer ── */}
      <AuditLogDetailsModal
        isOpen={modalOpen}
        log={selectedLog || activeLog}
        loading={detailsLoading}
        onClose={handleCloseModal}
      />
    </div>
  );
}
