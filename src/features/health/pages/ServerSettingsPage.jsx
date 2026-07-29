import React, { useState } from "react";
import { Settings, Clock, ServerCog, Mail, Timer, Save, Loader2 } from "lucide-react";
import "../styles/ServerHealth.css";

const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "UTC", "Asia/Singapore"];
const CACHE_DRIVERS = ["file", "redis", "memcached", "database"];
const QUEUE_DRIVERS = ["sync", "database", "redis"];
const MAIL_DRIVERS = ["smtp", "sendmail", "mailgun", "ses"];

function Toggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className="flex items-center gap-3"
        >
            <span
                className={`w-10 h-[22px] rounded-full relative transition-colors ${checked ? "sh-switch-track-on" : "sh-switch-track"
                    }`}
            >
                <span
                    className="sh-switch-thumb absolute top-[3px] w-4 h-4 rounded-full transition-all"
                    style={{ left: checked ? "22px" : "3px" }}
                />
            </span>
            {label && <span className="sh-row-value text-[13.5px] font-medium">{label}</span>}
        </button>
    );
}

function FieldSelect({ label, value, onChange, options }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="sh-field-label text-[13px] font-medium">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="sh-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default function ServerSettingsPage() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [timezone, setTimezone] = useState("Asia/Kolkata");
    const [cacheDriver, setCacheDriver] = useState("file");
    const [queueDriver, setQueueDriver] = useState("database");
    const [mailDriver, setMailDriver] = useState("smtp");
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        // Placeholder — wire up the real settings-save API call later.
        setTimeout(() => setSaving(false), 1000);
    };

    return (
        <div className="sh-page min-h-screen p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="sh-title-icon-wrap w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                        <Settings size={18} />
                    </div>
                    <h1 className="sh-title-row text-[22px] font-bold">Server Settings</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="sh-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors"
                >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {saving ? "Saving…" : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* General */}
                <div className="sh-section-card rounded-2xl p-5">
                    <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                        <Clock size={15} className="sh-section-icon" /> General
                    </h3>
                    <div className="flex flex-col gap-4">
                        <FieldSelect
                            label="Server Timezone"
                            value={timezone}
                            onChange={setTimezone}
                            options={TIMEZONES}
                        />
                        <div className="sh-row flex items-center justify-between py-3">
                            <div>
                                <p className="sh-row-value text-[13.5px] font-semibold">Maintenance Mode</p>
                                <p className="sh-row-label text-[12px] mt-0.5">
                                    Temporarily takes the site offline for everyone except admins.
                                </p>
                            </div>
                            <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="sh-row-value text-[13.5px] font-semibold">Debug Mode</p>
                                <p className="sh-row-label text-[12px] mt-0.5">
                                    Shows detailed error pages. Keep off in production.
                                </p>
                            </div>
                            <Toggle checked={debugMode} onChange={setDebugMode} />
                        </div>
                    </div>
                </div>

                {/* Drivers */}
                <div className="sh-section-card rounded-2xl p-5">
                    <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                        <ServerCog size={15} className="sh-section-icon" /> Drivers
                    </h3>
                    <div className="flex flex-col gap-4">
                        <FieldSelect
                            label="Cache Driver"
                            value={cacheDriver}
                            onChange={setCacheDriver}
                            options={CACHE_DRIVERS}
                        />
                        <FieldSelect
                            label="Queue Driver"
                            value={queueDriver}
                            onChange={setQueueDriver}
                            options={QUEUE_DRIVERS}
                        />
                        <FieldSelect
                            label="Mail Driver"
                            value={mailDriver}
                            onChange={setMailDriver}
                            options={MAIL_DRIVERS}
                        />
                    </div>
                </div>

                {/* Cron / Scheduler status */}
                <div className="sh-section-card rounded-2xl p-5 lg:col-span-2">
                    <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                        <Timer size={15} className="sh-section-icon" /> Scheduler &amp; Queue Status
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sh-row-hover rounded-xl p-3.5 flex items-center justify-between border sh-mini-card">
                            <div>
                                <p className="sh-row-label text-[11px] uppercase tracking-wide">Cron Scheduler</p>
                                <p className="sh-row-value text-[13.5px] font-semibold mt-0.5">Last run 4m ago</p>
                            </div>
                            <span className="sh-pill sh-pill-success">Running</span>
                        </div>
                        <div className="sh-row-hover rounded-xl p-3.5 flex items-center justify-between border sh-mini-card">
                            <div>
                                <p className="sh-row-label text-[11px] uppercase tracking-wide">Queue Worker</p>
                                <p className="sh-row-value text-[13.5px] font-semibold mt-0.5">128 jobs / hr</p>
                            </div>
                            <span className="sh-pill sh-pill-success">Running</span>
                        </div>
                        <div className="sh-row-hover rounded-xl p-3.5 flex items-center justify-between border sh-mini-card">
                            <div>
                                <p className="sh-row-label text-[11px] uppercase tracking-wide">Failed Jobs</p>
                                <p className="sh-row-value text-[13.5px] font-semibold mt-0.5">3 in queue</p>
                            </div>
                            <span className="sh-pill sh-pill-warning">Attention</span>
                        </div>
                    </div>
                </div>

                {/* Mail test */}
                <div className="sh-section-card rounded-2xl p-5 lg:col-span-2">
                    <h3 className="sh-section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide mb-4">
                        <Mail size={15} className="sh-section-icon" /> Test Mail Delivery
                    </h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="sh-field-label text-[13px] font-medium">Send test email to</label>
                            <input
                                type="email"
                                placeholder="admin@school.in"
                                className="sh-input w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-all"
                            />
                        </div>
                        <button className="sh-btn-outline px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors shrink-0">
                            Send Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}