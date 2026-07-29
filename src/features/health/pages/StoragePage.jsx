import React, { useState } from "react";
import {
    HardDrive,
    Folder,
    Trash2,
    RefreshCcw,
    Database,
    Image,
    FileArchive,
    FileText,
    Loader2,
} from "lucide-react";
import "../styles/ServerHealth.css";

const DISK_TOTAL_GB = 96.73;
const DISK_USED_GB = 30.39;
const DISK_PERCENT = Math.round((DISK_USED_GB / DISK_TOTAL_GB) * 100);

const BREAKDOWN = [
    { label: "Application Code", size: "1.2 GB", percent: 4, icon: Folder, tone: "blue" },
    { label: "Database", size: "56.78 MB", percent: 1, icon: Database, tone: "violet" },
    { label: "Student Uploads", size: "18.4 GB", percent: 60, icon: Image, tone: "amber" },
    { label: "Backups", size: "8.1 GB", percent: 27, icon: FileArchive, tone: "rose" },
    { label: "Logs & Cache", size: "2.1 GB", percent: 7, icon: FileText, tone: "cyan" },
];

const LARGEST_FOLDERS = [
    { path: "storage/app/public/students/photos", size: "9.8 GB", files: 14230 },
    { path: "storage/app/public/students/documents", size: "6.4 GB", files: 8912 },
    { path: "storage/backups", size: "8.1 GB", files: 42 },
    { path: "storage/logs", size: "1.8 GB", files: 365 },
    { path: "storage/framework/cache", size: "0.3 GB", files: 1204 },
];

const CLEANUP_ACTIONS = [
    {
        key: "cache",
        label: "Clear Application Cache",
        desc: "Removes cached config, routes, and views (safe, rebuilds automatically).",
    },
    {
        key: "logs",
        label: "Purge Old Log Files",
        desc: "Deletes logs older than 30 days.",
    },
    {
        key: "temp",
        label: "Clear Temp Uploads",
        desc: "Removes orphaned temporary files from incomplete uploads.",
    },
];

function ProgressBar({ value, tone = "info" }) {
    return (
        <div className="sh-progress-track w-full h-2.5 rounded-full overflow-hidden">
            <div
                className={`sh-progress-fill-${tone} h-full rounded-full transition-all`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export default function StoragePage() {
    const [runningAction, setRunningAction] = useState(null);

    const handleRun = (key) => {
        setRunningAction(key);
        // Placeholder — wire up the real cleanup API call later.
        setTimeout(() => setRunningAction(null), 1200);
    };

    return (
        <div className="sh-page min-h-screen p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="sh-title-icon-wrap w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                    <HardDrive size={18} />
                </div>
                <h1 className="sh-title-row text-[22px] font-bold">Storage</h1>
            </div>

            {/* Overall usage */}
            <div className="sh-section-card rounded-2xl p-5 mb-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="sh-section-title text-[13px] font-bold uppercase tracking-wide">
                        Disk Usage
                    </span>
                    <span className="sh-row-value text-[13.5px] font-semibold">
                        {DISK_USED_GB} GB of {DISK_TOTAL_GB} GB
                    </span>
                </div>
                <ProgressBar
                    value={DISK_PERCENT}
                    tone={DISK_PERCENT > 85 ? "danger" : DISK_PERCENT > 60 ? "warning" : "info"}
                />
                <p className="sh-progress-caption text-[11px] mt-2">{DISK_PERCENT}% used</p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {BREAKDOWN.map(({ label, size, percent, icon: Icon, tone }) => (
                    <div key={label} className="sh-stat-card rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`sh-tone-${tone}-bg w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
                                <Icon size={16} className={`sh-tone-${tone}-fg`} />
                            </div>
                            <div className="min-w-0">
                                <p className="sh-stat-label text-[12px] truncate">{label}</p>
                                <p className="sh-stat-value text-[15px] font-bold">{size}</p>
                            </div>
                        </div>
                        <ProgressBar value={percent} tone="info" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Largest folders table */}
                <div className="sh-section-card rounded-2xl overflow-hidden">
                    <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide px-5 pt-5 pb-3">
                        <Folder size={15} className="sh-section-icon" /> Largest Folders
                    </h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="sh-thead text-[11px] uppercase tracking-wide">
                                <th className="px-5 py-2.5 font-semibold">Path</th>
                                <th className="px-3 py-2.5 font-semibold text-right">Files</th>
                                <th className="px-3 py-2.5 font-semibold text-right pr-5">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LARGEST_FOLDERS.map((row) => (
                                <tr key={row.path} className="sh-row-hover transition-colors">
                                    <td className="sh-cell px-5 py-2.5 text-[12.5px] font-mono truncate max-w-[220px]">
                                        {row.path}
                                    </td>
                                    <td className="sh-cell-muted px-3 py-2.5 text-[12.5px] text-right">
                                        {row.files.toLocaleString()}
                                    </td>
                                    <td className="sh-cell-strong px-3 py-2.5 text-[12.5px] font-semibold text-right pr-5">
                                        {row.size}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cleanup actions */}
                <div className="sh-section-card rounded-2xl p-5">
                    <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                        <RefreshCcw size={15} className="sh-section-icon" /> Cleanup Actions
                    </h3>
                    <div className="flex flex-col gap-3">
                        {CLEANUP_ACTIONS.map((action) => (
                            <div key={action.key} className="sh-row flex items-center justify-between gap-4 py-3">
                                <div className="min-w-0">
                                    <p className="sh-row-value text-[13.5px] font-semibold">{action.label}</p>
                                    <p className="sh-row-label text-[12px] mt-0.5">{action.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleRun(action.key)}
                                    disabled={runningAction === action.key}
                                    className="sh-btn-outline inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors shrink-0"
                                >
                                    {runningAction === action.key ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={13} />
                                    )}
                                    {runningAction === action.key ? "Running…" : "Run"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}