import React, { useState } from "react";
import {
    Archive,
    Plus,
    Download,
    Trash2,
    RotateCcw,
    CloudUpload,
    Loader2,
} from "lucide-react";
import "../styles/ServerHealth.css";

const BACKUPS = [
    {
        id: 1,
        name: "backup-2026-07-28-0300.zip",
        type: "Full (DB + Files)",
        size: "8.1 GB",
        createdAt: "28 Jul 2026, 03:00 AM",
        status: "completed",
    },
    {
        id: 2,
        name: "backup-2026-07-21-0300.zip",
        type: "Full (DB + Files)",
        size: "7.9 GB",
        createdAt: "21 Jul 2026, 03:00 AM",
        status: "completed",
    },
    {
        id: 3,
        name: "backup-2026-07-14-0300.zip",
        type: "Database only",
        size: "58.2 MB",
        createdAt: "14 Jul 2026, 03:00 AM",
        status: "completed",
    },
    {
        id: 4,
        name: "backup-2026-07-07-0300.zip",
        type: "Full (DB + Files)",
        size: "—",
        createdAt: "07 Jul 2026, 03:00 AM",
        status: "failed",
    },
];

const STATUS_PILL = {
    completed: "success",
    running: "info",
    failed: "danger",
};

export default function BackupsPage() {
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const handleCreateBackup = () => {
        setCreating(true);
        // Placeholder — wire up the real backup-trigger API call later.
        setTimeout(() => setCreating(false), 1500);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Delete this backup? This can't be undone.")) return;
        setDeletingId(id);
        setTimeout(() => setDeletingId(null), 800);
    };

    return (
        <div className="sh-page min-h-screen p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="sh-title-icon-wrap w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                        <Archive size={18} />
                    </div>
                    <h1 className="sh-title-row text-[22px] font-bold">Backups</h1>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={creating}
                    className="sh-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors"
                >
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {creating ? "Creating Backup…" : "Create Backup"}
                </button>
            </div>

            {/* Destination summary */}
            <div className="sh-mini-card rounded-2xl px-5 py-4 flex items-center gap-3.5 mb-5">
                <div className="sh-tone-blue-bg w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                    <CloudUpload size={18} className="sh-tone-blue-fg" />
                </div>
                <div>
                    <p className="sh-mini-label text-[12px]">Backup Destination</p>
                    <p className="sh-mini-value text-[13.5px] font-semibold">
                        Local Storage — 4 backups, 24.1 GB total · Next scheduled: tonight at 3:00 AM
                    </p>
                </div>
            </div>

            {/* Backup history table */}
            <div className="sh-section-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="sh-thead text-[11.5px] uppercase tracking-wide">
                                <th className="px-5 py-3 font-semibold">Backup</th>
                                <th className="px-3 py-3 font-semibold">Type</th>
                                <th className="px-3 py-3 font-semibold">Created</th>
                                <th className="px-3 py-3 font-semibold text-right">Size</th>
                                <th className="px-3 py-3 font-semibold">Status</th>
                                <th className="px-3 py-3 font-semibold text-right pr-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {BACKUPS.map((b) => (
                                <tr key={b.id} className="sh-row-hover transition-colors">
                                    <td className="sh-cell-strong px-5 py-3.5 text-[13px] font-mono">{b.name}</td>
                                    <td className="sh-cell px-3 py-3.5 text-[13px]">{b.type}</td>
                                    <td className="sh-cell-muted px-3 py-3.5 text-[13px]">{b.createdAt}</td>
                                    <td className="sh-cell px-3 py-3.5 text-[13px] text-right">{b.size}</td>
                                    <td className="px-3 py-3.5">
                                        <span className={`sh-pill sh-pill-${STATUS_PILL[b.status]}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center justify-end gap-1 pr-2">
                                            {b.status === "completed" && (
                                                <>
                                                    <button
                                                        title="Download"
                                                        className="sh-btn-outline w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                    <button
                                                        title="Restore"
                                                        className="sh-btn-outline w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                title="Delete"
                                                onClick={() => handleDelete(b.id)}
                                                disabled={deletingId === b.id}
                                                className="sh-btn-danger w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                                            >
                                                {deletingId === b.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}