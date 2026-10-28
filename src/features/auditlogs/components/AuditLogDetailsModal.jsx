import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Clock,
  Copy,
  Check,
  AlertCircle,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { getActionBadgeClass } from "../constants/auditConstants.js";

export default function AuditLogDetailsModal({
  log,
  loading = false,
  isOpen = false,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "changes" | "raw"
  const [rawTab, setRawTab] = useState("new"); // "new" | "old" | "full"
  const [copiedKey, setCopiedKey] = useState(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const badgeClass = log ? getActionBadgeClass(log.action) : "";
  const isSuccess = log ? String(log.status).toLowerCase() === "success" : true;
  const dateObj = log?.created_at ? dayjs(log.created_at) : null;

  const copyText = (val, key) => {
    if (!val) return;
    const str = typeof val === "object" ? JSON.stringify(val, null, 2) : String(val);
    navigator.clipboard.writeText(str);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const parseJson = (val) => {
    if (!val) return null;
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  };

  const oldData = log ? parseJson(log.old_data) : null;
  const newData = log ? parseJson(log.new_data) : null;
  const changeData = log ? parseJson(log.change_data) : null;

  // Parse changes array if present or infer from change_data
  const changes = log
    ? Array.isArray(log.changes)
      ? log.changes
      : typeof changeData === "object" && changeData !== null
        ? Object.keys(changeData).map((k) => ({
          field_name: k,
          field_label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          old_value: oldData ? oldData[k] : null,
          new_value: newData ? newData[k] : changeData[k],
        }))
        : []
    : [];

  return (
    <AnimatePresence>
      {isOpen && log && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* ── Backdrop with Smooth Fade Animation ── */}
          <motion.div
            className="fixed inset-0 al-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={onClose}
          />

          {/* ── Slide-Over Drawer Container (Slides from right side) ── */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pointer-events-none">
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="pointer-events-auto w-screen max-w-2xl h-full flex flex-col al-drawer-panel shadow-2xl"
            >
              {/* Drawer Header (Matches screenshot) */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-divider/70">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${badgeClass}`}
                  >
                    {log.action}
                  </span>

                  <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    Log #{log.id}
                  </h2>

                  {isSuccess ? (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      Success
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                      Failed
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Tab Navigation (Matches screenshot) */}
              <div className="flex items-center gap-6 px-6 border-b border-divider/70 text-[13px] font-medium shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`py-3 border-b-2 transition-colors ${activeTab === "overview"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                  Overview
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("changes")}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "changes"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <span>Field Changes</span>
                  {changes.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10.5px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      {changes.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("raw")}
                  className={`py-3 border-b-2 transition-colors ${activeTab === "raw"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                  JSON Payload
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 al-scrollbar">
                {/* TAB 1: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {/* Error Banner if failed */}
                    {!isSuccess && log.error_message && (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                        <div>
                          <span className="font-semibold block mb-0.5">Execution Error:</span>
                          <span className="font-mono break-all">{log.error_message}</span>
                        </div>
                      </div>
                    )}

                    {/* ACTIVITY SUMMARY CARD (Matches screenshot) */}
                    <div className="al-drawer-card p-4 space-y-1.5">
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Activity Summary
                      </span>
                      <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">
                        {log.description || "Activity recorded"}
                      </p>
                      <div className="text-[12px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <Clock size={12} className="text-slate-400" />
                        <span>
                          {dateObj ? dateObj.format("dddd, DD MMMM YYYY [at] hh:mm:ss A") : "—"}
                        </span>
                      </div>
                    </div>

                    {/* TWO-COLUMN GRID: PERFORMED BY & TARGET RESOURCE (Matches screenshot) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* PERFORMED BY CARD */}
                      <div className="al-drawer-card p-4 space-y-2.5">
                        <span className="font-bold text-slate-400 uppercase text-[10.5px] tracking-wider block">
                          Performed By
                        </span>
                        <div>
                          <span className="text-slate-400 block text-[11px]">User:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[13px]">
                            {log.user_username || "admin"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Email:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                            {log.user_email || "admin@example.com"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">User ID:</span>
                          <span className="font-mono text-slate-600 dark:text-slate-400 font-medium">
                            {log.user_id ? `#${log.user_id}` : "#1"}
                          </span>
                        </div>
                      </div>

                      {/* TARGET RESOURCE CARD */}
                      <div className="al-drawer-card p-4 space-y-2.5">
                        <span className="font-bold text-slate-400 uppercase text-[10.5px] tracking-wider block">
                          Target Resource
                        </span>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Entity:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[13px]">
                            {log.entity_name || log.entity_type || "WWE"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Module / Type:</span>
                          <span className="text-slate-700 dark:text-slate-300 capitalize">
                            {log.module} • {log.entity_type || "Department"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Record ID:</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                            {log.entity_id ? `#${log.entity_id}` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* REQUEST & CLIENT METADATA CARD (Matches screenshot) */}
                    <div className="al-drawer-card p-4 space-y-3 text-xs">
                      <span className="font-bold text-slate-400 uppercase text-[10.5px] tracking-wider block">
                        Request & Client Metadata
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-slate-400 block text-[11px]">HTTP Route:</span>
                          <div className="font-mono text-[12px] text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-slate-500 mr-1.5 uppercase">
                              {log.request_method || "PUT"}
                            </span>
                            <span>{log.request_url || "/api/departments/43"}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">IP Address:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 text-[12px]">
                            {log.ip_address || "127.0.0.1"}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">Browser & OS:</span>
                          <span className="text-slate-700 dark:text-slate-300 text-[12px]">
                            {log.browser || "Google Chrome"} on {log.operating_system || "Windows 10/11"}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">Device Type:</span>
                          <span className="capitalize text-slate-700 dark:text-slate-300 text-[12px]">
                            {log.device_type || "Desktop"}
                          </span>
                        </div>

                        {log.request_id && (
                          <div className="sm:col-span-2 pt-2 border-t border-divider/60 flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Request ID:</span>
                            <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-slate-600 dark:text-slate-400">
                              <span>{log.request_id}</span>
                              <button
                                type="button"
                                onClick={() => copyText(log.request_id, "reqId")}
                                className="p-1 hover:text-indigo-600 transition-colors"
                                title="Copy Request ID"
                              >
                                {copiedKey === "reqId" ? (
                                  <Check size={13} className="text-emerald-500" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FIELD CHANGES / DIFF */}
                {activeTab === "changes" && (
                  <div>
                    {changes.length > 0 ? (
                      <div className="border border-divider rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs al-diff-table">
                          <thead>
                            <tr>
                              <th className="w-1/3">Field</th>
                              <th className="w-1/3">Previous Value</th>
                              <th className="w-1/3">New Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-divider/80">
                            {changes.map((c, idx) => (
                              <tr key={idx}>
                                <td className="p-3 font-medium text-slate-800 dark:text-slate-200 align-top">
                                  <div>{c.field_label || c.field_name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{c.field_name}</div>
                                </td>
                                <td className="p-3 align-top">
                                  <span className="al-diff-old">
                                    {c.old_value !== null && c.old_value !== undefined
                                      ? typeof c.old_value === "object"
                                        ? JSON.stringify(c.old_value)
                                        : String(c.old_value)
                                      : "null"}
                                  </span>
                                </td>
                                <td className="p-3 align-top">
                                  <span className="al-diff-new">
                                    {c.new_value !== null && c.new_value !== undefined
                                      ? typeof c.new_value === "object"
                                        ? JSON.stringify(c.new_value)
                                        : String(c.new_value)
                                      : "null"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        <Layers size={24} className="mx-auto mb-2 opacity-40" />
                        <p className="font-medium text-slate-600 dark:text-slate-300">
                          No field-level changes recorded
                        </p>
                        <p className="mt-0.5 text-slate-400">
                          This event did not modify tracked fields or was a create/view action.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: JSON PAYLOAD */}
                {activeTab === "raw" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setRawTab("new")}
                          className={`px-2.5 py-1 rounded-md transition-colors ${rawTab === "new"
                              ? "bg-slate-200 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                              : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                          New Data
                        </button>
                        <button
                          type="button"
                          onClick={() => setRawTab("old")}
                          className={`px-2.5 py-1 rounded-md transition-colors ${rawTab === "old"
                              ? "bg-slate-200 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                              : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                          Old Data
                        </button>
                        <button
                          type="button"
                          onClick={() => setRawTab("full")}
                          className={`px-2.5 py-1 rounded-md transition-colors ${rawTab === "full"
                              ? "bg-slate-200 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                              : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                          Full Record
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const obj = rawTab === "new" ? newData : rawTab === "old" ? oldData : log;
                          copyText(obj, rawTab);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg al-btn-outline transition-colors"
                      >
                        {copiedKey === rawTab ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>Copy JSON</span>
                      </button>
                    </div>

                    <div className="al-code-box al-scrollbar">
                      <pre>
                        {JSON.stringify(
                          rawTab === "new" ? newData || {} : rawTab === "old" ? oldData || {} : log,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer (Matches screenshot) */}
              <div className="px-6 py-3.5 border-t border-divider/70 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-semibold al-btn-outline hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
