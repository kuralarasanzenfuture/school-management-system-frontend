import React from "react";
import {
    UserPlus,
    GraduationCap,
    FileBarChart2,
    BellRing,
} from "lucide-react";
import { quickActions } from "../data/dashboardData.js";

const ICONS = {
    add_student: UserPlus,
    add_teacher: GraduationCap,
    generate_report: FileBarChart2,
    send_notice: BellRing,
};

// Maps the old ledger tone names to gradient tones defined in dashboard.css
const TONE_MAP = {
    ink: "primary",
    moss: "success",
    brass: "warning",
    redink: "accent",
};

export default function QuickActions({ onAction }) {
    return (
        <div className="db-panel">
            <div className="db-panel-head">
                <div>
                    <h3 className="db-panel-title">Quick Actions</h3>
                    <p className="db-panel-subtitle">Frequently used shortcuts</p>
                </div>
            </div>

            <div className="db-actions-grid">
                {quickActions.map((action) => {
                    const Icon = ICONS[action.id];
                    const tone = TONE_MAP[action.tone] || "primary";
                    return (
                        <button
                            key={action.id}
                            className={`db-action-btn tone-${tone}`}
                            onClick={() => onAction?.(action.id)}
                        >
                            <Icon size={22} />
                            <span>{action.title}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}