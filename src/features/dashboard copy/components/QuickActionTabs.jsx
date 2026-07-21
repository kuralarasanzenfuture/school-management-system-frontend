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

export default function QuickActionTabs({ onAction }) {
  return (
    <div className="db-panel">
      <div className="db-panel-head">
        <div>
          <h3 className="db-panel-title">Quick Actions</h3>
          <p className="db-panel-subtitle">Frequently used shortcuts</p>
        </div>
      </div>

      <div className="db-catalog">
        {quickActions.map((action) => {
          const Icon = ICONS[action.id];
          return (
            <button
              key={action.id}
              className="db-catalog-card"
              onClick={() => onAction?.(action.id)}
            >
              <span className={`db-catalog-tab tone-${action.tone}`}>
                {action.tab}
              </span>
              <Icon size={20} className="db-catalog-icon" />
              <p className="db-catalog-title">{action.title}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}