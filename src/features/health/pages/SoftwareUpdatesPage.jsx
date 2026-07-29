import React, { useState } from "react";
import {
    RefreshCw,
    DownloadCloud,
    CheckCircle2,
    Sparkles,
    Loader2,
    History,
} from "lucide-react";
import "../styles/ServerHealth.css";

const CURRENT_VERSION = "2.4.1";
const LATEST_VERSION = "2.5.0";
const UPDATE_AVAILABLE = CURRENT_VERSION !== LATEST_VERSION;

const CHANGELOG = [
    { type: "feature", text: "Added employee salary structure management with live gross/net computation." },
    { type: "feature", text: "New global module search (Ctrl/⌘+K) in the header." },
    { type: "fix", text: "Fixed document field-name mismatches on the student details page." },
    { type: "fix", text: "Corrected uniqueness-check response parsing for subjects and subject groups." },
    { type: "improvement", text: "Reworked theming to a single CSS-variable source across all modules." },
];

const UPDATE_HISTORY = [
    { version: "2.4.1", date: "12 Jul 2026", status: "completed" },
    { version: "2.4.0", date: "28 Jun 2026", status: "completed" },
    { version: "2.3.2", date: "15 Jun 2026", status: "completed" },
    { version: "2.3.1", date: "02 Jun 2026", status: "failed" },
];

const CHANGE_TONE = {
    feature: "success",
    fix: "danger",
    improvement: "info",
};

export default function SoftwareUpdatesPage() {
    const [checking, setChecking] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleCheck = () => {
        setChecking(true);
        // Placeholder — wire up the real version-check API call later.
        setTimeout(() => setChecking(false), 1200);
    };

    const handleUpdate = () => {
        if (!window.confirm(`Update to v${LATEST_VERSION} now? This may take a few minutes.`)) return;
        setUpdating(true);
        setTimeout(() => setUpdating(false), 2000);
    };

    return (
        <div className="sh-page min-h-screen p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="sh-title-icon-wrap w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                    <DownloadCloud size={18} />
                </div>
                <h1 className="sh-title-row text-[22px] font-bold">Software Updates</h1>
            </div>

            {/* Version summary */}
            <div className="sh-section-card rounded-2xl p-6 mb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${UPDATE_AVAILABLE ? "sh-tone-amber-bg" : "sh-tone-emerald-bg"
                                }`}
                        >
                            {UPDATE_AVAILABLE ? (
                                <Sparkles size={22} className="sh-tone-amber-fg" />
                            ) : (
                                <CheckCircle2 size={22} className="sh-tone-emerald-fg" />
                            )}
                        </div>
                        <div>
                            <p className="sh-row-value text-[16px] font-bold">
                                Current version: v{CURRENT_VERSION}
                            </p>
                            <p className="sh-row-label text-[13px] mt-0.5">
                                {UPDATE_AVAILABLE
                                    ? `A new version (v${LATEST_VERSION}) is available.`
                                    : "You're on the latest version."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            onClick={handleCheck}
                            disabled={checking}
                            className="sh-btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                        >
                            {checking ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <RefreshCw size={15} />
                            )}
                            {checking ? "Checking…" : "Check for Updates"}
                        </button>
                        {UPDATE_AVAILABLE && (
                            <button
                                onClick={handleUpdate}
                                disabled={updating}
                                className="sh-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                            >
                                {updating ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : (
                                    <DownloadCloud size={15} />
                                )}
                                {updating ? "Updating…" : `Update to v${LATEST_VERSION}`}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Changelog */}
                <div className="sh-section-card rounded-2xl p-5">
                    <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                        <Sparkles size={15} className="sh-section-icon" /> What's New in v{LATEST_VERSION}
                    </h3>
                    <ul className="flex flex-col gap-3">
                        {CHANGELOG.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                                <span className={`sh-pill sh-pill-${CHANGE_TONE[item.type]} mt-0.5 shrink-0`}>
                                    {item.type}
                                </span>
                                <span className="sh-cell text-[13px] leading-relaxed">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Update history */}
                <div className="sh-section-card rounded-2xl overflow-hidden">
                    <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide px-5 pt-5 pb-3">
                        <History size={15} className="sh-section-icon" /> Update History
                    </h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="sh-thead text-[11px] uppercase tracking-wide">
                                <th className="px-5 py-2.5 font-semibold">Version</th>
                                <th className="px-3 py-2.5 font-semibold">Applied</th>
                                <th className="px-3 py-2.5 font-semibold text-right pr-5">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {UPDATE_HISTORY.map((row) => (
                                <tr key={row.version} className="sh-row-hover transition-colors">
                                    <td className="sh-cell-strong px-5 py-2.5 text-[13px] font-semibold">
                                        v{row.version}
                                    </td>
                                    <td className="sh-cell-muted px-3 py-2.5 text-[13px]">{row.date}</td>
                                    <td className="px-3 py-2.5 text-right pr-5">
                                        <span
                                            className={`sh-pill sh-pill-${row.status === "completed" ? "success" : "danger"}`}
                                        >
                                            {row.status}
                                        </span>
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