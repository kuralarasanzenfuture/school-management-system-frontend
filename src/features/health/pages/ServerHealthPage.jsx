import React, { useState } from "react";
import {
    HeartPulse,
    Cpu,
    MemoryStick,
    HardDrive,
    FileCode2,
    Stethoscope,
    Plug,
    FileText,
    Database,
    Gauge,
    Layers,
    ShieldCheck,
    Wrench,
    Stethoscope as DiagIcon,
    ScrollText,
} from "lucide-react";
import "../styles/ServerHealth.css";

/* ── Mock data — replace with real API responses when wiring this up ── */
const STATS = [
    { label: "CPU Load", value: "1.24 (1m avg)", icon: Cpu, tone: "cyan" },
    {
        label: "RAM Usage",
        value: "53%",
        sub: "7.8 GB total",
        progress: 53,
        progressTone: "danger",
        icon: MemoryStick,
        tone: "rose",
    },
    {
        label: "Storage",
        value: "31%",
        sub: "30.39 GB of 96.73 GB",
        progress: 31,
        progressTone: "warning",
        icon: HardDrive,
        tone: "amber",
    },
    { label: "PHP Version", value: "8.3.31", icon: FileCode2, tone: "blue" },
];

const MINI_CARDS = [
    {
        label: "Self-Tests",
        value: "Problems detected",
        icon: Stethoscope,
        tone: "rose",
    },
    {
        label: "Hosting Compatibility",
        value: "1 blocking issues",
        icon: Plug,
        tone: "amber",
    },
    { label: "Log Files", value: "5 files (0.4 MB)", icon: FileText, tone: "cyan" },
];

const TABS = [
    { key: "overview", label: "Overview", icon: Database },
    { key: "self-tests", label: "Self-Tests", icon: ShieldCheck },
    { key: "compatibility", label: "Compatibility Matrix", icon: Layers },
    { key: "maintenance", label: "Maintenance", icon: Wrench },
    { key: "diagnostics", label: "Diagnostics", icon: DiagIcon },
    { key: "logs", label: "Log Explorer", icon: ScrollText },
];

const DB_ROWS = [
    ["Engine", "10.11.10-MariaDB-log"],
    ["Active Database", "multischoolv2"],
    ["Total Storage Size", "56.78 MB", "info"],
    ["Estimated Rows", "≈ 65,230", "neutral"],
    ["Status", "Online", "success"],
];

const PHP_EXTENSIONS = [
    "Core", "PDO", "Phar", "Reflection", "SPL", "SimpleXML", "Zend OPcache",
    "bcmath", "cgi-fcgi", "ctype", "curl", "date", "dom", "fileinfo", "filter",
    "ftp", "gd", "gettext", "hash", "iconv", "igbinary", "imap", "intl",
];

function ProgressBar({ value, tone }) {
    return (
        <div className="sh-progress-track w-full h-6 rounded-full overflow-hidden relative">
            <div
                className={`sh-progress-fill-${tone} h-full rounded-full flex items-center justify-center transition-all`}
                style={{ width: `${value}%` }}
            >
                {value >= 25 && (
                    <span className="sh-progress-label text-[11px] font-semibold">
                        Optimal Capacity
                    </span>
                )}
            </div>
        </div>
    );
}

export default function ServerHealthPage() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="sh-page min-h-screen p-6">
            {/* Title */}
            <div className="flex items-center gap-3 mb-6">
                <div className="sh-title-icon-wrap w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                    <HeartPulse size={18} />
                </div>
                <h1 className="sh-title-row text-[22px] font-bold">Server Health</h1>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {STATS.map(({ label, value, sub, icon: Icon, tone }) => (
                    <div key={label} className="sh-stat-card rounded-2xl p-4 flex items-center gap-3.5">
                        <div
                            className={`sh-tone-${tone}-bg w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}
                        >
                            <Icon size={20} className={`sh-tone-${tone}-fg`} />
                        </div>
                        <div className="min-w-0">
                            <p className="sh-stat-label text-[12px]">{label}</p>
                            <p className="sh-stat-value text-[18px] font-bold leading-tight">{value}</p>
                            {sub && <p className="sh-stat-sub text-[11px] mt-0.5">{sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mini status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {MINI_CARDS.map(({ label, value, icon: Icon, tone }) => (
                    <div key={label} className="sh-mini-card rounded-2xl px-4 py-3.5 flex items-center gap-3">
                        <div className={`sh-tone-${tone}-bg w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
                            <Icon size={16} className={`sh-tone-${tone}-fg`} />
                        </div>
                        <div>
                            <p className="sh-mini-label text-[12px]">{label}</p>
                            <p className="sh-mini-value text-[13.5px] font-semibold">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="sh-tabs flex items-center gap-1 mb-6 overflow-x-auto">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`sh-tab flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${activeTab === key ? "sh-tab-active" : ""
                            }`}
                    >
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {activeTab === "overview" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Database Health & Footprint */}
                    <div className="sh-section-card rounded-2xl p-5">
                        <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                            <Database size={15} className="sh-section-icon" /> Database Health &amp; Footprint
                        </h3>
                        <div className="flex flex-col">
                            {DB_ROWS.map(([label, value, pillTone]) => (
                                <div key={label} className="sh-row flex items-center justify-between py-3">
                                    <span className="sh-row-label text-[13.5px]">{label}</span>
                                    {pillTone ? (
                                        <span className={`sh-pill sh-pill-${pillTone}`}>{value}</span>
                                    ) : (
                                        <span className="sh-row-value text-[13.5px] font-semibold">{value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Traffic Capacity Estimator */}
                    <div className="sh-section-card rounded-2xl p-5">
                        <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                            <Gauge size={15} className="sh-section-icon" /> Traffic Capacity Estimator
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <p className="sh-tone-blue-fg text-[26px] font-bold">250</p>
                                <p className="sh-row-label text-[11px] uppercase tracking-wide">
                                    Max Requests / Sec
                                </p>
                            </div>
                            <div>
                                <p className="sh-tone-blue-fg text-[26px] font-bold">2,500</p>
                                <p className="sh-row-label text-[11px] uppercase tracking-wide">
                                    Concurrent Users
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="sh-row-label text-[12px]">RAM Capacity Pressure</span>
                            <span className="sh-row-label text-[12px]">53% used</span>
                        </div>
                        <ProgressBar value={53} tone="success" />
                        <p className="sh-progress-caption text-[11px] mt-2">
                            Theoretical guide only — Laravel needs ~30MB of memory per action.
                        </p>
                    </div>

                    {/* PHP Extensions */}
                    <div className="sh-section-card rounded-2xl p-5 lg:col-span-2">
                        <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                            <Layers size={15} className="sh-section-icon" /> Installed PHP Extensions (
                            {PHP_EXTENSIONS.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {PHP_EXTENSIONS.map((ext) => (
                                <span
                                    key={ext}
                                    className="sh-chip px-2.5 py-1 rounded-md text-[12px] font-medium"
                                >
                                    {ext}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="sh-section-card rounded-2xl p-10 text-center">
                    <p className="sh-empty-state text-[13.5px]">
                        {TABS.find((t) => t.key === activeTab)?.label} — content goes here once wired up.
                    </p>
                </div>
            )}
        </div>
    );
}